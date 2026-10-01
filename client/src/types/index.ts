export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  parentId?: string | null;
  sortOrder: number;
  active: boolean;
  children?: Category[];
  parent?: Category;
  _count?: {
    products: number;
  };
}

export interface ProductImage {
  id: string;
  imageUrl: string;
  altText?: string;
  isPrimary: boolean;
  sortOrder: number;
}

export interface ProductSpecification {
  id: string;
  name: string;
  value: string;
  sortOrder: number;
}

export interface ProductFeature {
  id: string;
  feature: string;
  sortOrder: number;
}

export interface Inventory {
  id: string;
  quantity: number;
  reservedQuantity: number;
  availableQuantity: number;
  lowStockThreshold: number;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  sku: string;
  description: string;
  shortDescription?: string;
  mrp: number;
  salePrice: number;
  discount: number;
  brand: string;
  categoryId: string;
  category?: Category;
  active: boolean;
  featured: boolean;
  seoTitle?: string;
  seoDescription?: string;
  images: ProductImage[];
  specifications: ProductSpecification[];
  features: ProductFeature[];
  inventory?: Inventory;
  createdAt: string;
}

export interface CartItem {
  id: string;
  productId: string;
  product: Product;
  quantity: number;
  currentPrice: number;
  itemTotal: number;
  availableStock: number;
  isAvailable: boolean;
}

export interface Cart {
  id: string;
  items: CartItem[];
  subtotal: number;
  totalItems: number;
}

export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  sku: string;
  price: number;
  quantity: number;
  total: number;
  product?: Product;
}

export interface ShippingAddress {
  name: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  district: string;
  state: string;
  pincode: string;
  landmark?: string;
}

export type OrderStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'PROCESSING'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'CANCELLED'
  | 'RETURN_REQUESTED'
  | 'RETURNED';

export type PaymentMethod = 'RAZORPAY' | 'COD' | 'UPI' | 'CARD' | 'NETBANKING';
export type PaymentStatus = 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';

export interface Order {
  id: string;
  orderNumber: string;
  customerId?: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;
  subtotal: number;
  discount: number;
  shippingAmount: number;
  totalAmount: number;
  currency: string;
  shippingAddressSnapshot: ShippingAddress;
  notes?: string;
  items: OrderItem[];
  customer?: {
    name: string;
    email: string;
    phone: string;
  };
  createdAt: string;
}

export interface Banner {
  id: string;
  title: string;
  subtitle?: string;
  imageUrl: string;
  link?: string;
  active: boolean;
  sortOrder: number;
}

export interface Coupon {
  id: string;
  code: string;
  type: 'PERCENTAGE' | 'FIXED_AMOUNT';
  value: number;
  minimumOrderAmount: number;
  maximumDiscount?: number;
  active: boolean;
}

export interface AdminMetrics {
  totalRevenue: number;
  totalOrders: number;
  totalCustomers: number;
  totalProducts: number;
  lowStockCount: number;
  pendingOrdersCount: number;
  recentOrders: Order[];
  totalStockUnits: number;
  reservedStockUnits: number;
  statusBreakdown: Record<string, number>;
}
