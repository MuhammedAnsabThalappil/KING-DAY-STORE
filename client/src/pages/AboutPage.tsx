import React from 'react';
import { SEO } from '../components/SEO';

export const AboutPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      <SEO title="About Us — KING DAY STORE" />
      <div className="bg-white p-8 md:p-12 rounded-3xl border border-slate-100 shadow-sm space-y-6">
        <h1 className="text-3xl font-extrabold text-slate-900">About KING DAY</h1>
        <p className="text-slate-600 text-sm leading-relaxed">
          Welcome to <strong>KING DAY</strong> — your ultimate destination for high-quality, safe, and exciting children's products. Guided by our core tagline <strong>"Fun • Quality • Happiness"</strong>, we specialize in battery-operated electric ride-on cars, 4x4 monster jeeps, superbikes, ergonomic bicycles, tricycles, educational toys, and certified baby care essentials.
        </p>
        <h2 className="text-xl font-bold text-slate-900 pt-2">Our Commitment</h2>
        <p className="text-slate-600 text-sm leading-relaxed">
          At KING DAY, we understand that childhood memories are precious. Every item in our catalog is rigorously quality-checked for safety, non-toxic materials, durability, and smooth performance. We provide fast, insured home delivery across all states in India.
        </p>
      </div>
    </div>
  );
};
