import React, { useEffect, useState } from 'react';
import { Users, Mail, Phone, ShoppingBag } from 'lucide-react';
import { fetchApi } from '../../api/client';
import { SEO } from '../../components/SEO';

export const AdminCustomers: React.FC = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCustomers = async () => {
      setLoading(true);
      const res = await fetchApi<{ orders: any[] }>('/orders?limit=50');
      if (res.success && res.data) {
        setOrders(res.data.orders);
      }
      setLoading(false);
    };
    loadCustomers();
  }, []);

  return (
    <div className="space-y-6">
      <SEO title="Customer Directory — Admin KING DAY" />

      <div>
        <h1 className="text-2xl font-extrabold text-white">Customer Directory</h1>
        <p className="text-slate-400 text-xs mt-0.5">Contact details and order histories of customer accounts.</p>
      </div>

      <div className="bg-slate-950 rounded-3xl border border-slate-800 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-slate-400 text-xs">Loading customer directory...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="uppercase text-slate-400 bg-slate-900/60 font-bold border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Customer Name</th>
                  <th className="py-3 px-4">Email Address</th>
                  <th className="py-3 px-4">Phone Number</th>
                  <th className="py-3 px-4">Latest Order</th>
                  <th className="py-3 px-4">Total Spend</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50 text-slate-300 font-medium">
                {orders.map((o) => (
                  <tr key={o.id} className="hover:bg-slate-900/50">
                    <td className="py-3 px-4 font-bold text-white">{o.customer?.name || 'Guest Customer'}</td>
                    <td className="py-3 px-4 text-slate-400">{o.customer?.email || '—'}</td>
                    <td className="py-3 px-4 text-slate-400">{o.customer?.phone || '—'}</td>
                    <td className="py-3 px-4 font-bold text-brand-purple">#{o.orderNumber}</td>
                    <td className="py-3 px-4 font-bold text-emerald-400">
                      ₹{Number(o.totalAmount).toLocaleString('en-IN')}
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
