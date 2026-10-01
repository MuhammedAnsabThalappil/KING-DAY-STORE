import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { CheckCircle2, MessageCircle, Package, ArrowRight, Truck } from 'lucide-react';
import { fetchApi } from '../api/client';
import { Order } from '../types';
import { SEO } from '../components/SEO';

export const OrderSuccessPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const orderNumber = searchParams.get('orderNumber');

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadOrder = async () => {
      if (!orderNumber) return;
      setLoading(true);
      const res = await fetchApi<Order>(`/orders/${orderNumber}`);
      if (res.success && res.data) setOrder(res.data);
      setLoading(false);
    };
    loadOrder();
  }, [orderNumber]);

  const whatsappMsg = encodeURIComponent(
    `Hello KING DAY, I just placed Order #${orderNumber}. Please confirm my shipment status.`
  );
  const whatsappUrl = `https://wa.me/919495902904?text=${whatsappMsg}`;

  return (
    <div className="max-w-3xl mx-auto px-4 py-12 space-y-8">
      <SEO title="Order Confirmed — KING DAY STORE" />

      <div className="bg-white rounded-3xl p-8 md:p-12 border border-slate-100 shadow-xl text-center space-y-6">
        <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 mx-auto shadow-inner">
          <CheckCircle2 className="w-12 h-12" />
        </div>

        <div className="space-y-2">
          <span className="text-xs font-bold uppercase tracking-widest text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">
            Order Placed Successfully
          </span>
          <h1 className="text-3xl font-extrabold text-slate-900">Thank You for Shopping with KING DAY!</h1>
          <p className="text-slate-500 text-sm">
            We have received your order and are preparing it for express dispatch across India.
          </p>
        </div>

        {orderNumber && (
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 inline-block">
            <span className="text-xs font-bold text-slate-400 block uppercase">Order Reference Number</span>
            <span className="text-xl md:text-2xl font-black text-brand-purple tracking-wider">
              #{orderNumber}
            </span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            to={`/orders`}
            className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-brand-purple text-white font-bold text-sm shadow-brand-glow hover:bg-brand-blue transition-all min-h-[44px] flex items-center justify-center space-x-2"
          >
            <Package className="w-4 h-4" />
            <span>Track Order Timeline</span>
          </Link>

          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-emerald-500 text-white font-bold text-sm shadow-md hover:bg-emerald-600 transition-all min-h-[44px] flex items-center justify-center space-x-2"
          >
            <MessageCircle className="w-4 h-4 fill-current" />
            <span>Send Order to WhatsApp</span>
          </a>
        </div>
      </div>
    </div>
  );
};
