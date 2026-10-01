import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, ShieldCheck, Truck, MessageCircle, Heart, Star } from 'lucide-react';
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
    <div className="space-y-12 md:space-y-16 pb-12">
      <SEO
        title="KING DAY — Fun • Quality • Happiness | Kids Electric Ride-Ons & Bicycles"
        description="Shop luxury 4x4 electric ride-on jeeps, sports bicycles, strollers, and baby essentials at KING DAY STORE. Fast shipping across India."
      />

      {/* Hero Banner Section */}
      <section className="max-w-7xl mx-auto px-4 pt-4 md:pt-6">
        {banners.length > 0 ? (
          <BannerSlider banners={banners} />
        ) : (
          <div className="relative rounded-3xl bg-gradient-to-r from-brand-blue via-brand-purple to-brand-pink p-8 md:p-16 text-white overflow-hidden shadow-2xl">
            <div className="relative z-10 max-w-2xl space-y-4">
              <span className="inline-block px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-widest bg-brand-yellow text-slate-900 shadow-md">
                Premier Kids Collection
              </span>
              <h1 className="text-3xl md:text-5xl font-extrabold leading-tight">
                Fun • Quality • Happiness for Every Child
              </h1>
              <p className="text-slate-100 text-sm md:text-lg">
                Explore luxury electric ride-on cars, 4x4 monster jeeps, ergonomic bikes, and certified baby products with nationwide fast delivery.
              </p>
              <div className="pt-2 flex flex-wrap gap-3">
                <Link
                  to="/shop"
                  className="px-6 py-3.5 rounded-full font-bold text-sm bg-white text-brand-purple hover:bg-slate-100 shadow-lg transition-all"
                >
                  Shop Catalog
                </Link>
                <a
                  href="https://wa.me/919495902904"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-3.5 rounded-full font-bold text-sm bg-emerald-500 text-white hover:bg-emerald-600 transition-all flex items-center space-x-2"
                >
                  <MessageCircle className="w-4 h-4 fill-current" />
                  <span>WhatsApp Order</span>
                </a>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Category Discovery Section */}
      <section className="max-w-7xl mx-auto px-4">
        <div className="flex items-end justify-between mb-6">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-brand-purple">
              Explore Collections
            </span>
            <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900">
              Shop by Category
            </h2>
          </div>
          <Link
            to="/categories"
            className="text-sm font-bold text-brand-purple hover:text-brand-pink flex items-center space-x-1"
          >
            <span>All Categories</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {categories.map((cat) => (
            <CategoryCard key={cat.id} category={cat} />
          ))}
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="max-w-7xl mx-auto px-4">
        <div className="flex items-end justify-between mb-6">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-brand-pink flex items-center space-x-1">
              <Sparkles className="w-4 h-4" />
              <span>Handpicked Favorites</span>
            </span>
            <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900">
              Featured Products
            </h2>
          </div>
          <Link
            to="/shop?featured=true"
            className="text-sm font-bold text-brand-purple hover:text-brand-pink flex items-center space-x-1"
          >
            <span>View All</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-80 bg-slate-200 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* Promotional Callout Banner */}
      <section className="max-w-7xl mx-auto px-4">
        <div className="rounded-3xl bg-slate-900 text-white p-8 md:p-12 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8 border border-slate-800">
          <div className="space-y-3 z-10 max-w-xl">
            <span className="bg-brand-pink text-white font-extrabold text-xs px-3 py-1 rounded-full uppercase tracking-wider">
              WhatsApp Direct Order
            </span>
            <h3 className="text-2xl md:text-4xl font-extrabold">
              Need Help Choosing the Perfect Battery Ride-On or Bicycle?
            </h3>
            <p className="text-slate-300 text-sm">
              Our experts are ready to send live video demos, answer battery specs questions, and take instant custom orders on WhatsApp.
            </p>
            <div className="pt-2">
              <a
                href="https://wa.me/919495902904"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-sm px-6 py-3.5 rounded-full transition-all shadow-lg"
              >
                <MessageCircle className="w-5 h-5 fill-current" />
                <span>Chat on WhatsApp (+91 9495902904)</span>
              </a>
            </div>
          </div>
          <div className="w-full md:w-80 h-48 md:h-64 rounded-2xl overflow-hidden bg-slate-800 shrink-0">
            <img
              src="https://images.unsplash.com/photo-1594787318286-3d835c1d207f?auto=format&fit=crop&w=800&q=80"
              alt="KING DAY Electric Ride On"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </section>

      {/* New Arrivals Section */}
      <section className="max-w-7xl mx-auto px-4">
        <div className="flex items-end justify-between mb-6">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-brand-blue">
              Latest Additions
            </span>
            <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900">
              New Arrivals
            </h2>
          </div>
          <Link
            to="/shop?sortBy=newest"
            className="text-sm font-bold text-brand-purple hover:text-brand-pink flex items-center space-x-1"
          >
            <span>Explore All</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {newArrivals.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* Why Choose KING DAY */}
      <section className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white rounded-3xl p-8 md:p-12 border border-slate-100 shadow-sm text-center">
          <h3 className="text-2xl md:text-3xl font-extrabold text-slate-900 mb-3">
            Why Parents Trust KING DAY
          </h3>
          <p className="text-slate-500 text-sm max-w-2xl mx-auto mb-8">
            We are committed to delivering genuine safety, uncompromised build quality, and pure happiness to every child across India.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
              <div className="w-10 h-10 rounded-xl bg-brand-blue text-white flex items-center justify-center font-bold">
                01
              </div>
              <h4 className="font-bold text-slate-800">Direct Factory Tested</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Every electric jeep, bike, and stroller undergoes rigorous battery, motor, and frame stress tests prior to packaging.
              </p>
            </div>
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
              <div className="w-10 h-10 rounded-xl bg-brand-purple text-white flex items-center justify-center font-bold">
                02
              </div>
              <h4 className="font-bold text-slate-800">Secure Online & COD Options</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Pay safely via Razorpay UPI/Cards or select Cash on Delivery. Order status is real-time tracked.
              </p>
            </div>
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
              <div className="w-10 h-10 rounded-xl bg-brand-pink text-white flex items-center justify-center font-bold">
                03
              </div>
              <h4 className="font-bold text-slate-800">Prompt Customer Service</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Have questions about assembly or battery maintenance? Our team is always available via phone or WhatsApp.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
