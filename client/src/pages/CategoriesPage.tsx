import React, { useEffect, useState } from 'react';
import { fetchApi } from '../api/client';
import { Category } from '../types';
import { CategoryCard } from '../components/CategoryCard';
import { SEO } from '../components/SEO';

export const CategoriesPage: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCategories = async () => {
      setLoading(true);
      const res = await fetchApi<Category[]>('/categories');
      if (res.success && res.data) setCategories(res.data);
      setLoading(false);
    };
    loadCategories();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      <SEO
        title="Product Categories — KING DAY STORE"
        description="Explore all categories of electric ride-ons, cycles, tricycles, toys, and baby strollers at KING DAY."
      />

      <div>
        <h1 className="text-3xl font-extrabold text-slate-900">All Product Categories</h1>
        <p className="text-slate-500 text-sm mt-1">
          Browse through our curated collection of children's ride-ons, cycles, toys, and essentials.
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-64 bg-slate-200 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
          {categories.map((cat) => (
            <CategoryCard key={cat.id} category={cat} />
          ))}
        </div>
      )}
    </div>
  );
};
