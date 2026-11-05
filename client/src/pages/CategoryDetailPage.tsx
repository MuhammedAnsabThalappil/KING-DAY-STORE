import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchApi } from '../api/client';
import { Category, Product } from '../types';
import { ProductCard } from '../components/ProductCard';
import { SEO } from '../components/SEO';

export const CategoryDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [category, setCategory] = useState<Category | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCategory = async () => {
      if (!slug) return;
      setLoading(true);
      const [cRes, pRes] = await Promise.all([
        fetchApi<Category>(`/categories/${slug}`),
        fetchApi<{ products: Product[] }>(`/products?categorySlug=${slug}&limit=24`)
      ]);

      if (cRes.success && cRes.data) setCategory(cRes.data);
      if (pRes.success && pRes.data) setProducts(pRes.data.products);
      setLoading(false);
    };

    loadCategory();
  }, [slug]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-6 animate-pulse">
        <div className="h-36 bg-slate-200 rounded-3xl" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-80 bg-slate-200 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center space-y-4">
        <h2 className="text-2xl font-extrabold text-slate-800">Category Not Found</h2>
        <Link to="/categories" className="inline-block px-6 py-3 rounded-full bg-brand-purple text-white font-extrabold text-xs shadow-md">
          View All Categories
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      <SEO
        title={`${category.name} — KING DAY STORE`}
        description={category.description || `Shop ${category.name} online at KING DAY STORE.`}
      />

      {/* Category Banner */}
      <div className="rounded-3xl bg-brand-gradient p-8 md:p-12 text-white shadow-xl space-y-3 relative overflow-hidden">
        <span className="inline-block px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider bg-white/20 backdrop-blur-md text-white">
          Category
        </span>
        <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight">{category.name}</h1>
        {category.description && (
          <p className="text-slate-100 text-sm md:text-base max-w-2xl font-medium leading-relaxed">{category.description}</p>
        )}
        {category.children && category.children.length > 0 && (
          <div className="pt-3 flex flex-wrap gap-2">
            {category.children.map((sub) => (
              <Link
                key={sub.id}
                to={`/category/${sub.slug}`}
                className="bg-white/20 hover:bg-white/30 backdrop-blur-md px-4 py-1.5 rounded-full text-xs font-bold text-white transition-all shadow-xs active:scale-95"
              >
                {sub.name}
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Products */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <h2 className="text-xl md:text-2xl font-extrabold text-slate-900 tracking-tight">
            Products in {category.name} ({products.length})
          </h2>
        </div>
        {products.length === 0 ? (
          <div className="p-12 bg-white rounded-3xl text-center text-slate-500 font-medium border border-slate-100 shadow-2xs">
            No products currently available in this category.
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 md:gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

