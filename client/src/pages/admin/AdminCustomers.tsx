import React, { useEffect, useState } from 'react';
import { Users, Search, Mail, Phone, ShoppingBag, RefreshCw } from 'lucide-react';
import { fetchApi } from '../../api/client';
import { SEO } from '../../components/SEO';

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  active: boolean;
  createdAt: string;
  orderCount: number;
  totalSpend: number;
}

export const AdminCustomers: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [total, setTotal] = useState(0);

  const loadCustomers = async (q = '') => {
    setLoading(true);
    const qs = q.trim() ? `?search=${encodeURIComponent(q.trim())}` : '';
    const res = await fetchApi<{ customers: Customer[]; pagination: { total: number } }>(`/customers${qs}`);
    if (res.success && res.data) {
      setCustomers(res.data.customers);
      setTotal(res.data.pagination.total);
    }
    setLoading(false);
  };

  useEffect(() => { loadCustomers(); }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadCustomers(search);
  };

  return (
    <div className="space-y-6">
      <SEO title="Customer Directory — Admin KING DAY" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white">Customer Directory</h1>
          <p className="text-slate-400 text-xs mt-0.5">
            {total} registered customer{total !== 1 ? 's' : ''} — contact details and lifetime spend.
          </p>
        </div>
        <button
          onClick={() => loadCustomers(search)}
          className="flex items-center space-x-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition-colors min-h-[40px]"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh</span>
        </button>
      </div>

      {/* Search */}
      <form onSubmit={handleSearchSubmit} className="flex gap-2 max-w-md">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search by name, email, or phone…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-purple"
          />
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
        </div>
        <button
          type="submit"
          className="px-4 py-2 bg-brand-purple text-white rounded-xl text-xs font-bold hover:bg-brand-blue transition-colors min-h-[36px]"
        >
          Search
        </button>
      </form>

      {/* Table */}
      <div className="bg-slate-950 rounded-3xl border border-slate-800 overflow-hidden">
        {loading ? (
          <div className="p-10 text-center text-slate-400 text-xs flex items-center justify-center space-x-2">
            <div className="w-4 h-4 border-2 border-brand-purple border-t-transparent rounded-full animate-spin" />
            <span>Loading customer directory…</span>
          </div>
        ) : customers.length === 0 ? (
          <div className="p-10 text-center space-y-2">
            <Users className="w-10 h-10 text-slate-700 mx-auto" />
            <p className="text-slate-400 text-xs">No customers found{search ? ` for "${search}"` : ''}.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="uppercase text-slate-400 bg-slate-900/60 font-bold border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Contact</th>
                  <th className="py-3 px-4 text-center">Orders</th>
                  <th className="py-3 px-4 text-right">Total Spend</th>
                  <th className="py-3 px-4">Registered</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50 text-slate-300 font-medium">
                {customers.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-900/50">
                    <td className="py-3 px-4">
                      <span className="font-bold text-white block">{c.name}</span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${c.active ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {c.active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="py-3 px-4 space-y-1">
                      <div className="flex items-center space-x-1.5 text-slate-400">
                        <Mail className="w-3 h-3 shrink-0" />
                        <span className="truncate max-w-[180px]">{c.email}</span>
                      </div>
                      <div className="flex items-center space-x-1.5 text-slate-400">
                        <Phone className="w-3 h-3 shrink-0" />
                        <span>{c.phone}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center space-x-1">
                        <ShoppingBag className="w-3.5 h-3.5 text-brand-purple" />
                        <span className="font-bold text-white">{c.orderCount}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-emerald-400">
                      ₹{c.totalSpend.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-4 text-slate-500">
                      {new Date(c.createdAt).toLocaleDateString('en-IN')}
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
