import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, Trash2, ArrowRight, Tag, ShieldCheck, Truck, MessageCircle } from 'lucide-react';
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
        <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 mx-auto shadow-inner">
          <ShoppingBag className="w-10 h-10 text-brand-purple" />
        </div>
        <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">Your Shopping Cart is Empty</h2>
        <p className="text-slate-500 text-xs md:text-sm max-w-sm mx-auto leading-relaxed">
          Explore our collection of luxury electric ride-ons, cycles, and toys to add products to your cart.
        </p>
        <Link
          to="/shop"
          className="inline-flex items-center space-x-2 px-8 py-3.5 rounded-full bg-brand-purple text-white font-extrabold text-xs md:text-sm shadow-brand-glow hover:bg-brand-blue transition-all active:scale-95 min-h-[44px]"
        >
          <span>Start Shopping Catalog</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      <SEO title="Shopping Cart — KING DAY STORE" />

      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
          Shopping Cart ({cart.totalItems} Items)
        </h1>
        <button
          onClick={clearCart}
          className="text-xs font-bold text-rose-600 hover:text-rose-800 flex items-center space-x-1 transition-colors min-h-[44px] px-2"
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
              className="p-4 md:p-6 bg-white rounded-3xl border border-slate-100 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all hover:border-slate-200"
            >
              <div className="flex items-center space-x-4">
                <img
                  src={
                    item.product.images?.find((i) => i.isPrimary)?.imageUrl ||
                    item.product.images?.[0]?.imageUrl ||
                    'https://images.unsplash.com/photo-1594787318286-3d835c1d207f?auto=format&fit=crop&w=300&q=80'
                  }
                  alt={item.product.name}
                  className="w-20 h-20 md:w-24 md:h-24 rounded-2xl object-cover bg-slate-50 shrink-0 border border-slate-100"
                />
                <div className="space-y-1">
                  <span className="text-[10px] font-mono font-bold uppercase text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                    {item.product.sku}
                  </span>
                  <Link
                    to={`/product/${item.product.slug}`}
                    className="font-bold text-slate-900 text-sm md:text-base hover:text-brand-purple line-clamp-2 transition-colors"
                  >
                    {item.product.name}
                  </Link>
                  <p className="text-xs font-extrabold text-slate-500">
                    ₹{Number(item.currentPrice).toLocaleString('en-IN')} each
                  </p>
                </div>
              </div>

              <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto space-y-0 sm:space-y-3 pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100 shrink-0">
                <span className="text-base md:text-xl font-black text-slate-900">
                  ₹{Number(item.itemTotal).toLocaleString('en-IN')}
                </span>

                <div className="flex items-center space-x-2">
                  <div className="flex items-center border border-slate-200 rounded-xl bg-slate-50/80 overflow-hidden shadow-2xs">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="px-3 py-1 font-extrabold text-slate-600 hover:bg-slate-200 transition-colors min-h-[44px] min-w-[44px]"
                    >
                      -
                    </button>
                    <span className="px-3 text-xs font-extrabold text-slate-900">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="px-3 py-1 font-extrabold text-slate-600 hover:bg-slate-200 transition-colors min-h-[44px] min-w-[44px]"
                    >
                      +
                    </button>
                  </div>

                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="p-2 text-slate-400 hover:text-rose-600 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl hover:bg-rose-50"
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
          <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-100 shadow-sm space-y-6 sticky top-24">
            <h3 className="font-extrabold text-lg text-slate-900 pb-3 border-b border-slate-100 tracking-tight">
              Order Summary
            </h3>

            {/* Coupon Code Input */}
            <form onSubmit={handleApplyCoupon} className="space-y-2">
              <label className="text-xs font-extrabold text-slate-700 uppercase tracking-wider flex items-center space-x-1.5">
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
                  className="px-4 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-extrabold hover:bg-brand-purple transition-all min-h-[44px] active:scale-95"
                >
                  Apply
                </button>
              </div>
              {couponMsg && (
                <p className={`text-xs font-bold ${couponMsg.success ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {couponMsg.message}
                </p>
              )}
              {appliedCoupon && (
                <div className="flex items-center justify-between p-2.5 bg-emerald-50 rounded-xl text-xs font-extrabold text-emerald-800 border border-emerald-200">
                  <span>Code: {appliedCoupon.code}</span>
                  <button onClick={removeCoupon} className="text-rose-600 text-[10px] underline">
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
                <div className="flex justify-between text-emerald-600 font-extrabold">
                  <span>Coupon Discount</span>
                  <span>- ₹{discountAmount.toLocaleString('en-IN')}</span>
                </div>
              )}
              <div className="flex justify-between text-slate-600 font-medium">
                <span>Estimated Shipping</span>
                <span>{shippingFee === 0 ? <strong className="text-emerald-600 font-extrabold">FREE</strong> : `₹${shippingFee}`}</span>
              </div>
              <div className="flex justify-between text-lg font-black text-slate-900 pt-3 border-t border-slate-100">
                <span>Total Amount</span>
                <span>₹{finalTotal.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <div className="space-y-3">
              <a
                href={(() => {
                  if (!cart || cart.items.length === 0) return '#';
                  const itemsText = cart.items.map((item, idx) => (
                    `${idx + 1}. ${item.product.name}\n   SKU: ${item.product.sku}\n   Qty: ${item.quantity}\n   Price: ₹${Number(item.itemTotal).toLocaleString('en-IN')}`
                  )).join('\n\n');
                  const rawMsg = `🛍️ KING DAY Order Inquiry\n\n${itemsText}\n\n💰 Estimated Total: ₹${finalTotal.toLocaleString('en-IN')}\n\nPlease confirm availability and delivery details.\n\nThank you!`;
                  return `https://wa.me/919495902904?text=${encodeURIComponent(rawMsg)}`;
                })()}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-4 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm transition-all shadow-lg shadow-emerald-600/20 flex items-center justify-center space-x-2.5 min-h-[48px] active:scale-[0.98]"
              >
                <MessageCircle className="w-5 h-5 fill-current" />
                <span>ORDER ON WHATSAPP</span>
              </a>

              <button
                onClick={() => navigate('/checkout')}
                className="w-full py-3.5 px-6 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center justify-center space-x-2 min-h-[44px] transition-colors"
              >
                <span>Proceed to Checkout Form</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

