import { Router } from 'express';
import { getHealth } from '../controllers/healthController.js';
import { login, getCurrentUser } from '../controllers/authController.js';
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
  updateOrderStatus,
  cancelOrder
} from '../controllers/orderController.js';
import { createPaymentOrder, verifyPayment } from '../controllers/paymentController.js';
import { validateCoupon, getCoupons, createCoupon } from '../controllers/couponController.js';
import { getBanners, createBanner, deleteBanner } from '../controllers/bannerController.js';
import { getDashboardMetrics } from '../controllers/adminController.js';
import { uploadImage } from '../controllers/uploadController.js';
import { uploadMiddleware } from '../config/storage.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

// Health check
router.get('/health', getHealth);

// Auth
router.post('/auth/login', login);
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

// Inventory
router.get('/inventory', authenticate, getInventoryOverview);
router.get('/inventory/transactions', authenticate, getInventoryTransactions);
router.get('/inventory/transactions/:productId', authenticate, getInventoryTransactions);
router.post('/inventory/adjust', authenticate, adjustStock);

// Cart
router.get('/cart', getCart);
router.post('/cart/items', addToCart);
router.put('/cart/items/:id', updateCartItem);
router.delete('/cart/items/:id', removeCartItem);
router.post('/cart/clear', clearCart);

// Wishlist
router.get('/wishlist', getWishlist);
router.post('/wishlist/toggle', toggleWishlist);

// Orders
router.post('/orders', createOrder);
router.get('/orders', getOrders);
router.get('/orders/:id', getOrderById);
router.patch('/orders/:id/status', authenticate, updateOrderStatus);
router.post('/orders/:id/cancel', cancelOrder);

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

// Uploads
router.post('/uploads', authenticate, uploadMiddleware.single('image'), uploadImage);

export default router;
