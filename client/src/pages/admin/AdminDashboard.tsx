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

      {/* Title */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white">Business Dashboard</h1>
          <p className="text-slate-400 text-xs md:text-sm mt-0.5">
            Real-time analytics and inventory health directly from PostgreSQL.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-bold text-emerald-400">Database Live</span>
        </div>
      </div>

      {/* Top 4 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-emerald-400">
            <DollarSign className="w-6 h-6" />
            <span className="text-[10px] font-extrabold uppercase bg-emerald-500/10 px-2 py-0.5 rounded-full">
              Real Revenue
            </span>
          </div>
          <span className="text-2xl md:text-3xl font-black text-white block">
            ₹{(metrics?.totalRevenue || 0).toLocaleString('en-IN')}
          </span>
          <p className="text-xs text-slate-400">Confirmed & Paid Orders</p>
        </div>

        <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-brand-purple">
            <ShoppingBag className="w-6 h-6" />
            <span className="text-[10px] font-extrabold uppercase bg-brand-purple/10 px-2 py-0.5 rounded-full">
              {metrics?.pendingOrdersCount || 0} Pending
            </span>
          </div>
          <span className="text-2xl md:text-3xl font-black text-white block">
            {metrics?.totalOrders || 0}
          </span>
          <p className="text-xs text-slate-400">Total Customer Orders</p>
        </div>

        <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-brand-pink">
            <Package className="w-6 h-6" />
            <span className="text-[10px] font-extrabold uppercase bg-brand-pink/10 px-2 py-0.5 rounded-full">
              {metrics?.totalStockUnits || 0} Units
            </span>
          </div>
          <span className="text-2xl md:text-3xl font-black text-white block">
            {metrics?.totalProducts || 0}
          </span>
          <p className="text-xs text-slate-400">Active Products in Catalog</p>
        </div>

        <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-amber-400">
            <AlertTriangle className="w-6 h-6" />
            <span className="text-[10px] font-extrabold uppercase bg-amber-500/10 px-2 py-0.5 rounded-full">
              Action Required
            </span>
          </div>
          <span className="text-2xl md:text-3xl font-black text-white block">
            {metrics?.lowStockCount || 0}
          </span>
          <p className="text-xs text-slate-400">Low Stock Products Alert</p>
        </div>
      </div>

      {/* Recent Orders Table */}
      <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
          <h3 className="font-extrabold text-base text-white">Recent Customer Orders</h3>
          <Link
            to="/admin/orders"
            className="text-xs font-bold text-brand-purple hover:underline flex items-center space-x-1"
          >
            <span>View All Orders</span>
            <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>

        {metrics?.recentOrders && metrics.recentOrders.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="uppercase text-slate-400 border-b border-slate-800/80 font-bold">
                <tr>
                  <th className="py-3 px-4">Order #</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Payment</th>
                  <th className="py-3 px-4">Total</th>
                  <th className="py-3 px-4">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50 text-slate-300 font-medium">
                {metrics.recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-900/50">
                    <td className="py-3 px-4 font-bold text-white">#{order.orderNumber}</td>
                    <td className="py-3 px-4">{order.customer?.name || 'Guest'}</td>
                    <td className="py-3 px-4">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-brand-purple/20 text-brand-purple">
                        {order.status}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${order.paymentStatus === 'PAID' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}`}>
                        {order.paymentStatus}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-bold text-white">
                      ₹{Number(order.totalAmount).toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-4 text-slate-500">
                      {new Date(order.createdAt).toLocaleDateString('en-IN')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-slate-500 text-xs text-center py-6">No recent orders found.</p>
        )}
      </div>
    </div>
  );
};
