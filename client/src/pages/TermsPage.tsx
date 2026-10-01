import React from 'react';
import { SEO } from '../components/SEO';

export const TermsPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      <SEO title="Terms & Conditions — KING DAY STORE" />
      <div className="bg-white p-8 md:p-12 rounded-3xl border border-slate-100 shadow-sm space-y-6 text-slate-700 text-sm leading-relaxed">
        <h1 className="text-3xl font-extrabold text-slate-900">Terms & Conditions</h1>
        <p>
          By visiting or purchasing from KING DAY (<strong>https://www.king-day.shop</strong>), you agree to abide by these terms.
        </p>
        <h2 className="text-lg font-bold text-slate-900">Product Specifications & Pricing</h2>
        <p>
          All product prices are listed in Indian Rupees (INR ₹). We reserve the right to correct pricing errors or modify product specs prior to order confirmation.
        </p>
      </div>
    </div>
  );
};
