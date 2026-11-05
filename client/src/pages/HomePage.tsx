import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, ShieldCheck, Truck, MessageCircle, Star, Phone, Award, Zap } from 'lucide-react';
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
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const loadHomeData = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const [bRes, cRes, pRes, nRes] = await Promise.all([
        fetchApi<Banner[]>('/banners'),
        fetchApi<Category[]>('/categories'),
        fetchApi<{ products: Product[] }>('/products?featured=true&limit=8'),
        fetchApi<{ products: Product[] }>('/products?sortBy=newest&limit=8')
      ]);

      if (bRes.success && bRes.data) setBanners(bRes.data);
      if (cRes.success && cRes.data) setCategories(cRes.data);

      const arrivals = nRes.success && nRes.data?.products ? nRes.data.products : [];
      setNewArrivals(arrivals);

      const featured = pRes.success && pRes.data?.products ? pRes.data.products : [];
      if (featured.length > 0) {
        setFeaturedProducts(featured);
      } else {
        // Fallback: Display all active products if no specific product is flagged as featured
        setFeaturedProducts(arrivals);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to load home page data from database');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHomeData();
  }, []);

  return (
    <div className="space-y-12 md:space-y-16 pb-8">
      <SEO
        title="KING DAY — Fun • Quality • Happiness | Kids Electric Ride-Ons, Tractors & Bicycles"
        description="Shop luxury 4x4 electric ride-on jeeps, electric farm tractors, sports bicycles, strollers, and baby essentials at KING DAY STORE. Fast shipping across India."
      />

      {/* 1. Hero Banner Section */}
      <section className="max-w-7xl mx-auto px-4 pt-3 md:pt-5">
        {banners.length > 0 ? (
          <BannerSlider banners={banners} />
        ) : (
          <div className="relative rounded-3xl bg-brand-gradient p-6 md:p-14 text-white overflow-hidden shadow-2xl">
            <div className="relative z-10 max-w-2xl space-y-4">
              <span className="inline-flex items-center space-x-1.5 px-3.5 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider bg-brand-yellow text-slate-900 shadow-md">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Premier Kids Collection</span>
              </span>
              <h1 className="text-3xl md:text-5xl lg:text-6xl font-extrabold leading-tight tracking-tight">
                Fun • Quality • Happiness for Every Child
              </h1>
              <p className="text-slate-100 text-sm md:text-base leading-relaxed max-w-xl font-medium">
                Explore luxury electric ride-on cars, 4x4 monster jeeps, heavy duty electric tractors, and certified baby products with nationwide express delivery.
              </p>
              <div className="pt-3 flex flex-wrap gap-3">
                <Link
                  to="/shop"
                  className="px-6 py-3.5 rounded-full font-extrabold text-xs md:text-sm bg-white text-brand-purple hover:bg-slate-100 shadow-lg hover:shadow-xl transition-all min-h-[44px] flex items-center space-x-2 active:scale-95"
                >
                  <span>Shop Catalog</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <a
                  href="https://wa.me/919495902904"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-3.5 rounded-full font-extrabold text-xs md:text-sm bg-emerald-600 text-white hover:bg-emerald-700 transition-all flex items-center space-x-2 min-h-[44px] shadow-lg hover:shadow-emerald-600/30 active:scale-95"
                >
                  <MessageCircle className="w-4 h-4 fill-current" />
                  <span>WhatsApp Order</span>
                </a>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* 2. Shop Catalog / New Arrivals */}
      <section className="max-w-7xl mx-auto px-4">
        <div className="flex items-end justify-between mb-6">
          <div>
            <span className="text-xs font-extrabold uppercase tracking-widest text-brand-purple flex items-center space-x-1">
              <Zap className="w-3.5 h-3.5" />
              <span>Fresh Arrivals</span>
            </span>
            <h2 className="text-2xl md:text-4xl font-extrabold text-slate-900 tracking-tight mt-0.5">
              New Arrivals & Catalog
            </h2>
          </div>
          <Link
            to="/shop"
            className="text-xs md:text-sm font-extrabold text-brand-purple hover:text-brand-pink flex items-center space-x-1 group transition-colors"
          >
            <span>Explore All</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-80 bg-slate-200 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 md:gap-6">
            {newArrivals.slice(0, 4).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* 3. Shop by Category */}
      <section className="max-w-7xl mx-auto px-4">
        <div className="flex items-end justify-between mb-6">
          <div>
            <span className="text-xs font-extrabold uppercase tracking-widest text-brand-pink">
              Collections
            </span>
            <h2 className="text-2xl md:text-4xl font-extrabold text-slate-900 tracking-tight mt-0.5">
              SHOP BY CATEGORY
            </h2>
          </div>
          <Link
            to="/categories"
            className="text-xs md:text-sm font-extrabold text-brand-purple hover:text-brand-pink flex items-center space-x-1 group transition-colors"
          >
            <span>All Categories</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5 md:gap-5">
          {categories.map((cat) => (
            <CategoryCard key={cat.id} category={cat} />
          ))}
        </div>
      </section>

      {/* 4. Featured Best Sellers */}
      <section className="max-w-7xl mx-auto px-4">
        <div className="flex items-end justify-between mb-6">
          <div>
            <span className="text-xs font-extrabold uppercase tracking-widest text-brand-blue flex items-center space-x-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Handpicked Favorites</span>
            </span>
            <h2 className="text-2xl md:text-4xl font-extrabold text-slate-900 tracking-tight mt-0.5">
              Featured Best Sellers
            </h2>
          </div>
          <Link
            to="/shop?featured=true"
            className="text-xs md:text-sm font-extrabold text-brand-purple hover:text-brand-pink flex items-center space-x-1 group transition-colors"
          >
            <span>View All</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 md:gap-6">
          {featuredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* 5. Promotional Callout Section */}
      <section className="max-w-7xl mx-auto px-4">
        <div className="rounded-3xl bg-slate-900 text-white p-6 md:p-12 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8 border border-slate-800 shadow-xl">
          <div className="space-y-4 z-10 max-w-xl">
            <span className="bg-brand-pink text-white font-extrabold text-[11px] px-3.5 py-1 rounded-full uppercase tracking-wider shadow-sm">
              WhatsApp Direct Support
            </span>
            <h3 className="text-2xl md:text-4xl font-extrabold leading-tight">
              Need Live Video Demos or Assembly Advice?
            </h3>
            <p className="text-slate-300 text-xs md:text-sm leading-relaxed">
              Our experts are ready to share live product videos, answer battery specs, and take direct orders on WhatsApp.
            </p>
            <div className="pt-2">
              <a
                href="https://wa.me/919495902904"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs md:text-sm px-6 py-3.5 rounded-full transition-all shadow-lg hover:shadow-emerald-600/30 min-h-[44px] active:scale-95"
              >
                <MessageCircle className="w-4 h-4 fill-current" />
                <span>Chat on WhatsApp (+91 9495902904)</span>
              </a>
            </div>
          </div>
          <div className="w-full md:w-80 h-44 md:h-60 rounded-2xl overflow-hidden bg-slate-800 shrink-0 border border-slate-700 shadow-md">
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
        <div className="bg-white rounded-3xl p-6 md:p-12 border border-slate-100 shadow-sm text-center space-y-8">
          <div>
            <h3 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight mb-2">
              Why Parents Trust KING DAY
            </h3>
            <p className="text-slate-500 text-xs md:text-sm max-w-xl mx-auto">
              We deliver non-toxic safety, uncompromised build quality, and pure happiness to children across India.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100/80 space-y-2">
              <div className="w-10 h-10 rounded-xl bg-brand-blue text-white flex items-center justify-center font-extrabold text-sm shadow-sm">
                01
              </div>
              <h4 className="font-extrabold text-sm text-slate-900">Factory Tested Quality</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Every electric jeep, bike, and stroller undergoes rigorous battery, motor, and frame safety checks.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100/80 space-y-2">
              <div className="w-10 h-10 rounded-xl bg-brand-purple text-white flex items-center justify-center font-extrabold text-sm shadow-sm">
                02
              </div>
              <h4 className="font-extrabold text-sm text-slate-900">Direct WhatsApp Ordering</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Order directly on WhatsApp with pre-filled product links, live video demos, and custom delivery options.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100/80 space-y-2">
              <div className="w-10 h-10 rounded-xl bg-brand-pink text-white flex items-center justify-center font-extrabold text-sm shadow-sm">
                03
              </div>
              <h4 className="font-extrabold text-sm text-slate-900">Nationwide Express Shipping</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Fast, insured home delivery across all states in India with real-time order tracking.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

