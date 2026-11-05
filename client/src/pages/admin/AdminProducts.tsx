import React, { useEffect, useState } from 'react';
import { Plus, Search, Edit2, Trash2, Check, X, Image as ImageIcon, Sparkles } from 'lucide-react';
import { fetchApi } from '../../api/client';
import { Product, Category } from '../../types';
import { ImageUploader } from '../../components/ImageUploader';
import { AiProductModal } from '../../components/AiProductModal';
import { useToast } from '../../contexts/ToastContext';
import { SEO } from '../../components/SEO';

export const AdminProducts: React.FC = () => {
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    brand: 'KING DAY',
    categoryId: '',
    description: '',
    shortDescription: '',
    mrp: 19999,
    salePrice: 14999,
    stock: 10,
    lowStockThreshold: 3,
    featured: false,
    imageUrl: 'https://images.unsplash.com/photo-1594787318286-3d835c1d207f?auto=format&fit=crop&w=800&q=80',
    features: ['2.4G Parental Remote Control', 'Bluetooth Music Player', 'Dual Rechargeable Batteries']
  });

  const handleApplyAiData = (extracted: any) => {
    setFormData((prev) => ({
      ...prev,
      name: extracted.name || prev.name,
      sku: extracted.sku || prev.sku || `KD-SKU-${Math.floor(1000 + Math.random() * 9000)}`,
      brand: extracted.brand || prev.brand || 'KING DAY',
      categoryId: extracted.categoryId || prev.categoryId || (categories[0]?.id || ''),
      description: extracted.description || prev.description,
      shortDescription: extracted.shortDescription || prev.shortDescription,
      mrp: Number(extracted.mrp) || prev.mrp,
      salePrice: Number(extracted.salePrice) || prev.salePrice,
      stock: Number(extracted.stock) || prev.stock,
      lowStockThreshold: Number(extracted.lowStockThreshold) || prev.lowStockThreshold,
      features: Array.isArray(extracted.features) ? extracted.features : prev.features,
      imageUrl: extracted.suggestedImages?.[0] || prev.imageUrl
    }));
    toast.success('✓ Product details added to form');
    setIsModalOpen(true);
  };

  const loadData = async () => {
    setLoading(true);
    const [pRes, cRes] = await Promise.all([
      fetchApi<{ products: Product[] }>(`/products?search=${encodeURIComponent(search)}&activeOnly=false&limit=50`),
      fetchApi<Category[]>('/categories')
    ]);

    if (pRes.success && pRes.data) setProducts(pRes.data.products);
    if (cRes.success && cRes.data) {
      setCategories(cRes.data);
      if (!formData.categoryId && cRes.data.length > 0) {
        const firstId = cRes.data[0].id;
        setFormData((prev) => ({ ...prev, categoryId: firstId }));
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [search]);

  const handleCreateOrUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setFeedbackMsg(null);

    const payload = {
      ...formData,
      mrp: Number(formData.mrp),
      salePrice: Number(formData.salePrice),
      stock: Number(formData.stock),
      lowStockThreshold: Number(formData.lowStockThreshold),
      images: formData.imageUrl ? [{ imageUrl: formData.imageUrl, isPrimary: true }] : undefined
    };

    if (editingId) {
      const res = await fetchApi(`/products/${editingId}`, {
        method: 'PUT',
        body: JSON.stringify(payload)
      });
      setSubmitting(false);
      if (res.success) {
        toast.success('Product updated successfully');
        setFeedbackMsg({ type: 'success', text: 'Product updated successfully in PostgreSQL database!' });
        setTimeout(() => {
          setIsModalOpen(false);
          setEditingId(null);
          loadData();
        }, 800);
      } else {
        toast.error('Could not save product. Please try again.');
        setFeedbackMsg({ type: 'error', text: res.error?.message || 'Failed to update product' });
      }
    } else {
      const res = await fetchApi('/products', {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      setSubmitting(false);
      if (res.success) {
        toast.success('Product added successfully');
        setFeedbackMsg({ type: 'success', text: 'New Product created successfully in PostgreSQL database!' });
        setTimeout(() => {
          setIsModalOpen(false);
          loadData();
        }, 800);
      } else {
        toast.error('Could not save product. Please try again.');
        setFeedbackMsg({ type: 'error', text: res.error?.message || 'Failed to create product' });
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete or deactivate this product?')) return;
    const res = await fetchApi(`/products/${id}`, { method: 'DELETE' });
    if (res.success) {
      toast.success('Product deleted successfully');
      loadData();
    } else {
      toast.error('Failed to delete product.');
    }
  };

  const openCreateModal = () => {
    setEditingId(null);
    setFeedbackMsg(null);
    setFormData({
      name: '',
      sku: `KD-SKU-${Math.floor(1000 + Math.random() * 9000)}`,
      brand: 'KING DAY',
      categoryId: categories[0]?.id || '',
      description: 'Premium quality children product built for max durability and safety.',
      shortDescription: 'Certified safe build with full warranty.',
      mrp: 19999,
      salePrice: 14999,
      stock: 10,
      lowStockThreshold: 3,
      featured: false,
      imageUrl: 'https://images.unsplash.com/photo-1594787318286-3d835c1d207f?auto=format&fit=crop&w=800&q=80',
      features: ['Heavy Duty Dual Motor', 'Parental Remote Control', 'LED Working Headlights']
    });
    setIsModalOpen(true);
  };

  const openEditModal = (product: Product) => {
    setEditingId(product.id);
    setFeedbackMsg(null);
    setFormData({
      name: product.name,
      sku: product.sku,
      brand: product.brand || 'KING DAY',
      categoryId: product.categoryId,
      description: product.description,
      shortDescription: product.shortDescription || '',
      mrp: Number(product.mrp),
      salePrice: Number(product.salePrice),
      stock: product.inventory?.quantity || 10,
      lowStockThreshold: product.inventory?.lowStockThreshold || 3,
      featured: product.featured,
      imageUrl: product.images?.[0]?.imageUrl || '',
      features: product.features?.map((f) => f.feature) || []
    });
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <SEO title="Product Management — Admin KING DAY" />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white">Product Catalog Management</h1>
          <p className="text-slate-400 text-xs mt-0.5">Manage products, SKUs, inventory stock, and pricing.</p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsAiModalOpen(true)}
            className="px-4 py-2.5 bg-gradient-to-r from-brand-purple to-brand-pink text-white font-bold text-xs rounded-xl hover:shadow-brand-glow transition-all flex items-center justify-center space-x-2 min-h-[44px]"
          >
            <Sparkles className="w-4 h-4 text-brand-yellow" />
            <span>✨ AI Fill Product Details</span>
          </button>
          <button
            onClick={openCreateModal}
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl transition-all flex items-center justify-center space-x-2 min-h-[44px]"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Product</span>
          </button>
        </div>
      </div>

      {/* Search Input */}
      <div className="flex items-center space-x-2 max-w-md">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search by product name or SKU..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-purple"
          />
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-slate-950 rounded-3xl border border-slate-800 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-slate-400 text-xs">Loading product database...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="uppercase text-slate-400 bg-slate-900/60 font-bold border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Product</th>
                  <th className="py-3 px-4">SKU</th>
                  <th className="py-3 px-4">MRP / Sale Price</th>
                  <th className="py-3 px-4">Stock</th>
                  <th className="py-3 px-4">Featured</th>
                  <th className="py-3 px-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50 text-slate-300">
                {products.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-900/50">
                    <td className="py-3 px-4 flex items-center space-x-3">
                      <img
                        src={p.images?.[0]?.imageUrl || 'https://images.unsplash.com/photo-1594787318286-3d835c1d207f?auto=format&fit=crop&w=100&q=80'}
                        alt={p.name}
                        className="w-10 h-10 rounded-lg object-cover bg-slate-800"
                      />
                      <div>
                        <span className="font-bold text-white block max-w-xs truncate">{p.name}</span>
                        <span className="text-[10px] text-slate-500">{p.category?.name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-400">{p.sku}</td>
                    <td className="py-3 px-4">
                      <span className="font-bold text-white">₹{Number(p.salePrice).toLocaleString('en-IN')}</span>
                      <span className="text-slate-500 line-through block text-[10px]">₹{Number(p.mrp).toLocaleString('en-IN')}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${(p.inventory?.availableQuantity ?? 0) <= 3 ? 'bg-red-500/20 text-red-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                        {p.inventory?.availableQuantity ?? 0} In Stock
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {p.featured ? <span className="text-brand-yellow font-bold">Yes</span> : <span className="text-slate-600">No</span>}
                    </td>
                    <td className="py-3 px-4 space-x-2">
                      <button onClick={() => openEditModal(p)} className="p-1.5 text-slate-400 hover:text-white">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(p.id)} className="p-1.5 text-slate-400 hover:text-red-400">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 max-w-2xl w-full text-slate-100 space-y-4 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-3">
                <h3 className="font-extrabold text-lg">{editingId ? 'Edit Product' : 'Create New Product'}</h3>
                {!editingId && (
                  <button
                    type="button"
                    onClick={() => setIsAiModalOpen(true)}
                    className="px-3 py-1.5 bg-gradient-to-r from-brand-purple to-brand-pink text-white font-bold text-xs rounded-xl hover:shadow-brand-glow transition-all flex items-center space-x-1.5"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-brand-yellow" />
                    <span>✨ AI Fill Details</span>
                  </button>
                )}
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {feedbackMsg && (
              <div className={`p-3 rounded-xl text-xs font-bold ${feedbackMsg.type === 'success' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-red-500/20 text-red-300'}`}>
                {feedbackMsg.text}
              </div>
            )}

            <form onSubmit={handleCreateOrUpdate} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1.5">Product Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="form-input-dark"
                    placeholder="e.g. Mercedes Ride-On SUV"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1.5">SKU *</label>
                  <input
                    type="text"
                    required
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    className="form-input-dark font-mono"
                    placeholder="KD-SKU-1001"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1.5">MRP (₹) *</label>
                  <input
                    type="number"
                    required
                    value={formData.mrp}
                    onChange={(e) => setFormData({ ...formData, mrp: parseFloat(e.target.value) })}
                    className="form-input-dark"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1.5">Sale Price (₹) *</label>
                  <input
                    type="number"
                    required
                    value={formData.salePrice}
                    onChange={(e) => setFormData({ ...formData, salePrice: parseFloat(e.target.value) })}
                    className="form-input-dark"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1.5">Initial Stock Units *</label>
                  <input
                    type="number"
                    required
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value, 10) })}
                    className="form-input-dark"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1.5">Category *</label>
                <select
                  value={formData.categoryId}
                  onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                  className="form-input-dark"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id} className="bg-slate-900 text-white">{c.name}</option>
                  ))}
                </select>
              </div>

              {/* Upload Image Component */}
              <ImageUploader
                label="Product Primary Image *"
                value={formData.imageUrl}
                onChange={(url) => setFormData({ ...formData, imageUrl: url })}
              />

              <div>
                <label className="block font-semibold text-slate-300 mb-1.5">Full Description *</label>
                <textarea
                  rows={3}
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="form-input-dark resize-none"
                />
              </div>

              <div className="flex items-center space-x-2 pt-2">
                <input
                  type="checkbox"
                  id="featured"
                  checked={formData.featured}
                  onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                  className="w-4 h-4 rounded text-brand-purple focus:ring-brand-purple bg-slate-950 border-slate-800"
                />
                <label htmlFor="featured" className="font-semibold text-slate-300 text-xs">Feature this product on Homepage Hero & Showcase</label>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl bg-slate-800 text-slate-300 font-semibold hover:bg-slate-700 min-h-[44px]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-brand-purple to-brand-pink text-white font-bold hover:shadow-brand-glow transition-all disabled:opacity-50 min-h-[44px]"
                >
                  {submitting ? 'Saving Product...' : editingId ? 'Save Changes' : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* AI Assistant Modal */}
      <AiProductModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        onApply={handleApplyAiData}
        categories={categories}
      />
    </div>
  );
};
