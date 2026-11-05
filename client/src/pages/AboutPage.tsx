import React from 'react';
import { SEO } from '../components/SEO';
import { Sparkles, ShieldCheck, Heart } from 'lucide-react';

export const AboutPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      <SEO title="About Us — KING DAY STORE" />
      <div className="bg-white p-6 md:p-12 rounded-3xl border border-slate-100 shadow-2xs space-y-6">
        <div className="space-y-2 border-b border-slate-100 pb-4">
          <span className="inline-flex items-center space-x-1 text-xs font-extrabold text-brand-purple uppercase tracking-wider bg-brand-purple/10 px-3 py-1 rounded-full">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Our Story</span>
          </span>
          <h1 className="text-2xl md:text-4xl font-extrabold text-slate-900 tracking-tight">About KING DAY</h1>
        </div>

        <p className="text-slate-600 text-sm md:text-base leading-relaxed font-medium">
          Welcome to <strong>KING DAY</strong> — your ultimate destination for high-quality, safe, and exciting children's products. Guided by our core tagline <strong>"Fun • Quality • Happiness"</strong>, we specialize in battery-operated electric ride-on cars, 4x4 monster jeeps, superbikes, ergonomic bicycles, tricycles, educational toys, and certified baby care essentials.
        </p>

        <div className="pt-2 border-t border-slate-100 space-y-3">
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Our Unwavering Commitment</h2>
          <p className="text-slate-600 text-sm md:text-base leading-relaxed font-medium">
            At KING DAY, we understand that childhood memories are precious. Every item in our catalog is rigorously quality-checked for safety, non-toxic materials, durability, and smooth performance. We provide fast, insured home delivery across all states in India.
          </p>
        </div>
      </div>
    </div>
  );
};

