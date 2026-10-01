import React, { useEffect, useState } from 'react';
import { CreditCard, DollarSign, ShieldCheck } from 'lucide-react';
import { fetchApi } from '../../api/client';
import { SEO } from '../../components/SEO';

export const AdminPayments: React.FC = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPayments = async () => {
      setLoading(true);
      const res = await fetchApi<{ orders: any[] }>('/orders?limit=50');
      if (res.success && res.data) {
        setOrders(res.data.orders);
      }
      setLoading(false);
    };
    loadPayments();
  }, []);

  return (
    <div className="space-y-6">
      <SEO title="Payment Gateway Log — Admin KING DAY" />

      <div>
        <h1 className="text-2xl font-extrabold text-white">Payment Transactions</h1>
        <p className="text-slate-400 text-xs mt-0.5">
          Real-time payment transaction logs from PostgreSQL & Razorpay gateway.
        </p>
      </div>

      <div className="bg-slate-950 rounded-3xl border border-slate-800 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-slate-400 text-xs">Loading payment transactions...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="uppercase text-slate-400 bg-slate-900/60 font-bold border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Order #</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Payment Method</th>
                  <th className="py-3 px-4">Payment Status</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50 text-slate-300 font-medium">
                {orders.map((o) => (
                  <tr key={o.id} className="hover:bg-slate-900/50">
                    <td className="py-3 px-4 font-bold text-white">#{o.orderNumber}</td>
                    <td className="py-3 px-4 font-bold text-slate-300">{o.customer?.name || 'Guest'}</td>
                    <td className="py-3 px-4 font-bold text-brand-purple">{o.paymentMethod}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${o.paymentStatus === 'PAID' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}`}>
                        {o.paymentStatus}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-bold text-white">
                      ₹{Number(o.totalAmount).toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-4 text-slate-500">
                      {new Date(o.createdAt).toLocaleDateString('en-IN')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
