import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { fetchApi } from '../api/client';
import { Cart, Product, Coupon } from '../types';
import { useToast } from './ToastContext';

// ---------------------------------------------------------------------------
// Wishlist for GUEST users is stored in localStorage only.
// The backend Wishlist model requires a valid Customer FK — a session string
// cannot satisfy that constraint. We only call the backend wishlist API when
// a real customer is authenticated (future feature).
// ---------------------------------------------------------------------------

const WISHLIST_KEY = 'kd_wishlist_products';

function loadLocalWishlist(): Product[] {
  try {
    const raw = localStorage.getItem(WISHLIST_KEY);
    return raw ? (JSON.parse(raw) as Product[]) : [];
  } catch {
    return [];
  }
}

function saveLocalWishlist(items: Product[]) {
  try {
    localStorage.setItem(WISHLIST_KEY, JSON.stringify(items));
  } catch {
    // ignore storage quota errors
  }
}

// ---------------------------------------------------------------------------

interface CartContextType {
  cart: Cart | null;
  wishlist: Product[];
  loading: boolean;
  addToCart: (productId: string, quantity?: number, variantId?: string) => Promise<boolean>;
  updateQuantity: (cartItemId: string, quantity: number) => Promise<boolean>;
  removeFromCart: (cartItemId: string) => Promise<boolean>;
  clearCart: () => Promise<boolean>;
  toggleWishlist: (product: Product) => Promise<boolean>;
  isInWishlist: (productId: string) => boolean;
  appliedCoupon: Coupon | null;
  applyCoupon: (code: string) => Promise<{ success: boolean; message: string }>;
  removeCoupon: () => void;
  discountAmount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { toast } = useToast();
  const [cart, setCart] = useState<Cart | null>(null);
  const [wishlist, setWishlist] = useState<Product[]>(loadLocalWishlist);
  const [loading, setLoading] = useState<boolean>(true);
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [discountAmount, setDiscountAmount] = useState<number>(0);

  // Stable session ID — stored in localStorage, never sent as customerId FK
  const getSessionId = useCallback((): string => {
    let sid = localStorage.getItem('kd_session_id');
    if (!sid) {
      sid = 'sess_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9);
      localStorage.setItem('kd_session_id', sid);
    }
    return sid;
  }, []);

  // Persist wishlist to localStorage whenever it changes
  useEffect(() => {
    saveLocalWishlist(wishlist);
  }, [wishlist]);

  const fetchCart = useCallback(async () => {
    const sid = getSessionId();
    const res = await fetchApi<Cart>(`/cart?sessionId=${encodeURIComponent(sid)}`);
    if (res.success && res.data) {
      setCart(res.data);
    }
  }, [getSessionId]);

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await fetchCart();
      setLoading(false);
    };
    init();
  }, [fetchCart]);

  const addToCart = async (productId: string, quantity = 1, variantId?: string): Promise<boolean> => {
    const sid = getSessionId();
    const res = await fetchApi<Cart>('/cart/items', {
      method: 'POST',
      body: JSON.stringify({ productId, quantity, variantId, sessionId: sid })
    });

    if (res.success && res.data) {
      setCart(res.data);
      toast.success('Added to cart');
      return true;
    }
    toast.error(res.error?.message || 'Failed to add item to cart');
    return false;
  };

  const updateQuantity = async (cartItemId: string, quantity: number): Promise<boolean> => {
    const res = await fetchApi(`/cart/items/${cartItemId}`, {
      method: 'PUT',
      body: JSON.stringify({ quantity })
    });

    if (res.success) {
      await fetchCart();
      toast.info('Cart updated');
      return true;
    }
    toast.error(res.error?.message || 'Failed to update cart');
    return false;
  };

  const removeFromCart = async (cartItemId: string): Promise<boolean> => {
    const res = await fetchApi(`/cart/items/${cartItemId}`, { method: 'DELETE' });
    if (res.success) {
      await fetchCart();
      toast.info('Removed from cart');
      return true;
    }
    return false;
  };

  const clearCart = async (): Promise<boolean> => {
    if (!cart) return false;
    const res = await fetchApi('/cart/clear', {
      method: 'POST',
      body: JSON.stringify({ cartId: cart.id })
    });

    if (res.success) {
      await fetchCart();
      setAppliedCoupon(null);
      setDiscountAmount(0);
      return true;
    }
    return false;
  };

  // Guest wishlist — local only, no backend FK violation
  const toggleWishlist = async (product: Product): Promise<boolean> => {
    const isSaved = wishlist.some((p) => p.id === product.id);
    if (isSaved) {
      setWishlist((prev) => prev.filter((p) => p.id !== product.id));
      toast.info('Removed from wishlist');
    } else {
      setWishlist((prev) => [...prev, product]);
      toast.success('Saved to wishlist ❤️');
    }
    return true;
  };

  const isInWishlist = (productId: string) => wishlist.some((p) => p.id === productId);

  const applyCoupon = async (code: string): Promise<{ success: boolean; message: string }> => {
    if (!cart || cart.subtotal === 0) {
      return { success: false, message: 'Cart is empty' };
    }

    const res = await fetchApi<{
      code: string;
      type: 'PERCENTAGE' | 'FIXED_AMOUNT';
      value: number;
      discountAmount: number;
    }>('/coupons/validate', {
      method: 'POST',
      body: JSON.stringify({ code, cartAmount: cart.subtotal })
    });

    if (res.success && res.data) {
      setAppliedCoupon({
        id: res.data.code,
        code: res.data.code,
        type: res.data.type,
        value: res.data.value,
        minimumOrderAmount: 0,
        active: true
      });
      setDiscountAmount(res.data.discountAmount);
      return { success: true, message: `Coupon "${code}" applied — saving ₹${res.data.discountAmount.toLocaleString('en-IN')}!` };
    }

    return { success: false, message: res.error?.message || 'Invalid or expired coupon code' };
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setDiscountAmount(0);
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        wishlist,
        loading,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        toggleWishlist,
        isInWishlist,
        appliedCoupon,
        applyCoupon,
        removeCoupon,
        discountAmount
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
