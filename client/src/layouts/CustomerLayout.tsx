import React, { useState } from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  Home,
  ShoppingBag,
  Grid,
  Heart,
  ShoppingCart,
  Search,
  MessageCircle,
  Phone,
  Truck,
  ShieldCheck,
  Award
} from 'lucide-react';
import { useCart } from '../contexts/CartContext';

export const CustomerLayout: React.FC = () => {
  const { cart, wishlist } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState('');

  const cartCount = cart?.totalItems ?? 0;
  const wishlistCount = wishlist.length;

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const isNavActive = (path: string) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans selection:bg-brand-pink selection:text-white">
      {/* Top Announcement Bar */}
      <div className="bg-gradient-to-r from-brand-blue via-brand-purple to-brand-pink text-white text-[11px] font-semibold py-1.5 px-4 tracking-wide">
        <div className="hidden md:flex items-center space-x-4 max-w-7xl mx-auto w-full justify-between">
          <span className="flex items-center space-x-1.5">
            <Truck className="w-3.5 h-3.5 text-brand-yellow" />
            <span>FREE Home Delivery Across India on Orders Above ₹4,999!</span>
          </span>
          <span className="flex items-center space-x-4">
            <a
              href="https://wa.me/919495902904"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-brand-yellow transition-colors flex items-center space-x-1"
            >
              <MessageCircle className="w-3.5 h-3.5 fill-current" />
              <span>WhatsApp: +91 9495902904</span>
            </a>
            <Link to="/admin" className="text-slate-200 hover:text-white underline text-[10px]">
              Admin Control
            </Link>
          </span>
        </div>
        <div className="md:hidden text-center truncate">
          Free Delivery Over ₹4,999 • WhatsApp: +91 9495902904
        </div>
      </div>

      {/* Main Header (Desktop & Mobile) */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-2.5 md:py-3.5 flex items-center justify-between space-x-3">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 shrink-0">
            <div className="w-9 h-9 md:w-10 md:h-10 rounded-xl bg-brand-gradient flex items-center justify-center text-white font-extrabold text-lg shadow-brand-glow">
              K
            </div>
            <div>
              <span className="text-lg md:text-xl font-extrabold tracking-tight bg-gradient-to-r from-brand-blue to-brand-purple bg-clip-text text-transparent">
                KING DAY
              </span>
              <span className="block text-[9px] uppercase font-bold tracking-widest text-brand-pink -mt-1">
                Fun • Quality • Happiness
              </span>
            </div>
          </Link>

          {/* Desktop Search Bar */}
          <form
            onSubmit={handleSearchSubmit}
            className="hidden md:flex flex-1 max-w-lg mx-4 relative"
          >
            <input
              type="text"
              placeholder="Search electric ride-ons, cycles, tractors, strollers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-24 py-2 bg-slate-100/80 border border-transparent rounded-full text-xs font-medium focus:outline-none focus:bg-white focus:border-brand-purple transition-all"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
            <button
              type="submit"
              className="absolute right-1 top-1 px-3.5 py-1 rounded-full bg-brand-gradient text-white text-[11px] font-bold hover:shadow-brand-glow transition-all"
            >
              Search
            </button>
          </form>

          {/* Header Action Buttons */}
          <div className="flex items-center space-x-1.5 md:space-x-3">
            <Link
              to="/wishlist"
              className="relative p-2 rounded-xl text-slate-700 hover:text-brand-pink hover:bg-slate-50 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
              aria-label="Wishlist"
            >
              <Heart className="w-5 h-5" />
              {wishlistCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-brand-pink text-white font-bold text-[9px] w-4 h-4 rounded-full flex items-center justify-center border-2 border-white">
                  {wishlistCount}
                </span>
              )}
            </Link>

            <Link
              to="/cart"
              className="relative p-2 rounded-xl text-slate-700 hover:text-brand-purple hover:bg-slate-50 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
              aria-label="Cart"
            >
              <ShoppingCart className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-brand-purple text-white font-bold text-[9px] w-4 h-4 rounded-full flex items-center justify-center border-2 border-white">
                  {cartCount}
                </span>
              )}
            </Link>

            <a
              href="https://wa.me/919495902904"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden lg:flex items-center space-x-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 px-3.5 py-1.5 rounded-full font-bold text-xs hover:bg-emerald-600 hover:text-white transition-all min-h-[44px]"
            >
              <MessageCircle className="w-4 h-4 fill-current" />
              <span>WhatsApp Us</span>
            </a>
          </div>
        </div>

        {/* Mobile Search Input Row */}
        <div className="px-4 pb-2.5 md:hidden">
          <form onSubmit={handleSearchSubmit} className="relative">
            <input
              type="text"
              placeholder="Search ride-ons, tractors, cycles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 bg-slate-100 border border-slate-200 rounded-full text-xs font-medium focus:outline-none focus:bg-white focus:border-brand-purple"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          </form>
        </div>

        {/* Desktop Navigation Links */}
        <div className="hidden md:block bg-slate-50 border-t border-slate-100">
          <div className="max-w-7xl mx-auto px-4 flex items-center space-x-6 text-xs font-semibold text-slate-700">
            <Link
              to="/"
              className={`py-2.5 border-b-2 transition-colors ${
                isNavActive('/') && location.pathname === '/'
                  ? 'border-brand-purple text-brand-purple font-bold'
                  : 'border-transparent hover:text-brand-purple'
              }`}
            >
              Home
            </Link>
            <Link
              to="/shop"
              className={`py-2.5 border-b-2 transition-colors ${
                isNavActive('/shop')
                  ? 'border-brand-purple text-brand-purple font-bold'
                  : 'border-transparent hover:text-brand-purple'
              }`}
            >
              Shop Catalog
            </Link>
            <Link
              to="/category/electric-ride-ons"
              className="py-2.5 border-b-2 border-transparent hover:text-brand-purple transition-colors flex items-center space-x-1"
            >
              <span className="w-2 h-2 rounded-full bg-brand-pink" />
              <span>Electric Ride-Ons</span>
            </Link>
            <Link
              to="/category/cycles-tricycles"
              className="py-2.5 border-b-2 border-transparent hover:text-brand-purple transition-colors"
            >
              Cycles & Trikes
            </Link>
            <Link
              to="/category/tractors"
              className="py-2.5 border-b-2 border-transparent hover:text-brand-purple transition-colors"
            >
              Tractors & Utility
            </Link>
            <Link
              to="/orders"
              className={`py-2.5 border-b-2 transition-colors ${
                isNavActive('/orders')
                  ? 'border-brand-purple text-brand-purple font-bold'
                  : 'border-transparent hover:text-brand-purple'
              }`}
            >
              Track Order
            </Link>
            <Link
              to="/about"
              className="py-2.5 border-b-2 border-transparent hover:text-brand-purple transition-colors ml-auto"
            >
              About KING DAY
            </Link>
            <Link
              to="/contact"
              className="py-2.5 border-b-2 border-transparent hover:text-brand-purple transition-colors"
            >
              Contact
            </Link>
          </div>
        </div>
      </header>

      {/* Main Page Content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Compact Trust Badges Bar */}
      <section className="bg-slate-100 border-t border-slate-200 py-4 md:py-6 px-4">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div className="flex items-center space-x-3 p-2 bg-white rounded-xl border border-slate-200/60 shadow-2xs">
            <div className="w-8 h-8 rounded-lg bg-brand-purple/10 text-brand-purple flex items-center justify-center shrink-0">
              <Truck className="w-4 h-4" />
            </div>
            <div className="text-left">
              <h4 className="font-bold text-xs text-slate-800">Pan-India Express</h4>
              <p className="text-[10px] text-slate-500">Free delivery over ₹4,999</p>
            </div>
          </div>
          <div className="flex items-center space-x-3 p-2 bg-white rounded-xl border border-slate-200/60 shadow-2xs">
            <div className="w-8 h-8 rounded-lg bg-brand-pink/10 text-brand-pink flex items-center justify-center shrink-0">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div className="text-left">
              <h4 className="font-bold text-xs text-slate-800">Certified Safe</h4>
              <p className="text-[10px] text-slate-500">Heavy-duty & non-toxic</p>
            </div>
          </div>
          <div className="flex items-center space-x-3 p-2 bg-white rounded-xl border border-slate-200/60 shadow-2xs">
            <div className="w-8 h-8 rounded-lg bg-brand-blue/10 text-brand-blue flex items-center justify-center shrink-0">
              <Award className="w-4 h-4" />
            </div>
            <div className="text-left">
              <h4 className="font-bold text-xs text-slate-800">Authentic Warranty</h4>
              <p className="text-[10px] text-slate-500">Direct factory guarantee</p>
            </div>
          </div>
          <div className="flex items-center space-x-3 p-2 bg-white rounded-xl border border-slate-200/60 shadow-2xs">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <Phone className="w-4 h-4" />
            </div>
            <div className="text-left">
              <h4 className="font-bold text-xs text-slate-800">WhatsApp Help</h4>
              <p className="text-[10px] text-slate-500">+91 9495902904</p>
            </div>
          </div>
        </div>
      </section>

      {/* Compact Responsive Footer (Mobile Optimized) */}
      <footer className="bg-brand-dark text-slate-300 py-6 md:py-8 px-4 border-t border-slate-800 mb-16 md:mb-0">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-xs">
          {/* Brand info */}
          <div className="col-span-2 md:col-span-1 space-y-2">
            <div className="flex items-center space-x-2">
              <div className="w-7 h-7 rounded-lg bg-brand-gradient flex items-center justify-center text-white font-extrabold text-sm">
                K
              </div>
              <span className="text-base font-extrabold text-white tracking-tight">KING DAY</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-normal">
              Fun • Quality • Happiness. India's premier destination for electric ride-ons, cycles, tractors, and baby essentials.
            </p>
            <div className="text-[10px] font-semibold text-brand-yellow truncate">
              https://www.king-day.shop
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="font-bold text-xs text-white mb-2 uppercase tracking-wider">Categories</h4>
            <ul className="space-y-1.5 text-[11px]">
              <li>
                <Link to="/category/electric-ride-ons" className="hover:text-white transition-colors">
                  Electric Ride-Ons
                </Link>
              </li>
              <li>
                <Link to="/category/cycles-tricycles" className="hover:text-white transition-colors">
                  Cycles & Trikes
                </Link>
              </li>
              <li>
                <Link to="/category/tractors" className="hover:text-white transition-colors">
                  Tractors & Utility
                </Link>
              </li>
              <li>
                <Link to="/category/baby-essentials-gear" className="hover:text-white transition-colors">
                  Baby Essentials
                </Link>
              </li>
            </ul>
          </div>

          {/* Policy links */}
          <div>
            <h4 className="font-bold text-xs text-white mb-2 uppercase tracking-wider">Support</h4>
            <ul className="space-y-1.5 text-[11px]">
              <li>
                <Link to="/orders" className="hover:text-white transition-colors">
                  Track Order
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-white transition-colors">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="hover:text-white transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="hover:text-white transition-colors">
                  Terms & Refund Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* WhatsApp Direct */}
          <div className="col-span-2 md:col-span-1 space-y-2">
            <h4 className="font-bold text-xs text-white mb-1 uppercase tracking-wider">Direct Order</h4>
            <a
              href="https://wa.me/919495902904"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-2 bg-emerald-600 text-white px-3.5 py-2 rounded-xl text-xs font-bold hover:bg-emerald-500 transition-all min-h-[44px]"
            >
              <MessageCircle className="w-4 h-4 fill-current" />
              <span>WhatsApp: +91 9495902904</span>
            </a>
          </div>
        </div>

        <div className="max-w-7xl mx-auto border-t border-slate-800/80 mt-6 pt-4 text-center text-[10px] text-slate-500">
          © {new Date().getFullYear()} KING DAY STORE. All Rights Reserved.
        </div>
      </footer>

      {/* Fixed Mobile Bottom Navigation Bar */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-lg border-t border-slate-200 shadow-2xl px-2 py-1 flex items-center justify-around"
        style={{ paddingBottom: 'calc(0.5rem + env(safe-area-inset-bottom))' }}
      >
        <Link
          to="/"
          className={`flex flex-col items-center justify-center w-16 py-1 text-[10px] font-semibold transition-colors min-h-[44px] ${
            isNavActive('/') && location.pathname === '/'
              ? 'text-brand-purple font-bold'
              : 'text-slate-500 hover:text-brand-purple'
          }`}
        >
          <Home className="w-5 h-5 mb-0.5" />
          <span>Home</span>
        </Link>

        <Link
          to="/shop"
          className={`flex flex-col items-center justify-center w-16 py-1 text-[10px] font-semibold transition-colors min-h-[44px] ${
            isNavActive('/shop')
              ? 'text-brand-purple font-bold'
              : 'text-slate-500 hover:text-brand-purple'
          }`}
        >
          <ShoppingBag className="w-5 h-5 mb-0.5" />
          <span>Shop</span>
        </Link>

        <Link
          to="/categories"
          className={`flex flex-col items-center justify-center w-16 py-1 text-[10px] font-semibold transition-colors min-h-[44px] ${
            isNavActive('/categories')
              ? 'text-brand-purple font-bold'
              : 'text-slate-500 hover:text-brand-purple'
          }`}
        >
          <Grid className="w-5 h-5 mb-0.5" />
          <span>Categories</span>
        </Link>

        <Link
          to="/wishlist"
          className={`relative flex flex-col items-center justify-center w-16 py-1 text-[10px] font-semibold transition-colors min-h-[44px] ${
            isNavActive('/wishlist')
              ? 'text-brand-pink font-bold'
              : 'text-slate-500 hover:text-brand-pink'
          }`}
        >
          <Heart className="w-5 h-5 mb-0.5" />
          <span>Wishlist</span>
          {wishlistCount > 0 && (
            <span className="absolute top-0 right-3 bg-brand-pink text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
              {wishlistCount}
            </span>
          )}
        </Link>

        <Link
          to="/cart"
          className={`relative flex flex-col items-center justify-center w-16 py-1 text-[10px] font-semibold transition-colors min-h-[44px] ${
            isNavActive('/cart')
              ? 'text-brand-purple font-bold'
              : 'text-slate-500 hover:text-brand-purple'
          }`}
        >
          <ShoppingCart className="w-5 h-5 mb-0.5" />
          <span>Cart</span>
          {cartCount > 0 && (
            <span className="absolute top-0 right-3 bg-brand-purple text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
              {cartCount}
            </span>
          )}
        </Link>
      </nav>
    </div>
  );
};
