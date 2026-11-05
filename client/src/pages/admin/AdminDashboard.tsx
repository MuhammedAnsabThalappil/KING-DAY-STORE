import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  DollarSign,
  ShoppingBag,
  Users,
  Package,
  AlertTriangle,
  TrendingUp,
  ArrowUpRight,
  Boxes
} from 'lucide-react';
import { fetchApi } from '../../api/client';
import { AdminMetrics } from '../../types';
import { SEO } from '../../components/SEO';

export const AdminDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<AdminMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadMetrics = async () => {
      setLoading(true);
      const res = await fetchApi<AdminMetrics>('/admin/metrics');
      if (res.success && res.data) {
        setMetrics(res.data);
      }
      setLoading(false);
    };
    loadMetrics();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-slate-800 w-1/4 rounded-xl" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-slate-800 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <SEO title="Admin Dashboard — KING DAY" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">Business Dashboard</h1>
          <p className="text-slate-400 text-xs md:text-sm mt-0.5 font-medium">
            Real-time analytics and inventory health directly from PostgreSQL.
          </p>
        </div>
        <div className="flex items-center space-x-2 bg-slate-950 px-3 py-1.5 rounded-full border border-slate-800 self-start sm:self-auto">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-extrabold text-emerald-400">Database Live</span>
        </div>
      </div>

      {/* Top 4 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800 space-y-3 shadow-md hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between text-emerald-400">
            <div className="p-2.5 rounded-2xl bg-emerald-500/10">
              <DollarSign className="w-6 h-6" />
            </div>
            <span className="text-[10px] font-extrabold uppercase bg-emerald-500/20 text-emerald-400 px-2.5 py-1 rounded-full border border-emerald-500/30">
              Real Revenue
            </span>
          </div>
          <div>
            <span className="text-2xl md:text-3xl font-black text-white block">
              ₹{(metrics?.totalRevenue || 0).toLocaleString('en-IN')}
            </span>
            <p className="text-xs text-slate-400 font-medium mt-0.5">Confirmed & Paid Orders</p>
          </div>
        </div>

        <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800 space-y-3 shadow-md hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between text-brand-purple">
            <div className="p-2.5 rounded-2xl bg-brand-purple/10">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <span className="text-[10px] font-extrabold uppercase bg-brand-purple/20 text-brand-purple px-2.5 py-1 rounded-full border border-brand-purple/30">
              {metrics?.pendingOrdersCount || 0} Pending
            </span>
          </div>
          <div>
            <span className="text-2xl md:text-3xl font-black text-white block">
              {metrics?.totalOrders || 0}
            </span>
            <p className="text-xs text-slate-400 font-medium mt-0.5">Total Customer Orders</p>
          </div>
        </div>

        <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800 space-y-3 shadow-md hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between text-brand-pink">
            <div className="p-2.5 rounded-2xl bg-brand-pink/10">
              <Package className="w-6 h-6" />
            </div>
            <span className="text-[10px] font-extrabold uppercase bg-brand-pink/20 text-brand-pink px-2.5 py-1 rounded-full border border-brand-pink/30">
              {metrics?.totalStockUnits || 0} Units
            </span>
          </div>
          <div>
            <span className="text-2xl md:text-3xl font-black text-white block">
              {metrics?.totalProducts || 0}
            </span>
            <p className="text-xs text-slate-400 font-medium mt-0.5">Active Products in Catalog</p>
          </div>
        </div>

        <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800 space-y-3 shadow-md hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between text-amber-400">
            <div className="p-2.5 rounded-2xl bg-amber-500/10">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <span className="text-[10px] font-extrabold uppercase bg-amber-500/20 text-amber-400 px-2.5 py-1 rounded-full border border-amber-500/30">
              Action Required
            </span>
          </div>
          <div>
            <span className="text-2xl md:text-3xl font-black text-white block">
              {metrics?.lowStockCount || 0}
            </span>
            <p className="text-xs text-slate-400 font-medium mt-0.5">Low Stock Products Alert</p>
          </div>
        </div>
      </div>

      {/* Recent Orders Table */}
      <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800 space-y-4 shadow-md">
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
          <h3 className="font-extrabold text-base text-white tracking-tight">Recent Customer Orders</h3>
          <Link
            to="/admin/orders"
            className="text-xs font-bold text-brand-purple hover:text-brand-pink transition-colors flex items-center space-x-1"
          >
            <span>View All Orders</span>
            <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>

        {metrics?.recentOrders && metrics.recentOrders.length > 0 ? (
          <div className="overflow-x-auto rounded-2xl border border-slate-800">
            <table className="w-full text-left text-xs">
              <thead className="uppercase text-slate-400 bg-slate-900/90 font-bold border-b border-slate-800">
                <tr>
                  <th className="py-3.5 px-4">Order #</th>
                  <th className="py-3.5 px-4">Customer</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Payment</th>
                  <th className="py-3.5 px-4">Total</th>
                  <th className="py-3.5 px-4">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300 font-medium">
                {metrics.recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-900/60 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-white">#{order.orderNumber}</td>
                    <td className="py-3.5 px-4 font-semibold text-slate-200">{order.customer?.name || 'Guest'}</td>
                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase bg-brand-purple/20 text-brand-purple border border-brand-purple/30">
                        {order.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold ${order.paymentStatus === 'PAID' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'}`}>
                        {order.paymentStatus}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-extrabold text-white">
                      ₹{Number(order.totalAmount).toLocaleString('en-IN')}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 font-medium">
                      {new Date(order.createdAt).toLocaleDateString('en-IN')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-slate-500 text-xs text-center py-6 font-medium">No recent orders found.</p>
        )}
      </div>
    </div>
  );
};

