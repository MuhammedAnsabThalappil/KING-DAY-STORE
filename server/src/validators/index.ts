import { z } from 'zod';

export const createProductSchema = z.object({
  name: z.string().min(2, 'Product name must be at least 2 characters'),
  sku: z.string().min(3, 'SKU must be at least 3 characters'),
  slug: z.string().optional(),
  brand: z.string().default('KING DAY'),
  categoryId: z.string().uuid('Invalid Category ID'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  shortDescription: z.string().optional(),
  mrp: z.number().positive('MRP must be a positive number'),
  salePrice: z.number().positive('Sale price must be a positive number'),
  stock: z.number().int().nonnegative('Stock cannot be negative').default(10),
  lowStockThreshold: z.number().int().nonnegative().default(5),
  featured: z.boolean().default(false),
  active: z.boolean().default(true),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
  images: z.array(z.object({
    imageUrl: z.string().url('Invalid image URL'),
    altText: z.string().optional(),
    isPrimary: z.boolean().default(false),
    sortOrder: z.number().default(0)
  })).optional(),
  specifications: z.array(z.object({
    name: z.string(),
    value: z.string(),
    sortOrder: z.number().default(0)
  })).optional(),
  features: z.array(z.string()).optional()
});

export const updateProductSchema = createProductSchema.partial();

export const createCategorySchema = z.object({
  name: z.string().min(2, 'Category name must be at least 2 characters'),
  slug: z.string().optional(),
  description: z.string().optional(),
  imageUrl: z.string().optional(),
  parentId: z.string().uuid().nullable().optional(),
  sortOrder: z.number().int().default(0),
  active: z.boolean().default(true)
});

export const updateCategorySchema = createCategorySchema.partial();

export const createOrderSchema = z.object({
  customerId: z.string().optional(),
  customerName: z.string().min(2, 'Customer name required'),
  customerEmail: z.string().email('Valid email required'),
  customerPhone: z.string().min(10, 'Valid 10-digit phone number required'),
  shippingAddress: z.object({
    name: z.string(),
    phone: z.string(),
    addressLine1: z.string().min(5),
    addressLine2: z.string().optional(),
    city: z.string(),
    district: z.string(),
    state: z.string(),
    pincode: z.string().length(6, 'Pincode must be 6 digits'),
    landmark: z.string().optional()
  }),
  paymentMethod: z.enum(['RAZORPAY', 'COD', 'UPI', 'CARD', 'NETBANKING']),
  couponCode: z.string().optional(),
  notes: z.string().optional(),
  items: z.array(z.object({
    productId: z.string(),
    variantId: z.string().optional(),
    quantity: z.number().int().positive()
  })).min(1, 'Order must contain at least one product item')
});

export const inventoryAdjustmentSchema = z.object({
  type: z.enum(['PURCHASE', 'SALE', 'RETURN', 'DAMAGE', 'ADJUSTMENT', 'CANCELLATION']),
  quantity: z.number().int(),
  note: z.string().optional()
});

export const createCouponSchema = z.object({
  code: z.string().min(3).toUpperCase(),
  type: z.enum(['PERCENTAGE', 'FIXED_AMOUNT']),
  value: z.number().positive(),
  minimumOrderAmount: z.number().nonnegative().default(0),
  maximumDiscount: z.number().positive().optional(),
  usageLimit: z.number().int().positive().optional(),
  expiresAt: z.string().datetime().optional(),
  active: z.boolean().default(true)
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
});

export const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(10),
  password: z.string().min(6)
});

export const createReviewSchema = z.object({
  productId: z.string(),
  rating: z.number().int().min(1).max(5),
  title: z.string().min(3),
  comment: z.string().min(5),
  customerName: z.string().optional()
});
