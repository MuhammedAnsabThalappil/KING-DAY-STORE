import { Router } from 'express';
import { getHealth } from '../controllers/healthController.js';
import { login, logoutAdmin, getCurrentUser } from '../controllers/authController.js';
import {
  getProducts,
  getProductByIdOrSlug,
  createProduct,
  updateProduct,
  deleteProduct
} from '../controllers/productController.js';
import {
  getCategories,
  getCategoryByIdOrSlug,
  createCategory,
  updateCategory,
  deleteCategory
} from '../controllers/categoryController.js';
import {
  getInventoryOverview,
  getInventoryTransactions,
  adjustStock
} from '../controllers/inventoryController.js';
import {
  getCart,
  addToCart,
  updateCartItem,
  removeCartItem,
  clearCart
} from '../controllers/cartController.js';
import { getWishlist, toggleWishlist } from '../controllers/wishlistController.js';
import {
  createOrder,
  getOrders,
  getOrderById,
  trackOrderByNumber,
  updateOrderStatus,
  cancelOrder
} from '../controllers/orderController.js';
import { createPaymentOrder, verifyPayment } from '../controllers/paymentController.js';
import { validateCoupon, getCoupons, createCoupon } from '../controllers/couponController.js';
import { getBanners, createBanner, deleteBanner } from '../controllers/bannerController.js';
import { getDashboardMetrics } from '../controllers/adminController.js';
import { processAiProductAssistant } from '../controllers/aiController.js';
import { uploadImage } from '../controllers/uploadController.js';
import { getCustomers } from '../controllers/customerController.js';
import { uploadMiddleware } from '../config/storage.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

// Health check
router.get('/health', getHealth);

// Auth
router.post('/auth/login', login);
router.post('/auth/admin/logout', logoutAdmin);
router.get('/auth/me', authenticate, getCurrentUser);

// Products
router.get('/products', getProducts);
router.get('/products/:id', getProductByIdOrSlug);
router.post('/products', authenticate, createProduct);
router.put('/products/:id', authenticate, updateProduct);
router.delete('/products/:id', authenticate, deleteProduct);

// Categories
router.get('/categories', getCategories);
router.get('/categories/:id', getCategoryByIdOrSlug);
router.post('/categories', authenticate, createCategory);
router.put('/categories/:id', authenticate, updateCategory);
router.delete('/categories/:id', authenticate, deleteCategory);

// Inventory (admin-only)
router.get('/inventory', authenticate, getInventoryOverview);
router.get('/inventory/transactions', authenticate, getInventoryTransactions);
router.get('/inventory/transactions/:productId', authenticate, getInventoryTransactions);
router.post('/inventory/adjust', authenticate, adjustStock);

// Cart (session-based, no auth required)
router.get('/cart', getCart);
router.post('/cart/items', addToCart);
router.put('/cart/items/:id', updateCartItem);
router.delete('/cart/items/:id', removeCartItem);
router.post('/cart/clear', clearCart);

// Wishlist (session-based, no auth required)
router.get('/wishlist', getWishlist);
router.post('/wishlist/toggle', toggleWishlist);

// Orders
// Public: create order (checkout) and track a single order by orderNumber + phone
router.post('/orders', createOrder);
router.get('/orders/track', trackOrderByNumber); // public order tracking
// Admin-only: list all orders, get full order by id, update status
router.get('/orders', authenticate, getOrders);
router.get('/orders/:id', authenticate, getOrderById);
router.patch('/orders/:id/status', authenticate, updateOrderStatus);
router.post('/orders/:id/cancel', authenticate, cancelOrder);

// Payments
router.post('/payments/create-order', createPaymentOrder);
router.post('/payments/verify', verifyPayment);

// Coupons
router.get('/coupons', getCoupons);
router.post('/coupons/validate', validateCoupon);
router.post('/coupons', authenticate, createCoupon);

// Banners
router.get('/banners', getBanners);
router.post('/banners', authenticate, createBanner);
router.delete('/banners/:id', authenticate, deleteBanner);

// Admin
router.get('/admin/metrics', authenticate, getDashboardMetrics);
router.post('/admin/ai/product-assistant', authenticate, processAiProductAssistant);

// Customers (admin-only)
router.get('/customers', authenticate, getCustomers);

// Uploads (admin-only)
router.post('/uploads', authenticate, uploadMiddleware.single('image'), uploadImage);

export default router;
