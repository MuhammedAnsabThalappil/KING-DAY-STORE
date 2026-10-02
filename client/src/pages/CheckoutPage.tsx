import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Lock, CreditCard, Banknote, ArrowRight, Check, MessageCircle } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { fetchApi } from '../api/client';
import { Order } from '../types';
import { SEO } from '../components/SEO';

declare global {
  interface Window {
    Razorpay: any;
  }
}

export const CheckoutPage: React.FC = () => {
  const { cart, discountAmount, clearCart } = useCart();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    district: '',
    state: 'Kerala',
    pincode: '',
    landmark: '',
    paymentMethod: 'WHATSAPP' as any,
    notes: ''
  });

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const subtotal = cart?.subtotal || 0;
  const shippingFee = subtotal > 4999 || subtotal === 0 ? 0 : 150;
  const totalAmount = Math.max(0, subtotal - discountAmount + shippingFee);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!cart || cart.items.length === 0) {
      setErrorMsg('Your cart is empty');
      return;
    }

    if (!formData.name || !formData.email || !formData.phone || !formData.addressLine1 || !formData.pincode) {
      setErrorMsg('Please fill in all required shipping address fields');
      return;
    }

    setLoading(true);

    try {
      // 1. Create Order in backend with WHATSAPP payment method
      const orderPayload = {
        customerName: formData.name,
        customerEmail: formData.email,
        customerPhone: formData.phone,
        shippingAddress: {
          name: formData.name,
          phone: formData.phone,
          addressLine1: formData.addressLine1,
          addressLine2: formData.addressLine2,
          city: formData.city,
          district: formData.district,
          state: formData.state,
          pincode: formData.pincode,
          landmark: formData.landmark
        },
        paymentMethod: 'WHATSAPP',
        notes: formData.notes,
        items: cart.items.map((i) => ({
          productId: i.product.id,
          quantity: i.quantity
        }))
      };

      const orderRes = await fetchApi<Order>('/orders', {
        method: 'POST',
        body: JSON.stringify(orderPayload)
      });

      if (!orderRes.success || !orderRes.data) {
        throw new Error(orderRes.error?.message || 'Failed to generate order');
      }

      const order = orderRes.data;

      // 2. Format WhatsApp Order Message & Open WhatsApp window
      const itemsList = cart.items.map((i, idx) => `${idx + 1}. ${i.product.name}\n   SKU: ${i.product.sku}\n   Qty: ${i.quantity}\n   Price: ₹${Number(i.itemTotal).toLocaleString('en-IN')}`).join('\n\n');
      const rawMsg = `Hello KING DAY 👋\n\nI have placed an order on the website:\n\n📋 Order #${order.orderNumber}\n👤 Name: ${formData.name}\n📞 Phone: ${formData.phone}\n📍 Address: ${formData.addressLine1}, ${formData.city}, ${formData.state} - ${formData.pincode}\n\n🛍️ Items:\n${itemsList}\n\n💰 Total Amount: ₹${totalAmount.toLocaleString('en-IN')}\n\nPlease confirm availability and delivery details.\n\nThank you!`;
      const waUrl = `https://wa.me/919495902904?text=${encodeURIComponent(rawMsg)}`;

      window.open(waUrl, '_blank');
      await clearCart();
      navigate(`/order-success?orderNumber=${order.orderNumber}`);
    } catch (err: any) {
      setErrorMsg(err.message || 'Checkout failed. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      <SEO title="Mobile Checkout — KING DAY STORE" />

      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900">Checkout</h1>
        <p className="text-slate-500 text-xs md:text-sm mt-0.5">
          Enter your delivery details and choose a payment method.
        </p>
      </div>

      {errorMsg && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-xs md:text-sm font-bold rounded-2xl">
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleCheckoutSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Form Column */}
        <div className="lg:col-span-7 space-y-6">
          {/* Customer Info */}
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
            <h3 className="font-extrabold text-sm uppercase text-slate-800 tracking-wider">
              1. Customer Information
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  name="name"
                  required
                  placeholder="e.g. Anjali Nair"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:bg-white focus:border-brand-purple"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number (10 Digits) *</label>
                <input
                  type="tel"
                  name="phone"
                  required
                  placeholder="9876543210"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:bg-white focus:border-brand-purple"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Email Address *</label>
              <input
                type="email"
                name="email"
                required
                placeholder="anjali@example.com"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:bg-white focus:border-brand-purple"
              />
            </div>
          </div>

          {/* Shipping Address */}
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
            <h3 className="font-extrabold text-sm uppercase text-slate-800 tracking-wider">
              2. Shipping Address
            </h3>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Address Line 1 *</label>
              <input
                type="text"
                name="addressLine1"
                required
                placeholder="House/Flat No., Building Name, Street Name"
                value={formData.addressLine1}
                onChange={handleInputChange}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:bg-white focus:border-brand-purple"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Address Line 2 (Optional)</label>
              <input
                type="text"
                name="addressLine2"
                placeholder="Area, Locality"
                value={formData.addressLine2}
                onChange={handleInputChange}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:bg-white focus:border-brand-purple"
              />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">City *</label>
                <input
                  type="text"
                  name="city"
                  required
                  placeholder="Kochi"
                  value={formData.city}
                  onChange={handleInputChange}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:bg-white focus:border-brand-purple"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">District *</label>
                <input
                  type="text"
                  name="district"
                  required
                  placeholder="Ernakulam"
                  value={formData.district}
                  onChange={handleInputChange}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:bg-white focus:border-brand-purple"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Pincode (6 Digits) *</label>
                <input
                  type="text"
                  name="pincode"
                  required
                  maxLength={6}
                  placeholder="682001"
                  value={formData.pincode}
                  onChange={handleInputChange}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:bg-white focus:border-brand-purple"
                />
              </div>
            </div>
          </div>

          {/* Payment Method */}
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
            <h3 className="font-extrabold text-sm uppercase text-slate-800 tracking-wider">
              3. Payment & Delivery Confirmation
            </h3>
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-start space-x-3">
              <MessageCircle className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
              <div className="space-y-1 text-xs">
                <span className="font-extrabold text-sm text-slate-900 block">Payment will be confirmed through WhatsApp</span>
                <span className="text-slate-600 block leading-relaxed">
                  Your order details and delivery address will be formatted for WhatsApp. Our team will contact you to confirm payment and delivery slot.
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Summary Column */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-6 sticky top-24">
            <h3 className="font-extrabold text-lg text-slate-900 pb-3 border-b border-slate-100">
              Order Total
            </h3>

            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {cart?.items.map((item) => (
                <div key={item.id} className="flex items-center justify-between text-xs py-1">
                  <span className="truncate max-w-[180px] font-semibold text-slate-800">
                    {item.product.name} × {item.quantity}
                  </span>
                  <span className="font-bold text-slate-900">
                    ₹{Number(item.itemTotal).toLocaleString('en-IN')}
                  </span>
                </div>
              ))}
            </div>

            <div className="space-y-2 pt-3 border-t border-slate-100 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal</span>
                <span>₹{subtotal.toLocaleString('en-IN')}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-600 font-bold">
                  <span>Discount</span>
                  <span>- ₹{discountAmount.toLocaleString('en-IN')}</span>
                </div>
              )}
              <div className="flex justify-between text-slate-600">
                <span>Shipping Fee</span>
                <span>{shippingFee === 0 ? 'FREE' : `₹${shippingFee}`}</span>
              </div>
              <div className="flex justify-between text-base font-black text-slate-900 pt-3 border-t border-slate-100">
                <span>Total Amount Payable</span>
                <span>₹{totalAmount.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm shadow-lg shadow-emerald-600/20 transition-all flex items-center justify-center space-x-2.5 min-h-[52px] disabled:opacity-50"
            >
              <MessageCircle className="w-5 h-5 fill-current" />
              <span>{loading ? 'Submitting Order...' : `ORDER VIA WHATSAPP (₹${totalAmount.toLocaleString('en-IN')})`}</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
