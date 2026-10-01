import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, ShieldCheck, Truck, MessageCircle, Star, Phone } from 'lucide-react';
import { fetchApi } from '../api/client';
import { Product, Category, Banner } from '../types';
import { ProductCard } from '../components/ProductCard';
import { CategoryCard } from '../components/CategoryCard';
import { BannerSlider } from '../components/BannerSlider';
import { SEO } from '../components/SEO';

export const HomePage: React.FC = () => {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [newArrivals, setNewArrivals] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadHomeData = async () => {
      setLoading(true);
      const [bRes, cRes, pRes, nRes] = await Promise.all([
        fetchApi<Banner[]>('/banners'),
        fetchApi<Category[]>('/categories'),
        fetchApi<{ products: Product[] }>('/products?featured=true&limit=8'),
        fetchApi<{ products: Product[] }>('/products?sortBy=newest&limit=8')
      ]);

      if (bRes.success && bRes.data) setBanners(bRes.data);
      if (cRes.success && cRes.data) setCategories(cRes.data);
      if (pRes.success && pRes.data) setFeaturedProducts(pRes.data.products);
      if (nRes.success && nRes.data) setNewArrivals(nRes.data.products);

      setLoading(false);
    };

    loadHomeData();
  }, []);

  return (
    <div className="space-y-10 md:space-y-14 pb-8">
      <SEO
        title="KING DAY — Fun • Quality • Happiness | Kids Electric Ride-Ons, Tractors & Bicycles"
        description="Shop luxury 4x4 electric ride-on jeeps, electric farm tractors, sports bicycles, strollers, and baby essentials at KING DAY STORE. Fast shipping across India."
      />

      {/* 1. Hero Banner Section */}
      <section className="max-w-7xl mx-auto px-4 pt-3 md:pt-4">
        {banners.length > 0 ? (
          <BannerSlider banners={banners} />
        ) : (
          <div className="relative rounded-3xl bg-gradient-to-r from-brand-blue via-brand-purple to-brand-pink p-6 md:p-14 text-white overflow-hidden shadow-2xl">
            <div className="relative z-10 max-w-2xl space-y-4">
              <span className="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest bg-brand-yellow text-slate-900 shadow-md">
                Premier Kids Collection
              </span>
              <h1 className="text-2xl md:text-5xl font-extrabold leading-tight">
                Fun • Quality • Happiness for Every Child
              </h1>
              <p className="text-slate-100 text-xs md:text-base">
                Explore luxury electric ride-on cars, 4x4 monster jeeps, heavy duty electric tractors, and certified baby products with nationwide fast delivery.
              </p>
              <div className="pt-2 flex flex-wrap gap-3">
                <Link
                  to="/shop"
                  className="px-5 py-3 rounded-full font-bold text-xs md:text-sm bg-white text-brand-purple hover:bg-slate-100 shadow-lg transition-all min-h-[44px] flex items-center"
                >
                  Shop Catalog
                </Link>
                <a
                  href="https://wa.me/919495902904"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-5 py-3 rounded-full font-bold text-xs md:text-sm bg-emerald-500 text-white hover:bg-emerald-600 transition-all flex items-center space-x-2 min-h-[44px]"
                >
                  <MessageCircle className="w-4 h-4 fill-current" />
                  <span>WhatsApp Order</span>
                </a>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* 2. Shop Catalog / Product Discovery Section */}
      <section className="max-w-7xl mx-auto px-4">
        <div className="flex items-end justify-between mb-5">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-brand-purple">
              Product Discovery
            </span>
            <h2 className="text-xl md:text-3xl font-extrabold text-slate-900">
              New Arrivals & Catalog
            </h2>
          </div>
          <Link
            to="/shop"
            className="text-xs md:text-sm font-bold text-brand-purple hover:text-brand-pink flex items-center space-x-1"
          >
            <span>Explore All</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-72 bg-slate-200 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
            {newArrivals.slice(0, 4).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* 3. Shop by Category (Database Driven) */}
      <section className="max-w-7xl mx-auto px-4">
        <div className="flex items-end justify-between mb-5">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-brand-pink">
              Collections
            </span>
            <h2 className="text-xl md:text-3xl font-extrabold text-slate-900">
              SHOP BY CATEGORY
            </h2>
          </div>
          <Link
            to="/categories"
            className="text-xs md:text-sm font-bold text-brand-purple hover:text-brand-pink flex items-center space-x-1"
          >
            <span>All Categories</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-5">
          {categories.map((cat) => (
            <CategoryCard key={cat.id} category={cat} />
          ))}
        </div>
      </section>

      {/* 4. Featured / Best-Selling Products Section */}
      <section className="max-w-7xl mx-auto px-4">
        <div className="flex items-end justify-between mb-5">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-brand-blue flex items-center space-x-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Handpicked Favorites</span>
            </span>
            <h2 className="text-xl md:text-3xl font-extrabold text-slate-900">
              Featured Best Sellers
            </h2>
          </div>
          <Link
            to="/shop?featured=true"
            className="text-xs md:text-sm font-bold text-brand-purple hover:text-brand-pink flex items-center space-x-1"
          >
            <span>View All</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
          {featuredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* 5. Promotional Callout Section */}
      <section className="max-w-7xl mx-auto px-4">
        <div className="rounded-3xl bg-slate-900 text-white p-6 md:p-10 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6 border border-slate-800">
          <div className="space-y-3 z-10 max-w-xl">
            <span className="bg-brand-pink text-white font-extrabold text-[11px] px-3 py-1 rounded-full uppercase tracking-wider">
              WhatsApp Direct Order
            </span>
            <h3 className="text-xl md:text-3xl font-extrabold">
              Need Live Video Demos or Assembly Advice?
            </h3>
            <p className="text-slate-300 text-xs md:text-sm">
              Our experts are ready to share live product videos, answer battery specs, and take direct orders on WhatsApp.
            </p>
            <div className="pt-1">
              <a
                href="https://wa.me/919495902904"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs md:text-sm px-5 py-3 rounded-full transition-all shadow-md min-h-[44px]"
              >
                <MessageCircle className="w-4 h-4 fill-current" />
                <span>Chat on WhatsApp (+91 9495902904)</span>
              </a>
            </div>
          </div>
          <div className="w-full md:w-72 h-40 md:h-52 rounded-2xl overflow-hidden bg-slate-800 shrink-0">
            <img
              src="https://images.unsplash.com/photo-1594787318286-3d835c1d207f?auto=format&fit=crop&w=800&q=80"
              alt="KING DAY Electric Ride On"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </section>

      {/* 6. Why Choose KING DAY */}
      <section className="max-w-7xl mx-auto px-4">
        <div className="bg-white rounded-3xl p-6 md:p-10 border border-slate-100 shadow-sm text-center">
          <h3 className="text-xl md:text-2xl font-extrabold text-slate-900 mb-2">
            Why Parents Trust KING DAY
          </h3>
          <p className="text-slate-500 text-xs max-w-xl mx-auto mb-6">
            We deliver non-toxic safety, uncompromised build quality, and pure happiness to children across India.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
              <div className="w-8 h-8 rounded-lg bg-brand-blue text-white flex items-center justify-center font-bold text-xs">
                01
              </div>
              <h4 className="font-bold text-xs text-slate-800">Factory Tested Quality</h4>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Every electric jeep, bike, and stroller undergoes rigorous battery, motor, and frame safety checks.
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
              <div className="w-8 h-8 rounded-lg bg-brand-purple text-white flex items-center justify-center font-bold text-xs">
                02
              </div>
              <h4 className="font-bold text-xs text-slate-800">Direct WhatsApp Ordering</h4>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Order directly on WhatsApp with pre-filled product links, live video demos, and custom delivery options.
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
              <div className="w-8 h-8 rounded-lg bg-brand-pink text-white flex items-center justify-center font-bold text-xs">
                03
              </div>
              <h4 className="font-bold text-xs text-slate-800">Nationwide Express Shipping</h4>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Fast, insured home delivery across all states in India with real-time order tracking.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
