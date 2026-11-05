import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Package, Search, CheckCircle2, MessageCircle } from 'lucide-react';
import { fetchApi } from '../api/client';
import { Order, OrderStatus } from '../types';
import { SEO } from '../components/SEO';

export const OrdersPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [order, setOrder] = useState<Order | null>(null);
  const [searchOrderNum, setSearchOrderNum] = useState(searchParams.get('orderNumber') || searchParams.get('id') || '');
  const [loading, setLoading] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  // Auto-search if order number is in URL params (from order success page)
  useEffect(() => {
    const num = searchParams.get('orderNumber') || searchParams.get('id');
    if (num && num.trim()) {
      setSearchOrderNum(num.trim());
      doTrack(num.trim());
    }
  }, []);

  const doTrack = async (num: string) => {
    setLoading(true);
    setNotFound(false);
    setOrder(null);
    setHasSearched(true);

    // Use the public /orders/track endpoint — no auth required
    const res = await fetchApi<Order>(`/orders/track?orderNumber=${encodeURIComponent(num)}`);
    if (res.success && res.data) {
      setOrder(res.data);
    } else {
      setNotFound(true);
    }
    setLoading(false);
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchOrderNum.trim()) return;
    doTrack(searchOrderNum.trim());
  };

  const getStatusStep = (status: OrderStatus) => {
    switch (status) {
      case 'PENDING': return 1;
      case 'CONFIRMED': return 2;
      case 'PROCESSING': return 3;
      case 'SHIPPED': return 4;
      case 'DELIVERED': return 5;
      default: return 1;
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-8">
      <SEO title="Track Order — KING DAY STORE" />

      <div className="space-y-1">
        <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">Track Your Order</h1>
        <p className="text-slate-500 text-xs md:text-sm font-medium">
          Enter your order reference number to see real-time shipping and delivery status.
        </p>
      </div>

      {/* Search bar */}
      <form onSubmit={handleSearch} className="flex gap-2">
        <input
          type="text"
          placeholder="e.g. KD-20261016-5423"
          value={searchOrderNum}
          onChange={(e) => setSearchOrderNum(e.target.value)}
          className="flex-1 px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 placeholder-slate-400 focus:outline-none focus:border-brand-purple focus:ring-2 focus:ring-brand-purple/20 min-h-[48px]"
        />
        <button
          type="submit"
          disabled={loading}
          className="px-5 py-3 bg-brand-purple text-white rounded-xl font-extrabold text-sm hover:bg-brand-blue transition-all min-h-[48px] flex items-center space-x-2 shadow-brand-glow active:scale-95 disabled:opacity-60"
        >
          <Search className="w-4 h-4" />
          <span>{loading ? 'Tracking...' : 'Track'}</span>
        </button>
      </form>

      {/* Loading skeleton */}
      {loading && (
        <div className="h-56 bg-slate-200 rounded-3xl animate-pulse" />
      )}

      {/* No result */}
      {!loading && hasSearched && notFound && (
        <div className="bg-white p-10 rounded-3xl border border-slate-100 text-center space-y-4 shadow-sm">
          <Package className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-lg font-extrabold text-slate-900">Order Not Found</h3>
          <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
            No order matched <strong className="font-mono">{searchOrderNum}</strong>. Please check your WhatsApp for the correct reference number.
          </p>
          <a
            href="https://wa.me/919495902904"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center space-x-2 bg-emerald-600 text-white px-5 py-2.5 rounded-xl text-xs font-bold hover:bg-emerald-700 transition-all min-h-[44px]"
          >
            <MessageCircle className="w-4 h-4 fill-current" />
            <span>Contact Us on WhatsApp</span>
          </a>
        </div>
      )}

      {/* Initial empty state */}
      {!loading && !hasSearched && (
        <div className="bg-white p-10 rounded-3xl border border-slate-100 text-center space-y-3 shadow-sm">
          <Package className="w-12 h-12 text-slate-300 mx-auto" />
          <p className="text-sm font-semibold text-slate-500">Enter your order number above to get started.</p>
          <p className="text-xs text-slate-400">
            You can find your order number in the WhatsApp message you received after placing an order.
          </p>
        </div>
      )}

      {/* Order Card */}
      {!loading && order && (() => {
        const currentStep = getStatusStep(order.status);
        const isCancelled = order.status === 'CANCELLED';
        const addr = order.shippingAddressSnapshot as any;

        return (
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden space-y-0">
            {/* Header */}
            <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Order Reference</span>
                <span className="text-xl font-black text-slate-900 font-mono">#{order.orderNumber}</span>
                <span className="text-xs text-slate-400 block mt-0.5">
                  Placed on {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                </span>
              </div>
              <span className={`self-start sm:self-auto px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wide ${
                isCancelled ? 'bg-rose-100 text-rose-700' :
                order.status === 'DELIVERED' ? 'bg-emerald-100 text-emerald-800' :
                'bg-brand-purple/10 text-brand-purple'
              }`}>
                {order.status}
              </span>
            </div>

            {/* Progress tracker */}
            {!isCancelled && (
              <div className="px-6 py-5 bg-slate-50 border-b border-slate-100">
                <div className="grid grid-cols-5 gap-1 text-center">
                  {['Placed', 'Confirmed', 'Processing', 'Shipped', 'Delivered'].map((step, idx) => {
                    const done = currentStep >= idx + 1;
                    return (
                      <div key={step} className="flex flex-col items-center space-y-1.5">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                          done ? 'bg-emerald-600 text-white shadow-md' : 'bg-slate-200 text-slate-400'
                        }`}>
                          {done ? <CheckCircle2 className="w-4 h-4" /> : <span className="text-[10px] font-bold">{idx + 1}</span>}
                        </div>
                        <span className={`text-[9px] sm:text-[10px] font-bold leading-tight ${done ? 'text-slate-800' : 'text-slate-400'}`}>
                          {step}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Items */}
            <div className="p-6 border-b border-slate-100 space-y-2">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 mb-3">Items Ordered</h4>
              {order.items?.map((item) => (
                <div key={item.id} className="flex items-center justify-between text-xs py-2 px-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="font-semibold text-slate-800">{item.productName} × {item.quantity}</span>
                  <span className="font-black text-slate-900">₹{Number(item.total).toLocaleString('en-IN')}</span>
                </div>
              ))}
            </div>

            {/* Delivery address + totals */}
            <div className="p-6 grid sm:grid-cols-2 gap-6">
              {addr && (
                <div>
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 mb-2">Delivery Address</h4>
                  <p className="text-xs font-semibold text-slate-700 leading-relaxed">
                    {addr.name}<br />
                    {addr.addressLine1}{addr.addressLine2 ? `, ${addr.addressLine2}` : ''}<br />
                    {addr.city}, {addr.district}, {addr.state} - {addr.pincode}
                  </p>
                </div>
              )}
              <div className="sm:text-right space-y-1 text-xs">
                <div className="flex sm:justify-end justify-between text-slate-500">
                  <span>Subtotal</span>
                  <span className="font-semibold">₹{Number(order.subtotal).toLocaleString('en-IN')}</span>
                </div>
                {Number(order.discount) > 0 && (
                  <div className="flex sm:justify-end justify-between text-emerald-600 font-bold">
                    <span>Discount</span>
                    <span>- ₹{Number(order.discount).toLocaleString('en-IN')}</span>
                  </div>
                )}
                <div className="flex sm:justify-end justify-between text-slate-500">
                  <span>Shipping</span>
                  <span className="font-semibold">{Number(order.shippingAmount) === 0 ? 'FREE' : `₹${Number(order.shippingAmount).toLocaleString('en-IN')}`}</span>
                </div>
                <div className="flex sm:justify-end justify-between font-black text-slate-900 text-base pt-2 border-t border-slate-100 mt-2">
                  <span>Total</span>
                  <span>₹{Number(order.totalAmount).toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
};
