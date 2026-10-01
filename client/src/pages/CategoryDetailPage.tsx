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
        <div className="h-10 bg-slate-200 w-1/3 rounded-xl" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-72 bg-slate-200 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold text-slate-800">Category Not Found</h2>
        <Link to="/categories" className="text-brand-purple font-bold text-sm underline mt-2 inline-block">
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
      <div className="rounded-3xl bg-gradient-to-r from-brand-blue to-brand-purple p-8 md:p-12 text-white shadow-xl">
        <h1 className="text-3xl md:text-4xl font-extrabold mb-2">{category.name}</h1>
        {category.description && (
          <p className="text-slate-200 text-sm md:text-base max-w-2xl">{category.description}</p>
        )}
        {category.children && category.children.length > 0 && (
          <div className="pt-4 flex flex-wrap gap-2">
            {category.children.map((sub) => (
              <Link
                key={sub.id}
                to={`/category/${sub.slug}`}
                className="bg-white/20 hover:bg-white/30 backdrop-blur-md px-3.5 py-1.5 rounded-full text-xs font-semibold text-white transition-colors"
              >
                {sub.name}
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Products */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-slate-900">
          Products in {category.name} ({products.length})
        </h2>
        {products.length === 0 ? (
          <div className="p-12 bg-white rounded-2xl text-center text-slate-500">
            No products currently available in this category.
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
