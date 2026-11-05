import React, { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  FolderTree,
  Boxes,
  ShoppingBag,
  Users,
  CreditCard,
  Tag,
  Image as ImageIcon,
  LogOut,
  Menu,
  X,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { AdminLockScreen } from '../components/AdminLockScreen';

export const AdminLayout: React.FC = () => {
  const { user, isAdmin, loading, logout } = useAuth();
  const { toast } = useToast();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const menuItems = [
    { label: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    { label: 'Products', path: '/admin/products', icon: Package },
    { label: 'Categories', path: '/admin/categories', icon: FolderTree },
    { label: 'Inventory', path: '/admin/inventory', icon: Boxes },
    { label: 'Orders', path: '/admin/orders', icon: ShoppingBag },
    { label: 'Customers', path: '/admin/customers', icon: Users },
    { label: 'Payments', path: '/admin/payments', icon: CreditCard },
    { label: 'Coupons', path: '/admin/coupons', icon: Tag },
    { label: 'Banners', path: '/admin/banners', icon: ImageIcon }
  ];

  const handleLogout = async () => {
    await logout();
    toast.info('You have been logged out');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400 text-xs font-bold">
        <div className="flex items-center space-x-2">
          <div className="w-5 h-5 border-2 border-brand-purple border-t-transparent rounded-full animate-spin" />
          <span>Verifying Admin Authorization...</span>
        </div>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return <AdminLockScreen />;
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col md:flex-row font-sans selection:bg-brand-pink selection:text-white">
      {/* Mobile Admin Header */}
      <div className="md:hidden bg-slate-950 border-b border-slate-800 p-4 flex items-center justify-between sticky top-0 z-50 shadow-md">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-xl bg-brand-gradient flex items-center justify-center font-extrabold text-white text-sm shadow-brand-glow">
            K
          </div>
          <span className="font-extrabold text-lg text-white tracking-tight">KING DAY Admin</span>
        </div>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 rounded-xl bg-slate-800 text-slate-200 hover:text-white transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
        >
          {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Sidebar Navigation */}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-40 w-64 bg-slate-950 border-r border-slate-800 flex flex-col justify-between transition-transform duration-300 transform ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div>
          {/* Logo Header */}
          <div className="p-6 hidden md:flex items-center space-x-3 border-b border-slate-800/80">
            <div className="w-10 h-10 rounded-xl bg-brand-gradient flex items-center justify-center text-white font-extrabold text-xl shadow-brand-glow">
              K
            </div>
            <div>
              <h1 className="font-extrabold text-white text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
                KING DAY
              </h1>
              <span className="text-[10px] font-bold uppercase text-brand-pink tracking-widest block">
                Business Control
              </span>
            </div>
          </div>

          {/* Navigation Items */}
          <nav className="p-4 space-y-1">
            <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 px-3 py-2">
              Management Portal
            </div>
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                item.path === '/admin'
                  ? location.pathname === '/admin'
                  : location.pathname.startsWith(item.path);

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center space-x-3 px-3.5 py-2.5 rounded-xl font-bold text-xs md:text-sm transition-all min-h-[44px] ${
                    isActive
                      ? 'bg-gradient-to-r from-brand-purple to-indigo-600 text-white shadow-brand-glow'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900/80'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User Info & Footer Actions */}
        <div className="p-4 border-t border-slate-800/80 space-y-3">
          <Link
            to="/"
            target="_blank"
            className="flex items-center justify-between w-full px-3.5 py-2.5 rounded-xl text-xs font-bold text-slate-400 hover:text-white hover:bg-slate-900 transition-colors min-h-[44px]"
          >
            <span className="flex items-center space-x-2">
              <ExternalLink className="w-4 h-4 text-emerald-400" />
              <span>View Customer Storefront</span>
            </span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>

          <div className="p-3 bg-slate-900/90 rounded-2xl border border-slate-800 flex items-center justify-between">
            <div className="truncate pr-2">
              <p className="text-xs font-extrabold text-white truncate">{user?.name || 'Administrator'}</p>
              <p className="text-[10px] font-semibold text-slate-400 truncate">{user?.email || 'admin@kingday.shop'}</p>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center shrink-0"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content View */}
      <main className="flex-1 p-4 sm:p-6 md:p-8 max-w-7xl mx-auto w-full overflow-x-hidden">
        <Outlet />
      </main>
    </div>
  );
};

