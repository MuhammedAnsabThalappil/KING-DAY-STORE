import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, Trash2, ArrowRight, Tag, ShieldCheck, Truck } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { SEO } from '../components/SEO';

export const CartPage: React.FC = () => {
  const { cart, updateQuantity, removeFromCart, clearCart, appliedCoupon, applyCoupon, removeCoupon, discountAmount } = useCart();
  const navigate = useNavigate();

  const [couponCode, setCouponCode] = useState('');
  const [couponMsg, setCouponMsg] = useState<{ success: boolean; message: string } | null>(null);

  const subtotal = cart?.subtotal || 0;
  const shippingFee = subtotal > 4999 || subtotal === 0 ? 0 : 150;
  const finalTotal = Math.max(0, subtotal - discountAmount + shippingFee);

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) return;
    const res = await applyCoupon(couponCode.trim());
    setCouponMsg(res);
  };

  if (!cart || cart.items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-6">
        <SEO title="Shopping Cart — KING DAY STORE" />
        <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 mx-auto">
          <ShoppingBag className="w-10 h-10" />
        </div>
        <h2 className="text-2xl font-extrabold text-slate-800">Your Shopping Cart is Empty</h2>
        <p className="text-slate-500 text-sm max-w-sm mx-auto">
          Explore our collection of luxury electric ride-ons, cycles, and toys to add products to your cart.
        </p>
        <Link
          to="/shop"
          className="inline-flex items-center space-x-2 px-8 py-3.5 rounded-full bg-brand-purple text-white font-bold text-sm shadow-brand-glow hover:bg-brand-blue transition-all"
        >
          <span>Start Shopping</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      <SEO title="Shopping Cart — KING DAY STORE" />

      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900">
          Shopping Cart ({cart.totalItems} Items)
        </h1>
        <button
          onClick={clearCart}
          className="text-xs font-bold text-red-500 hover:text-red-700 flex items-center space-x-1"
        >
          <Trash2 className="w-4 h-4" />
          <span>Clear Cart</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Cart Items List */}
        <div className="lg:col-span-8 space-y-4">
          {cart.items.map((item) => (
            <div
              key={item.id}
              className="p-4 md:p-6 bg-white rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between gap-4"
            >
              <div className="flex items-center space-x-4">
                <img
                  src={
                    item.product.images?.find((i) => i.isPrimary)?.imageUrl ||
                    item.product.images?.[0]?.imageUrl ||
                    'https://images.unsplash.com/photo-1594787318286-3d835c1d207f?auto=format&fit=crop&w=300&q=80'
                  }
                  alt={item.product.name}
                  className="w-20 h-20 md:w-24 md:h-24 rounded-xl object-cover bg-slate-50 shrink-0"
                />
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase text-slate-400">
                    {item.product.sku}
                  </span>
                  <Link
                    to={`/product/${item.product.slug}`}
                    className="font-bold text-slate-900 text-sm md:text-base hover:text-brand-purple line-clamp-2 block"
                  >
                    {item.product.name}
                  </Link>
                  <p className="text-xs font-bold text-slate-500">
                    ₹{Number(item.currentPrice).toLocaleString('en-IN')} each
                  </p>
                </div>
              </div>

              <div className="flex flex-col items-end justify-between space-y-3 shrink-0">
                <span className="text-base md:text-lg font-black text-slate-900">
                  ₹{Number(item.itemTotal).toLocaleString('en-IN')}
                </span>

                <div className="flex items-center space-x-2">
                  <div className="flex items-center border border-slate-200 rounded-lg bg-slate-50 overflow-hidden">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="px-2.5 py-1 font-bold text-slate-600 hover:bg-slate-200 transition-colors min-h-[44px] min-w-[44px]"
                    >
                      -
                    </button>
                    <span className="px-3 text-xs font-bold text-slate-900">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="px-2.5 py-1 font-bold text-slate-600 hover:bg-slate-200 transition-colors min-h-[44px] min-w-[44px]"
                    >
                      +
                    </button>
                  </div>

                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="p-2 text-slate-400 hover:text-red-500 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                    title="Remove item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary & Coupon Card */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-6">
            <h3 className="font-extrabold text-lg text-slate-900 pb-3 border-b border-slate-100">
              Order Summary
            </h3>

            {/* Coupon Code Input */}
            <form onSubmit={handleApplyCoupon} className="space-y-2">
              <label className="text-xs font-bold text-slate-600 uppercase flex items-center space-x-1">
                <Tag className="w-3.5 h-3.5 text-brand-purple" />
                <span>Have a Promo Code?</span>
              </label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  placeholder="e.g. KINGDAY10"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  className="flex-1 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold uppercase focus:outline-none focus:bg-white focus:border-brand-purple"
                />
                <button
                  type="submit"
                  className="px-4 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-brand-purple transition-colors min-h-[44px]"
                >
                  Apply
                </button>
              </div>
              {couponMsg && (
                <p className={`text-xs font-bold ${couponMsg.success ? 'text-emerald-600' : 'text-red-500'}`}>
                  {couponMsg.message}
                </p>
              )}
              {appliedCoupon && (
                <div className="flex items-center justify-between p-2 bg-emerald-50 rounded-xl text-xs font-bold text-emerald-800">
                  <span>Code: {appliedCoupon.code}</span>
                  <button onClick={removeCoupon} className="text-red-500 text-[10px] underline">
                    Remove
                  </button>
                </div>
              )}
            </form>

            {/* Calculation breakdown */}
            <div className="space-y-3 pt-4 border-t border-slate-100 text-xs md:text-sm">
              <div className="flex justify-between text-slate-600 font-medium">
                <span>Subtotal</span>
                <span>₹{subtotal.toLocaleString('en-IN')}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-600 font-bold">
                  <span>Coupon Discount</span>
                  <span>- ₹{discountAmount.toLocaleString('en-IN')}</span>
                </div>
              )}
              <div className="flex justify-between text-slate-600 font-medium">
                <span>Estimated Shipping</span>
                <span>{shippingFee === 0 ? <strong className="text-emerald-600">FREE</strong> : `₹${shippingFee}`}</span>
              </div>
              <div className="flex justify-between text-base font-black text-slate-900 pt-3 border-t border-slate-100">
                <span>Total Amount</span>
                <span>₹{finalTotal.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <button
              onClick={() => navigate('/checkout')}
              className="w-full py-4 px-6 rounded-2xl bg-brand-gradient text-white font-extrabold text-sm shadow-brand-glow hover:shadow-pink-glow transition-all active:scale-95 flex items-center justify-center space-x-2 min-h-[48px]"
            >
              <span>Proceed to Mobile Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
