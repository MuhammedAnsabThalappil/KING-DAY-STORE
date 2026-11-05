import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, ArrowRight } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { ProductCard } from '../components/ProductCard';
import { SEO } from '../components/SEO';

export const WishlistPage: React.FC = () => {
  const { wishlist } = useCart();

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      <SEO title="Saved Wishlist — KING DAY STORE" />

      <div className="border-b border-slate-200 pb-4">
        <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">My Wishlist</h1>
        <p className="text-slate-500 text-xs md:text-sm mt-0.5 font-medium">
          {wishlist.length} saved products in your wishlist
        </p>
      </div>

      {wishlist.length === 0 ? (
        <div className="bg-white p-12 rounded-3xl border border-slate-100 text-center space-y-4 shadow-2xs">
          <div className="w-16 h-16 bg-pink-50 rounded-full flex items-center justify-center text-brand-pink mx-auto shadow-inner">
            <Heart className="w-8 h-8 fill-current" />
          </div>
          <h2 className="text-xl font-extrabold text-slate-900">Your Wishlist is Empty</h2>
          <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
            Save products you love by tapping the heart icon on any product card.
          </p>
          <Link
            to="/shop"
            className="inline-flex items-center space-x-2 px-6 py-3 rounded-full bg-brand-pink text-white font-extrabold text-xs shadow-md hover:bg-brand-purple transition-all active:scale-95 min-h-[44px]"
          >
            <span>Explore Catalog</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 md:gap-6">
          {wishlist.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
};

