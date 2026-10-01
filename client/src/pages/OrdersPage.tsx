import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Package, Search, Truck, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { fetchApi } from '../api/client';
import { Order, OrderStatus } from '../types';
import { SEO } from '../components/SEO';

export const OrdersPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [orders, setOrders] = useState<Order[]>([]);
  const [searchOrderNum, setSearchOrderNum] = useState(searchParams.get('id') || '');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadOrders = async () => {
      setLoading(true);
      const res = await fetchApi<{ orders: Order[] }>('/orders');
      if (res.success && res.data) {
        setOrders(res.data.orders);
      }
      setLoading(false);
    };

    loadOrders();
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchOrderNum.trim()) return;
    setLoading(true);
    const res = await fetchApi<Order>(`/orders/${searchOrderNum.trim()}`);
    if (res.success && res.data) {
      setOrders([res.data]);
    } else {
      setOrders([]);
    }
    setLoading(false);
  };

  const getStatusStep = (status: OrderStatus) => {
    switch (status) {
      case 'PENDING':
        return 1;
      case 'CONFIRMED':
        return 2;
      case 'PROCESSING':
        return 3;
      case 'SHIPPED':
        return 4;
      case 'DELIVERED':
        return 5;
      default:
        return 1;
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
      <SEO title="Track Orders — KING DAY STORE" />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900">Order Tracking</h1>
          <p className="text-slate-500 text-xs md:text-sm mt-0.5">
            Monitor real-time fulfillment, shipping, and delivery timelines.
          </p>
        </div>

        {/* Search Order Number form */}
        <form onSubmit={handleSearch} className="flex space-x-2">
          <input
            type="text"
            placeholder="Enter Order # (e.g. KD-2026-1001-8492)"
            value={searchOrderNum}
            onChange={(e) => setSearchOrderNum(e.target.value)}
            className="px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-brand-purple min-h-[44px]"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-brand-purple text-white rounded-xl font-bold text-xs hover:bg-brand-blue transition-colors min-h-[44px] flex items-center justify-center space-x-1"
          >
            <Search className="w-4 h-4" />
            <span>Track</span>
          </button>
        </form>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="h-48 bg-slate-200 rounded-3xl animate-pulse" />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-white p-12 rounded-3xl border border-slate-100 text-center space-y-4 shadow-sm">
          <Package className="w-12 h-12 text-slate-400 mx-auto" />
          <h3 className="text-lg font-bold text-slate-800">No Orders Found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Please check the Order Reference Number or place a new order.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => {
            const currentStep = getStatusStep(order.status);
            const isCancelled = order.status === 'CANCELLED';

            return (
              <div
                key={order.id}
                className="bg-white p-6 md:p-8 rounded-3xl border border-slate-100 shadow-sm space-y-6"
              >
                {/* Order Top Summary */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100">
                  <div>
                    <span className="text-xs font-bold text-slate-400 block uppercase">Order Number</span>
                    <span className="text-lg font-black text-slate-900">#{order.orderNumber}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="text-xs text-slate-500 font-semibold">
                      Placed: {new Date(order.createdAt).toLocaleDateString('en-IN')}
                    </span>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-extrabold uppercase ${
                        isCancelled
                          ? 'bg-red-100 text-red-700'
                          : order.status === 'DELIVERED'
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-brand-purple/10 text-brand-purple'
                      }`}
                    >
                      {order.status}
                    </span>
                  </div>
                </div>

                {/* Timeline Progress */}
                {!isCancelled && (
                  <div className="py-4">
                    <div className="grid grid-cols-5 gap-2 text-center text-[10px] md:text-xs font-bold text-slate-600">
                      {['Order Placed', 'Confirmed', 'Processing', 'Shipped', 'Delivered'].map((stepName, idx) => {
                        const stepNum = idx + 1;
                        const isDone = currentStep >= stepNum;

                        return (
                          <div key={stepName} className="flex flex-col items-center space-y-1.5">
                            <div
                              className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                                isDone
                                  ? 'bg-emerald-500 text-white shadow-md'
                                  : 'bg-slate-100 text-slate-400'
                              }`}
                            >
                              {isDone ? <CheckCircle2 className="w-4 h-4" /> : stepNum}
                            </div>
                            <span className={isDone ? 'text-slate-900 font-extrabold' : 'text-slate-400'}>
                              {stepName}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Itemized Snapshot */}
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <h4 className="text-xs font-extrabold uppercase text-slate-400">Order Items</h4>
                  <div className="space-y-2">
                    {order.items?.map((item) => (
                      <div key={item.id} className="flex items-center justify-between text-xs py-1">
                        <span className="font-semibold text-slate-800">
                          {item.productName} × {item.quantity}
                        </span>
                        <span className="font-bold text-slate-900">
                          ₹{Number(item.total).toLocaleString('en-IN')}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-sm font-extrabold text-slate-900">
                    <span>Total Amount</span>
                    <span>₹{Number(order.totalAmount).toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
