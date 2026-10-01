import React from 'react';
import { SEO } from '../components/SEO';

export const RefundPolicyPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      <SEO title="Cancellation & Refund Policy — KING DAY STORE" />
      <div className="bg-white p-8 md:p-12 rounded-3xl border border-slate-100 shadow-sm space-y-6 text-slate-700 text-sm leading-relaxed">
        <h1 className="text-3xl font-extrabold text-slate-900">Cancellation & Refund Policy</h1>
        <p>
          At KING DAY, we want you to be completely satisfied with your purchase.
        </p>
        <h2 className="text-lg font-bold text-slate-900">Order Cancellations</h2>
        <p>
          Orders can be cancelled prior to dispatch by contacting our WhatsApp support at <strong>+91 9495902904</strong>.
        </p>
        <h2 className="text-lg font-bold text-slate-900">Damaged or Defective Items</h2>
        <p>
          If your product arrives with shipping damage or manufacturing defect, report it within 48 hours with unboxing video/photos for immediate replacement or full refund.
        </p>
      </div>
    </div>
  );
};
