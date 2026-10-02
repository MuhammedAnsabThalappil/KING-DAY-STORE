import { prisma } from '../config/prisma.js';
import { OrderStatus, PaymentMethod, PaymentStatus, TransactionType } from '@prisma/client';

export interface CreateOrderPayload {
  customerId?: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: {
    name: string;
    phone: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    district: string;
    state: string;
    pincode: string;
    landmark?: string;
  };
  paymentMethod: PaymentMethod;
  couponCode?: string;
  notes?: string;
  items: Array<{
    productId: string;
    variantId?: string;
    quantity: number;
  }>;
}

export class OrderService {
  static async createOrder(payload: CreateOrderPayload) {
    const {
      customerId,
      customerName,
      customerEmail,
      customerPhone,
      shippingAddress,
      paymentMethod,
      couponCode,
      notes,
      items
    } = payload;

    return await prisma.$transaction(async (tx: any) => {
      // 1. Resolve or create Customer record
      let customer = null;
      if (customerId) {
        customer = await tx.customer.findUnique({ where: { id: customerId } });
      } else {
        customer = await tx.customer.findFirst({
          where: { OR: [{ email: customerEmail }, { phone: customerPhone }] }
        });
        if (!customer) {
          customer = await tx.customer.create({
            data: {
              name: customerName,
              email: customerEmail,
              phone: customerPhone,
              active: true
            }
          });
        }
      }

      // 2. Validate items & calculate exact server-side pricing
      let subtotal = 0;
      const orderItemDatas = [];

      for (const item of items) {
        const product = await tx.product.findUnique({
          where: { id: item.productId },
          include: { inventory: true }
        });

        if (!product || !product.active) {
          throw new Error(`Product "${product?.name || item.productId}" is no longer available.`);
        }

        const availableStock = product.inventory?.availableQuantity ?? 0;
        if (availableStock < item.quantity) {
          throw new Error(`Insufficient stock for "${product.name}". Available: ${availableStock}`);
        }

        const unitPrice = Number(product.salePrice);
        const itemDiscount = 0;
        const total = unitPrice * item.quantity;
        subtotal += total;

        orderItemDatas.push({
          productId: product.id,
          variantId: item.variantId || null,
          productName: product.name,
          sku: product.sku,
          price: unitPrice,
          quantity: item.quantity,
          discount: itemDiscount,
          total
        });

        // Reserve/Deduct inventory
        const newAvailable = availableStock - item.quantity;
        const newReserved = (product.inventory?.reservedQuantity || 0) + item.quantity;

        await tx.inventory.update({
          where: { productId: product.id },
          data: {
            availableQuantity: newAvailable,
            reservedQuantity: newReserved
          }
        });

        await tx.inventoryTransaction.create({
          data: {
            productId: product.id,
            type: TransactionType.SALE,
            quantity: item.quantity,
            previousQuantity: product.inventory?.quantity || 0,
            newQuantity: (product.inventory?.quantity || 0) - item.quantity,
            referenceType: 'ORDER_RESERVATION',
            note: `Stock reserved for new order`
          }
        });
      }

      // 3. Process Coupon if provided
      let discountAmount = 0;
      let couponId = null;
      if (couponCode) {
        const coupon = await tx.coupon.findUnique({
          where: { code: couponCode.toUpperCase() }
        });
        if (coupon && coupon.active) {
          if (subtotal >= Number(coupon.minimumOrderAmount)) {
            if (coupon.type === 'PERCENTAGE') {
              discountAmount = (subtotal * Number(coupon.value)) / 100;
              if (coupon.maximumDiscount && discountAmount > Number(coupon.maximumDiscount)) {
                discountAmount = Number(coupon.maximumDiscount);
              }
            } else {
              discountAmount = Number(coupon.value);
            }
            couponId = coupon.id;
          }
        }
      }

      const shippingAmount = subtotal > 4999 ? 0 : 150; // Free shipping above ₹4999
      const totalAmount = Math.max(0, subtotal - discountAmount + shippingAmount);

      // 4. Generate unique Order Number
      const randomSuffix = Math.floor(1000 + Math.random() * 9000);
      const datePrefix = new Date().toISOString().slice(0, 10).replace(/-/g, '');
      const orderNumber = `KD-${datePrefix}-${randomSuffix}`;

      // 5. Create Order database record
      const order = await tx.order.create({
        data: {
          orderNumber,
          customerId: customer?.id || null,
          status: OrderStatus.PENDING,
          paymentStatus: paymentMethod === PaymentMethod.COD ? PaymentStatus.PENDING : PaymentStatus.PENDING,
          paymentMethod,
          subtotal,
          discount: discountAmount,
          shippingAmount,
          totalAmount,
          currency: 'INR',
          shippingAddressSnapshot: shippingAddress,
          notes,
          items: {
            create: orderItemDatas
          },
          payments: {
            create: {
              provider: paymentMethod === PaymentMethod.RAZORPAY ? 'RAZORPAY' : paymentMethod === PaymentMethod.WHATSAPP ? 'WHATSAPP' : 'COD',
              amount: totalAmount,
              currency: 'INR',
              method: paymentMethod,
              status: PaymentStatus.PENDING
            }
          }
        },
        include: {
          items: true,
          customer: true,
          payments: true
        }
      });

      // Record coupon usage
      if (couponId) {
        await tx.couponUsage.create({
          data: {
            couponId,
            customerId: customer?.id || null,
            orderId: order.id,
            discountAmount
          }
        });

        await tx.coupon.update({
          where: { id: couponId },
          data: { usedCount: { increment: 1 } }
        });
      }

      return order;
    }, {
      maxWait: 10000,
      timeout: 20000
    });
  }

  static async getOrderById(orderIdOrNumber: string) {
    return await prisma.order.findFirst({
      where: {
        OR: [
          { id: orderIdOrNumber },
          { orderNumber: orderIdOrNumber }
        ]
      },
      include: {
        items: {
          include: {
            product: {
              include: {
                images: { orderBy: [{ isPrimary: 'desc' }, { sortOrder: 'asc' }] }
              }
            }
          }
        },
        customer: true,
        payments: true,
        refunds: true
      }
    });
  }

  static async getOrders(query: {
    customerId?: string;
    status?: OrderStatus;
    paymentStatus?: PaymentStatus;
    search?: string;
    page?: number;
    limit?: number;
  }) {
    const { customerId, status, paymentStatus, search, page = 1, limit = 15 } = query;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (customerId) where.customerId = customerId;
    if (status) where.status = status;
    if (paymentStatus) where.paymentStatus = paymentStatus;

    if (search) {
      where.OR = [
        { orderNumber: { contains: search, mode: 'insensitive' } },
        { customer: { name: { contains: search, mode: 'insensitive' } } },
        { customer: { phone: { contains: search, mode: 'insensitive' } } }
      ];
    }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          items: true,
          customer: true,
          payments: { orderBy: { createdAt: 'desc' }, take: 1 }
        }
      }),
      prisma.order.count({ where })
    ]);

    return {
      orders,
      pagination: { total, page, limit, totalPages: Math.ceil(total / limit) }
    };
  }

  static async updateOrderStatus(orderId: string, status: OrderStatus) {
    return await prisma.$transaction(async (tx: any) => {
      const order = await tx.order.findUnique({
        where: { id: orderId },
        include: { items: true }
      });

      if (!order) {
        throw new Error('Order not found');
      }

      // If cancelling an order, release reserved stock
      if (status === OrderStatus.CANCELLED && order.status !== OrderStatus.CANCELLED) {
        for (const item of order.items) {
          const inv = await tx.inventory.findUnique({ where: { productId: item.productId } });
          if (inv) {
            const newReserved = Math.max(0, inv.reservedQuantity - item.quantity);
            const newQuantity = inv.quantity + item.quantity;
            const newAvailable = newQuantity - newReserved;

            await tx.inventory.update({
              where: { productId: item.productId },
              data: {
                quantity: newQuantity,
                reservedQuantity: newReserved,
                availableQuantity: newAvailable
              }
            });

            await tx.inventoryTransaction.create({
              data: {
                productId: item.productId,
                type: TransactionType.CANCELLATION,
                quantity: item.quantity,
                previousQuantity: inv.quantity,
                newQuantity,
                referenceType: 'ORDER_CANCELLED',
                referenceId: order.id,
                note: `Stock restored from cancelled order #${order.orderNumber}`
              }
            });
          }
        }
      }

      const updated = await tx.order.update({
        where: { id: orderId },
        data: { status },
        include: { items: true, customer: true }
      });

      return updated;
    });
  }
}
