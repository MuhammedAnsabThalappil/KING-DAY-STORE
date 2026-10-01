import React, { createContext, useContext, useState, useEffect } from 'react';
import { fetchApi } from '../api/client';
import { Cart, Product, CartItem, Coupon } from '../types';

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
  const [cart, setCart] = useState<Cart | null>(null);
  const [wishlist, setWishlist] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [discountAmount, setDiscountAmount] = useState<number>(0);

  const getSessionId = () => {
    let sid = localStorage.getItem('kd_session_id');
    if (!sid) {
      sid = 'session_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9);
      localStorage.setItem('kd_session_id', sid);
    }
    return sid;
  };

  const fetchCart = async () => {
    const sid = getSessionId();
    const res = await fetchApi<Cart>(`/cart?sessionId=${sid}`);
    if (res.success && res.data) {
      setCart(res.data);
    }
  };

  const fetchWishlist = async () => {
    const sid = getSessionId();
    const res = await fetchApi<Product[]>(`/wishlist?customerId=${sid}`);
    if (res.success && res.data) {
      setWishlist(res.data);
    }
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await Promise.all([fetchCart(), fetchWishlist()]);
      setLoading(false);
    };
    init();
  }, []);

  const addToCart = async (productId: string, quantity = 1, variantId?: string) => {
    const sid = getSessionId();
    const res = await fetchApi<Cart>('/cart/items', {
      method: 'POST',
      body: JSON.stringify({
        productId,
        quantity,
        variantId,
        sessionId: sid
      })
    });

    if (res.success && res.data) {
      setCart(res.data);
      return true;
    }
    return false;
  };

  const updateQuantity = async (cartItemId: string, quantity: number) => {
    const res = await fetchApi(`/cart/items/${cartItemId}`, {
      method: 'PUT',
      body: JSON.stringify({ quantity })
    });

    if (res.success) {
      await fetchCart();
      return true;
    }
    return false;
  };

  const removeFromCart = async (cartItemId: string) => {
    const res = await fetchApi(`/cart/items/${cartItemId}`, {
      method: 'DELETE'
    });

    if (res.success) {
      await fetchCart();
      return true;
    }
    return false;
  };

  const clearCart = async () => {
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

  const toggleWishlist = async (product: Product) => {
    const sid = getSessionId();
    const isSaved = wishlist.some(p => p.id === product.id);

    // Optimistic update
    if (isSaved) {
      setWishlist(prev => prev.filter(p => p.id !== product.id));
    } else {
      setWishlist(prev => [...prev, product]);
    }

    const res = await fetchApi('/wishlist/toggle', {
      method: 'POST',
      body: JSON.stringify({
        customerId: sid,
        productId: product.id
      })
    });

    if (!res.success) {
      await fetchWishlist(); // Revert on error
      return false;
    }
    return true;
  };

  const isInWishlist = (productId: string) => {
    return wishlist.some(p => p.id === productId);
  };

  const applyCoupon = async (code: string) => {
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
      body: JSON.stringify({
        code,
        cartAmount: cart.subtotal
      })
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
      return { success: true, message: `Coupon ${code} applied!` };
    }

    return {
      success: false,
      message: res.error?.message || 'Invalid coupon code'
    };
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
