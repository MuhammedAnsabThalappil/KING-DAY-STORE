import React, { useEffect, useState } from 'react';
import { Plus, Image as ImageIcon, Trash2, X } from 'lucide-react';
import { fetchApi } from '../../api/client';
import { Banner } from '../../types';
import { SEO } from '../../components/SEO';
import { ImageUploader } from '../../components/ImageUploader';

export const AdminBanners: React.FC = () => {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    imageUrl: '',
    link: '/shop',
    sortOrder: 1
  });

  const loadBanners = async () => {
    setLoading(true);
    const res = await fetchApi<Banner[]>('/banners?activeOnly=false');
    if (res.success && res.data) setBanners(res.data);
    setLoading(false);
  };

  useEffect(() => {
    loadBanners();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetchApi('/banners', {
      method: 'POST',
      body: JSON.stringify(formData)
    });
    if (res.success) {
      setIsModalOpen(false);
      loadBanners();
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete banner?')) return;
    const res = await fetchApi(`/banners/${id}`, { method: 'DELETE' });
    if (res.success) loadBanners();
  };

  return (
    <div className="space-y-6">
      <SEO title="Banner Manager — Admin KING DAY" />

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-white">Promotional Hero Banners</h1>
          <p className="text-slate-400 text-xs mt-0.5">Manage homepage hero slides and campaign banners.</p>
        </div>
        <button
          onClick={() => {
            setFormData({
              title: '',
              subtitle: '',
              imageUrl: '',
              link: '/shop',
              sortOrder: 1
            });
            setIsModalOpen(true);
          }}
          className="px-4 py-2.5 bg-brand-purple text-white font-bold text-xs rounded-xl hover:bg-brand-pink transition-all shadow-brand-glow flex items-center space-x-2 min-h-[44px]"
        >
          <Plus className="w-4 h-4" />
          <span>Add Hero Banner</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {banners.map((b) => (
          <div key={b.id} className="bg-slate-950 rounded-3xl border border-slate-800 overflow-hidden space-y-3 p-4">
            <img src={b.imageUrl} alt={b.title} className="w-full h-40 object-cover rounded-2xl bg-slate-900" />
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-extrabold text-white text-base">{b.title}</h3>
                <p className="text-xs text-slate-400">{b.subtitle}</p>
                <span className="text-[10px] text-brand-purple font-mono block mt-1">Link: {b.link}</span>
              </div>
              <button onClick={() => handleDelete(b.id)} className="p-2 text-slate-400 hover:text-red-400">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full text-slate-100 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-extrabold text-base">Create Hero Banner</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-400 mb-1">Title *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl focus:outline-none focus:border-brand-purple"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-400 mb-1">Subtitle</label>
                <input
                  type="text"
                  value={formData.subtitle}
                  onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl focus:outline-none focus:border-brand-purple"
                />
              </div>

              <ImageUploader
                label="Hero Banner Image *"
                value={formData.imageUrl}
                onChange={(url) => setFormData({ ...formData, imageUrl: url })}
              />

              <div>
                <label className="block font-bold text-slate-400 mb-1">CTA Link Route</label>
                <input
                  type="text"
                  value={formData.link}
                  onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl focus:outline-none focus:border-brand-purple"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-3 border-t border-slate-800">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 bg-slate-800 rounded-xl font-bold">
                  Cancel
                </button>
                <button type="submit" className="px-6 py-2 bg-brand-purple text-white font-bold rounded-xl hover:bg-brand-pink">
                  Create Banner
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
