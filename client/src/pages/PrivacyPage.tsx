import React from 'react';
import { SEO } from '../components/SEO';

export const PrivacyPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      <SEO title="Privacy Policy — KING DAY STORE" />
      <div className="bg-white p-8 md:p-12 rounded-3xl border border-slate-100 shadow-sm space-y-6 text-slate-700 text-sm leading-relaxed">
        <h1 className="text-3xl font-extrabold text-slate-900">Privacy Policy</h1>
        <p>
          At KING DAY (<strong>https://www.king-day.shop</strong>), protecting customer privacy is our utmost priority. This Privacy Policy details how we collect, process, and safeguard your personal information.
        </p>
        <h2 className="text-lg font-bold text-slate-900">Information We Collect</h2>
        <p>
          We collect essential details required to process your orders, including full name, delivery address, phone number, email address, and order history.
        </p>
        <h2 className="text-lg font-bold text-slate-900">Payment Security</h2>
        <p>
          Online payments are processed securely through Razorpay. KING DAY does NOT store credit card numbers, CVV codes, bank passwords, or UPI PINs on our servers.
        </p>
      </div>
    </div>
  );
};
