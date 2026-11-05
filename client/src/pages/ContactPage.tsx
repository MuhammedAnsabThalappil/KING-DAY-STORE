import React from 'react';
import { MessageCircle, Phone, Mail, MapPin, Clock } from 'lucide-react';
import { SEO } from '../components/SEO';

export const ContactPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      <SEO title="Contact Us — KING DAY STORE" />

      <div className="text-center space-y-2 border-b border-slate-200 pb-4">
        <h1 className="text-2xl md:text-4xl font-extrabold text-slate-900 tracking-tight">Contact KING DAY</h1>
        <p className="text-slate-500 text-xs md:text-sm max-w-lg mx-auto font-medium">
          We are here to assist you with order inquiries, product recommendations, and after-sales support.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-100 shadow-2xs space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center shadow-inner">
            <MessageCircle className="w-6 h-6 fill-current" />
          </div>
          <h3 className="font-extrabold text-lg text-slate-900 tracking-tight">Instant WhatsApp Support</h3>
          <p className="text-xs text-slate-600 leading-relaxed font-medium">
            Chat directly with our support specialist for live video demos, stock availability, or order status updates.
          </p>
          <a
            href="https://wa.me/919495902904"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs px-6 py-3.5 rounded-full transition-all shadow-md active:scale-95 min-h-[44px]"
          >
            <MessageCircle className="w-4 h-4 fill-current" />
            <span>+91 9495902904</span>
          </a>
        </div>

        <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-100 shadow-2xs space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-brand-purple/10 text-brand-purple flex items-center justify-center">
            <Mail className="w-6 h-6" />
          </div>
          <h3 className="font-extrabold text-lg text-slate-900 tracking-tight">Official Store Details</h3>
          <ul className="space-y-3.5 text-xs text-slate-600 font-medium">
            <li className="flex items-center space-x-2.5">
              <MapPin className="w-4 h-4 text-brand-purple shrink-0" />
              <span>Production Domain: https://www.king-day.shop</span>
            </li>
            <li className="flex items-center space-x-2.5">
              <Phone className="w-4 h-4 text-brand-pink shrink-0" />
              <span>Helpline: +91 9495902904</span>
            </li>
            <li className="flex items-center space-x-2.5">
              <Clock className="w-4 h-4 text-brand-blue shrink-0" />
              <span>Working Hours: Mon - Sat (9:00 AM - 8:00 PM IST)</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

