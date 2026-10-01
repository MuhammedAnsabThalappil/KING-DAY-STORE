import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Lock, CreditCard, Banknote, ArrowRight, Check } from 'lucide-react';
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
    paymentMethod: 'COD' as 'RAZORPAY' | 'COD',
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
      // 1. Create Order in backend
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
        paymentMethod: formData.paymentMethod,
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

      // 2. If COD selected, finish immediately
      if (formData.paymentMethod === 'COD') {
        await clearCart();
        navigate(`/order-success?orderNumber=${order.orderNumber}`);
        return;
      }

      // 3. If RAZORPAY selected, invoke Razorpay Order API & Modal
      const payRes = await fetchApi<any>('/payments/create-order', {
        method: 'POST',
        body: JSON.stringify({ orderId: order.id })
      });

      if (!payRes.success || !payRes.data) {
        throw new Error(payRes.error?.message || 'Failed to initialize payment gateway');
      }

      const payData = payRes.data;

      if (payData.isTestMode || !window.Razorpay) {
        // Direct test verification for development setup without live Razorpay SDK keys
        const verifyRes = await fetchApi<Order>('/payments/verify', {
          method: 'POST',
          body: JSON.stringify({
            orderId: order.id,
            razorpayOrderId: payData.razorpayOrderId,
            razorpayPaymentId: `pay_mock_${Date.now()}`,
            razorpaySignature: 'test_mode_signature'
          })
        });

        if (verifyRes.success) {
          await clearCart();
          navigate(`/order-success?orderNumber=${order.orderNumber}`);
          return;
        }
      }

      // Live Razorpay Popup Options
      const options = {
        key: payData.key,
        amount: payData.amount,
        currency: payData.currency,
        name: 'KING DAY STORE',
        description: `Order #${order.orderNumber}`,
        order_id: payData.razorpayOrderId,
        prefill: {
          name: formData.name,
          email: formData.email,
          contact: formData.phone
        },
        theme: {
          color: '#5B2BE0'
        },
        handler: async function (response: any) {
          const verifyRes = await fetchApi<Order>('/payments/verify', {
            method: 'POST',
            body: JSON.stringify({
              orderId: order.id,
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature
            })
          });

          if (verifyRes.success) {
            await clearCart();
            navigate(`/order-success?orderNumber=${order.orderNumber}`);
          } else {
            setErrorMsg('Payment verification failed. Please contact support.');
            setLoading(false);
          }
        },
        modal: {
          ondismiss: function () {
            setLoading(false);
          }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
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
              3. Select Payment Method
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label
                className={`p-4 rounded-2xl border-2 cursor-pointer flex items-center space-x-3 transition-all ${
                  formData.paymentMethod === 'RAZORPAY'
                    ? 'border-brand-purple bg-brand-purple/5 shadow-sm'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value="RAZORPAY"
                  checked={formData.paymentMethod === 'RAZORPAY'}
                  onChange={handleInputChange}
                  className="text-brand-purple focus:ring-brand-purple"
                />
                <div>
                  <div className="flex items-center space-x-1 font-bold text-sm text-slate-900">
                    <CreditCard className="w-4 h-4 text-brand-purple" />
                    <span>Razorpay Online</span>
                  </div>
                  <span className="text-[11px] text-slate-500">UPI, Cards, NetBanking</span>
                </div>
              </label>

              <label
                className={`p-4 rounded-2xl border-2 cursor-pointer flex items-center space-x-3 transition-all ${
                  formData.paymentMethod === 'COD'
                    ? 'border-brand-purple bg-brand-purple/5 shadow-sm'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value="COD"
                  checked={formData.paymentMethod === 'COD'}
                  onChange={handleInputChange}
                  className="text-brand-purple focus:ring-brand-purple"
                />
                <div>
                  <div className="flex items-center space-x-1 font-bold text-sm text-slate-900">
                    <Banknote className="w-4 h-4 text-emerald-600" />
                    <span>Cash on Delivery</span>
                  </div>
                  <span className="text-[11px] text-slate-500">Pay cash upon home delivery</span>
                </div>
              </label>
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
              className="w-full py-4 px-6 rounded-2xl bg-brand-gradient text-white font-extrabold text-sm shadow-brand-glow hover:shadow-pink-glow transition-all active:scale-95 flex items-center justify-center space-x-2 min-h-[48px] disabled:opacity-50"
            >
              {loading ? (
                <span>Processing Order...</span>
              ) : (
                <>
                  <span>Place Order (₹{totalAmount.toLocaleString('en-IN')})</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
