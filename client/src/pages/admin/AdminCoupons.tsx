import React, { useEffect, useState } from 'react';
import { Plus, Tag, Trash2, Edit2, X, Check, Calendar } from 'lucide-react';
import { fetchApi } from '../../api/client';
import { Coupon } from '../../types';
import { SEO } from '../../components/SEO';

export const AdminCoupons: React.FC = () => {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    code: '',
    type: 'PERCENTAGE' as 'PERCENTAGE' | 'FIXED_AMOUNT',
    value: 10,
    minimumOrderAmount: 1000,
    maximumDiscount: 500,
    active: true
  });

  const loadCoupons = async () => {
    setLoading(true);
    const res = await fetchApi<Coupon[]>('/coupons');
    if (res.success && res.data) setCoupons(res.data);
    setLoading(false);
  };

  useEffect(() => {
    loadCoupons();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetchApi('/coupons', {
      method: 'POST',
      body: JSON.stringify({
        ...formData,
        value: Number(formData.value),
        minimumOrderAmount: Number(formData.minimumOrderAmount),
        maximumDiscount: formData.maximumDiscount ? Number(formData.maximumDiscount) : undefined
      })
    });

    if (res.success) {
      setIsModalOpen(false);
      loadCoupons();
    }
  };

  return (
    <div className="space-y-6">
      <SEO title="Coupon Management — Admin KING DAY" />

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-white">Coupons & Promo Codes</h1>
          <p className="text-slate-400 text-xs mt-0.5">Create discount codes and set minimum purchase rules.</p>
        </div>
        <button
          onClick={() => {
            setFormData({ code: '', type: 'PERCENTAGE', value: 10, minimumOrderAmount: 1000, maximumDiscount: 500, active: true });
            setIsModalOpen(true);
          }}
          className="px-4 py-2.5 bg-brand-purple text-white font-bold text-xs rounded-xl hover:bg-brand-pink transition-all shadow-brand-glow flex items-center space-x-2 min-h-[44px]"
        >
          <Plus className="w-4 h-4" />
          <span>Create Coupon Code</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {coupons.map((coupon) => (
          <div key={coupon.id} className="bg-slate-950 p-5 rounded-3xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="px-3 py-1 bg-brand-purple/20 text-brand-purple font-mono font-black text-sm rounded-lg">
                {coupon.code}
              </span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${coupon.active ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-500'}`}>
                {coupon.active ? 'Active' : 'Inactive'}
              </span>
            </div>

            <div className="space-y-1 text-xs">
              <p className="text-white font-bold">
                Discount: {coupon.type === 'PERCENTAGE' ? `${coupon.value}% OFF` : `₹${coupon.value} OFF`}
              </p>
              <p className="text-slate-400">Min Order: ₹{Number(coupon.minimumOrderAmount).toLocaleString('en-IN')}</p>
              {coupon.maximumDiscount && (
                <p className="text-slate-400">Max Discount: ₹{Number(coupon.maximumDiscount).toLocaleString('en-IN')}</p>
              )}
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full text-slate-100 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-extrabold text-base">Create New Coupon</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-400 mb-1">Coupon Code (Uppercase) *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. FESTIVE20"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl focus:outline-none focus:border-brand-purple font-mono uppercase"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-400 mb-1">Discount Type *</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl focus:outline-none focus:border-brand-purple"
                  >
                    <option value="PERCENTAGE">Percentage (%)</option>
                    <option value="FIXED_AMOUNT">Fixed Amount (₹)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-400 mb-1">Value *</label>
                  <input
                    type="number"
                    required
                    value={formData.value}
                    onChange={(e) => setFormData({ ...formData, value: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl focus:outline-none focus:border-brand-purple"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-400 mb-1">Min Order Amount (₹)</label>
                  <input
                    type="number"
                    value={formData.minimumOrderAmount}
                    onChange={(e) => setFormData({ ...formData, minimumOrderAmount: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl focus:outline-none focus:border-brand-purple"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-400 mb-1">Max Discount (₹)</label>
                  <input
                    type="number"
                    value={formData.maximumDiscount}
                    onChange={(e) => setFormData({ ...formData, maximumDiscount: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl focus:outline-none focus:border-brand-purple"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-3 border-t border-slate-800">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 bg-slate-800 rounded-xl font-bold">
                  Cancel
                </button>
                <button type="submit" className="px-6 py-2 bg-brand-purple text-white font-bold rounded-xl hover:bg-brand-pink">
                  Create Coupon
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
