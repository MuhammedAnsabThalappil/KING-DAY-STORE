import React, { useState } from 'react';
import { Lock, KeyRound, User, ArrowRight, ShieldCheck } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { SEO } from './SEO';

export const AdminLockScreen: React.FC = () => {
  const { login } = useAuth();
  const { toast } = useToast();
  const [adminId, setAdminId] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminId.trim() || !password.trim()) return;

    setSubmitting(true);
    setErrorMsg(null);

    const success = await login(adminId.trim(), password.trim());
    setSubmitting(false);

    if (success) {
      toast.success('Welcome to KING DAY Admin');
    } else {
      setErrorMsg('Invalid admin ID or password');
      toast.error('Invalid admin ID or password');
    }
  };

  return (
    <div className="min-h-screen w-full bg-slate-950 text-slate-100 flex items-center justify-center p-4 selection:bg-brand-pink selection:text-white relative overflow-hidden">
      <SEO title="Admin Lock Screen — KING DAY" />

      {/* Decorative Gradient Glow Background */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-brand-purple/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-brand-pink/20 rounded-full blur-3xl pointer-events-none" />

      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl backdrop-blur-xl relative z-10 space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-brand-gradient flex items-center justify-center text-white mx-auto shadow-brand-glow">
            <Lock className="w-7 h-7" />
          </div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white uppercase mt-3">
            KING DAY ADMIN
          </h1>
          <p className="text-xs text-slate-400 font-medium">
            Enter credentials to unlock management portal
          </p>
        </div>

        {/* Lock Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase mb-1.5 tracking-wider">
              Admin ID
            </label>
            <div className="relative">
              <input
                type="text"
                required
                value={adminId}
                onChange={(e) => setAdminId(e.target.value)}
                placeholder="admin"
                className="w-full pl-10 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-xs font-bold text-white placeholder-slate-600 focus:outline-none focus:border-brand-purple focus:ring-2 focus:ring-brand-purple/20 min-h-[44px]"
              />
              <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase mb-1.5 tracking-wider">
              Password
            </label>
            <div className="relative">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-xs font-bold text-white placeholder-slate-600 focus:outline-none focus:border-brand-purple focus:ring-2 focus:ring-brand-purple/20 min-h-[44px]"
              />
              <KeyRound className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
            </div>
          </div>

          {errorMsg && (
            <div className="p-3 bg-rose-500/15 border border-rose-500/30 rounded-xl text-xs text-rose-300 text-center font-bold">
              {errorMsg}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 px-6 rounded-xl bg-gradient-to-r from-brand-purple via-brand-pink to-brand-yellow text-white font-extrabold text-xs uppercase tracking-wider shadow-brand-glow hover:shadow-pink-glow hover:scale-[1.01] active:scale-95 transition-all disabled:opacity-50 min-h-[44px] flex items-center justify-center space-x-2"
          >
            {submitting ? (
              <span>Authenticating...</span>
            ) : (
              <>
                <span>Unlock Portal</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Security badge */}
        <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800/80 text-[11px] text-slate-400 flex items-center space-x-2">
          <ShieldCheck className="w-3.5 h-3.5 text-brand-purple shrink-0" />
          <span>Access restricted to authorised personnel only.</span>
        </div>
      </div>
    </div>
  );
};
