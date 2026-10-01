import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Filter, SlidersHorizontal, Search as SearchIcon, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { fetchApi } from '../api/client';
import { Product, Category } from '../types';
import { ProductCard } from '../components/ProductCard';
import { SEO } from '../components/SEO';

export const ShopPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 12, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);

  // Filter params
  const searchQuery = searchParams.get('search') || '';
  const categorySlug = searchParams.get('category') || '';
  const brandParam = searchParams.get('brand') || '';
  const minPrice = searchParams.get('minPrice') || '';
  const maxPrice = searchParams.get('maxPrice') || '';
  const featured = searchParams.get('featured') || '';
  const sortBy = searchParams.get('sortBy') || 'newest';
  const page = parseInt(searchParams.get('page') || '1', 10);

  useEffect(() => {
    const loadCategories = async () => {
      const res = await fetchApi<Category[]>('/categories');
      if (res.success && res.data) setCategories(res.data);
    };
    loadCategories();
  }, []);

  useEffect(() => {
    const loadProducts = async () => {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '12',
        sortBy
      });

      if (searchQuery) params.append('search', searchQuery);
      if (categorySlug) params.append('categorySlug', categorySlug);
      if (brandParam) params.append('brand', brandParam);
      if (minPrice) params.append('minPrice', minPrice);
      if (maxPrice) params.append('maxPrice', maxPrice);
      if (featured) params.append('featured', featured);

      const res = await fetchApi<{ products: Product[]; pagination: any }>(`/products?${params.toString()}`);

      if (res.success && res.data) {
        setProducts(res.data.products);
        setPagination(res.data.pagination);
      }
      setLoading(false);
    };

    loadProducts();
  }, [searchParams]);

  const updateParam = (key: string, value: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    newParams.set('page', '1'); // reset page on filter change
    setSearchParams(newParams);
  };

  const clearAllFilters = () => {
    setSearchParams(new URLSearchParams());
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 md:py-8 space-y-6">
      <SEO
        title="Shop All Kids Products — Electric Ride-Ons, Cycles & Toys"
        description="Browse the full catalog of KING DAY STORE kids products, battery operated cars, jeeps, balance bikes, and strollers."
      />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900">
            {searchQuery ? `Search Results for "${searchQuery}"` : 'Shop Catalog'}
          </h1>
          <p className="text-slate-500 text-xs md:text-sm mt-0.5">
            Showing {pagination.total} high quality products
          </p>
        </div>

        {/* Sort & Mobile Filter Toggle */}
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setFilterDrawerOpen(!filterDrawerOpen)}
            className="md:hidden flex items-center space-x-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 shadow-sm min-h-[44px]"
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>Filters</span>
          </button>

          <div className="flex items-center space-x-2">
            <label className="text-xs font-semibold text-slate-500 hidden sm:inline">Sort By:</label>
            <select
              value={sortBy}
              onChange={(e) => updateParam('sortBy', e.target.value)}
              className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs md:text-sm font-semibold text-slate-800 focus:outline-none focus:border-brand-purple min-h-[44px]"
            >
              <option value="newest">Newest Arrivals</option>
              <option value="featured">Featured First</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="name">Name: A to Z</option>
            </select>
          </div>
        </div>
      </div>

      <div className="flex gap-8">
        {/* Desktop Sidebar Filters */}
        <aside className="hidden md:block w-64 shrink-0 space-y-6">
          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-extrabold text-sm uppercase text-slate-800 flex items-center space-x-2">
                <Filter className="w-4 h-4 text-brand-purple" />
                <span>Filters</span>
              </h3>
              {(categorySlug || brandParam || minPrice || maxPrice || searchQuery || featured) && (
                <button
                  onClick={clearAllFilters}
                  className="text-xs font-bold text-brand-pink hover:underline"
                >
                  Clear All
                </button>
              )}
            </div>

            {/* Categories Filter */}
            <div>
              <h4 className="font-bold text-xs uppercase text-slate-400 mb-2">Category</h4>
              <div className="space-y-1 max-h-56 overflow-y-auto pr-1">
                <button
                  onClick={() => updateParam('category', '')}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                    !categorySlug ? 'bg-brand-purple text-white' : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  All Categories
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => updateParam('category', cat.slug)}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                      categorySlug === cat.slug ? 'bg-brand-purple text-white' : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Price Filter */}
            <div>
              <h4 className="font-bold text-xs uppercase text-slate-400 mb-2">Price Range (₹)</h4>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={minPrice}
                  onChange={(e) => updateParam('minPrice', e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:outline-none focus:bg-white focus:border-brand-purple"
                />
                <input
                  type="number"
                  placeholder="Max"
                  value={maxPrice}
                  onChange={(e) => updateParam('maxPrice', e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:outline-none focus:bg-white focus:border-brand-purple"
                />
              </div>
            </div>

            {/* Featured Only */}
            <div className="pt-2">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={featured === 'true'}
                  onChange={(e) => updateParam('featured', e.target.checked ? 'true' : '')}
                  className="rounded text-brand-purple focus:ring-brand-purple w-4 h-4"
                />
                <span className="text-xs font-bold text-slate-700">Featured Items Only</span>
              </label>
            </div>
          </div>
        </aside>

        {/* Main Products Grid */}
        <div className="flex-1 space-y-6">
          {loading ? (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-80 bg-slate-200 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="bg-white p-12 rounded-3xl border border-slate-100 shadow-sm text-center space-y-4">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 mx-auto">
                <SearchIcon className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-slate-800">No Products Found</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                We couldn't find any products matching your active filter criteria. Try adjusting your search query or clearing filters.
              </p>
              <button
                onClick={clearAllFilters}
                className="px-6 py-2.5 rounded-full bg-brand-purple text-white font-bold text-xs hover:bg-brand-blue transition-all"
              >
                Clear All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}

          {/* Pagination Controls */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-center space-x-2 pt-6">
              <button
                disabled={page <= 1}
                onClick={() => updateParam('page', (page - 1).toString())}
                className="p-2.5 rounded-xl border border-slate-200 bg-white text-slate-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 min-h-[44px] min-w-[44px] flex items-center justify-center"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <span className="text-xs font-bold text-slate-700 px-4">
                Page {pagination.page} of {pagination.totalPages}
              </span>
              <button
                disabled={page >= pagination.totalPages}
                onClick={() => updateParam('page', (page + 1).toString())}
                className="p-2.5 rounded-xl border border-slate-200 bg-white text-slate-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 min-h-[44px] min-w-[44px] flex items-center justify-center"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
