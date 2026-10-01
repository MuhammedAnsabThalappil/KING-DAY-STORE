import { prisma } from '../config/prisma.js';

export class CartService {
  static async getOrCreateCart(customerId?: string, sessionId?: string) {
    if (!customerId && !sessionId) {
      throw new Error('Either customerId or sessionId must be provided to access cart');
    }

    let cart = await prisma.cart.findFirst({
      where: customerId ? { customerId } : { sessionId },
      include: {
        items: {
          include: {
            product: {
              include: {
                images: { orderBy: [{ isPrimary: 'desc' }, { sortOrder: 'asc' }] },
                inventory: true
              }
            },
            variant: true
          }
        }
      }
    });

    if (!cart) {
      cart = await prisma.cart.create({
        data: {
          customerId: customerId || null,
          sessionId: sessionId || null
        },
        include: {
          items: {
            include: {
              product: {
                include: {
                  images: { orderBy: [{ isPrimary: 'desc' }, { sortOrder: 'asc' }] },
                  inventory: true
                }
              },
              variant: true
            }
          }
        }
      });
    }

    // Server-side validation of stock and current price calculation
    let subtotal = 0;
    const validatedItems = cart.items.map((item: any) => {
      const price = item.variant ? Number(item.variant.price) : Number(item.product.salePrice);
      const stock = item.product.inventory?.availableQuantity ?? 0;
      const isAvailable = item.product.active && stock >= item.quantity;
      const total = price * item.quantity;
      if (isAvailable) subtotal += total;

      return {
        ...item,
        currentPrice: price,
        itemTotal: total,
        availableStock: stock,
        isAvailable
      };
    });

    return {
      id: cart.id,
      customerId: cart.customerId,
      sessionId: cart.sessionId,
      items: validatedItems,
      subtotal,
      totalItems: validatedItems.reduce((acc: number, curr: any) => acc + curr.quantity, 0)
    };
  }

  static async addItemToCart(
    cartId: string,
    productId: string,
    quantity: number = 1,
    variantId?: string
  ) {
    // 1. Verify product exists & active
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: { inventory: true }
    });

    if (!product || !product.active) {
      throw new Error('Product is unavailable or inactive');
    }

    // 2. Check stock
    const availableStock = product.inventory?.availableQuantity ?? 0;
    if (availableStock < quantity) {
      throw new Error(`Insufficient stock available (${availableStock} in stock)`);
    }

    // 3. Upsert item into cart
    const existingItem = await prisma.cartItem.findFirst({
      where: {
        cartId,
        productId,
        variantId: variantId || null
      }
    });

    if (existingItem) {
      const newQty = existingItem.quantity + quantity;
      if (availableStock < newQty) {
        throw new Error(`Cannot add more than available stock (${availableStock})`);
      }
      await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: newQty }
      });
    } else {
      await prisma.cartItem.create({
        data: {
          cartId,
          productId,
          variantId: variantId || null,
          quantity
        }
      });
    }

    return await this.getOrCreateCart(undefined, undefined);
  }

  static async updateItemQuantity(cartItemId: string, quantity: number) {
    if (quantity <= 0) {
      return await prisma.cartItem.delete({ where: { id: cartItemId } });
    }

    const item = await prisma.cartItem.findUnique({
      where: { id: cartItemId },
      include: { product: { include: { inventory: true } } }
    });

    if (!item) {
      throw new Error('Cart item not found');
    }

    const availableStock = item.product.inventory?.availableQuantity ?? 0;
    if (availableStock < quantity) {
      throw new Error(`Requested quantity exceeds available stock (${availableStock})`);
    }

    return await prisma.cartItem.update({
      where: { id: cartItemId },
      data: { quantity }
    });
  }

  static async removeItem(cartItemId: string) {
    return await prisma.cartItem.delete({
      where: { id: cartItemId }
    });
  }

  static async clearCart(cartId: string) {
    return await prisma.cartItem.deleteMany({
      where: { cartId }
    });
  }
}
