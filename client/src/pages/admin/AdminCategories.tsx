import React, { useEffect, useState } from 'react';
import { Plus, FolderTree, Trash2, Edit2, X } from 'lucide-react';
import { fetchApi } from '../../api/client';
import { Category } from '../../types';
import { SEO } from '../../components/SEO';
import { ImageUploader } from '../../components/ImageUploader';

export const AdminCategories: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    imageUrl: '',
    parentId: null as string | null,
    sortOrder: 1
  });

  const loadCategories = async () => {
    setLoading(true);
    const res = await fetchApi<Category[]>('/categories?activeOnly=false');
    if (res.success && res.data) setCategories(res.data);
    setLoading(false);
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      const res = await fetchApi(`/categories/${editingId}`, {
        method: 'PUT',
        body: JSON.stringify(formData)
      });
      if (res.success) {
        setIsModalOpen(false);
        loadCategories();
      }
    } else {
      const res = await fetchApi('/categories', {
        method: 'POST',
        body: JSON.stringify(formData)
      });
      if (res.success) {
        setIsModalOpen(false);
        loadCategories();
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete category?')) return;
    const res = await fetchApi(`/categories/${id}`, { method: 'DELETE' });
    if (res.success) loadCategories();
  };

  return (
    <div className="space-y-6">
      <SEO title="Category Manager — Admin KING DAY" />

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-white">Categories & Subcategories</h1>
          <p className="text-slate-400 text-xs mt-0.5">Manage taxonomy tree, subcategories, and category banners.</p>
        </div>
        <button
          onClick={() => {
            setEditingId(null);
            setFormData({ name: '', slug: '', description: '', imageUrl: '', parentId: null, sortOrder: 1 });
            setIsModalOpen(true);
          }}
          className="px-4 py-2.5 bg-brand-purple text-white font-bold text-xs rounded-xl hover:bg-brand-pink transition-all shadow-brand-glow flex items-center space-x-2 min-h-[44px]"
        >
          <Plus className="w-4 h-4" />
          <span>Add Category</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {categories.map((cat) => (
          <div key={cat.id} className="bg-slate-950 p-5 rounded-3xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-white text-base">{cat.name}</h3>
              <div className="flex space-x-2">
                <button
                  onClick={() => {
                    setEditingId(cat.id);
                    setFormData({
                      name: cat.name,
                      slug: cat.slug,
                      description: cat.description || '',
                      imageUrl: cat.imageUrl || '',
                      parentId: cat.parentId || null,
                      sortOrder: cat.sortOrder
                    });
                    setIsModalOpen(true);
                  }}
                  className="p-1.5 text-slate-400 hover:text-white"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button onClick={() => handleDelete(cat.id)} className="p-1.5 text-slate-400 hover:text-red-400">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            <p className="text-xs text-slate-400 line-clamp-2">{cat.description || 'No description'}</p>
            {cat.children && cat.children.length > 0 && (
              <div className="pt-2 border-t border-slate-800 space-y-1">
                <span className="text-[10px] font-bold text-slate-500 uppercase">Subcategories</span>
                <div className="flex flex-wrap gap-1.5">
                  {cat.children.map((sub) => (
                    <span key={sub.id} className="px-2 py-0.5 rounded-md bg-slate-900 border border-slate-800 text-[11px] font-bold text-slate-300">
                      {sub.name}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full text-slate-100 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-extrabold text-base">{editingId ? 'Edit Category' : 'Create Category'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-400 mb-1">Category Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl focus:outline-none focus:border-brand-purple"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-400 mb-1">Parent Category (Optional)</label>
                <select
                  value={formData.parentId || ''}
                  onChange={(e) => setFormData({ ...formData, parentId: e.target.value || null })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl focus:outline-none focus:border-brand-purple"
                >
                  <option value="">None (Top-Level Category)</option>
                  {categories.filter((c) => c.id !== editingId).map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-400 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl focus:outline-none focus:border-brand-purple"
                />
              </div>

              <ImageUploader
                label="Category Banner / Thumbnail Image"
                value={formData.imageUrl}
                onChange={(url) => setFormData({ ...formData, imageUrl: url })}
              />

              <div className="flex justify-end space-x-3 pt-3 border-t border-slate-800">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 bg-slate-800 rounded-xl font-bold">
                  Cancel
                </button>
                <button type="submit" className="px-6 py-2 bg-brand-purple text-white font-bold rounded-xl hover:bg-brand-pink">
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
