import React from 'react';
import { SEO } from '../components/SEO';

export const ShippingPolicyPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      <SEO title="Shipping & Delivery Policy — KING DAY STORE" />
      <div className="bg-white p-8 md:p-12 rounded-3xl border border-slate-100 shadow-sm space-y-6 text-slate-700 text-sm leading-relaxed">
        <h1 className="text-3xl font-extrabold text-slate-900">Shipping & Delivery Policy</h1>
        <p>
          We provide nationwide door delivery across India for all electric ride-ons, cycles, and toys.
        </p>
        <h2 className="text-lg font-bold text-slate-900">Free Shipping Threshold</h2>
        <p>
          All orders above <strong>₹4,999</strong> qualify for FREE express home shipping across India!
        </p>
        <h2 className="text-lg font-bold text-slate-900">Delivery Timelines</h2>
        <p>
          Standard delivery takes 3 to 7 business days depending on delivery location. Tracking details are updated in your order history.
        </p>
      </div>
    </div>
  );
};
