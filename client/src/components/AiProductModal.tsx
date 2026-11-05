import React, { useState } from 'react';
import { Sparkles, X, Check, AlertTriangle, ArrowRight, Layers, RefreshCw } from 'lucide-react';
import { fetchApi } from '../api/client';
import { Category } from '../types';
import { useToast } from '../contexts/ToastContext';

interface AiProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (extracted: any) => void;
  categories: Category[];
}

export const AiProductModal: React.FC<AiProductModalProps> = ({
  isOpen,
  onClose,
  onApply,
  categories
}) => {
  const { toast } = useToast();
  const [rawText, setRawText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [aiResult, setAiResult] = useState<any | null>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);

  if (!isOpen) return null;

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rawText.trim()) {
      setError('Please paste product details before generating.');
      return;
    }

    setLoading(true);
    setError(null);

    const res = await fetchApi<any>('/admin/ai/product-assistant', {
      method: 'POST',
      body: JSON.stringify({ rawText, categories })
    });

    setLoading(false);

    if (res.success && res.data && res.data.products && res.data.products.length > 0) {
      setAiResult(res.data);
      setSelectedIndex(0);
      toast.success('✨ Product details generated');

      if (res.data.bulkDetected && res.data.productCount > 1) {
        toast.info(`${res.data.productCount} products detected`);
      }
    } else {
      const msg = res.error?.message || "AI couldn't process the product details.";
      setError(msg);
      toast.error("AI couldn't process the product details.");
    }
  };

  const currentProduct = aiResult?.products?.[selectedIndex];

  const handleApplyToForm = () => {
    if (!currentProduct) return;
    onApply(currentProduct);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-7 max-w-3xl w-full text-slate-100 space-y-5 my-6 shadow-2xl">
        {/* Modal Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-r from-brand-purple to-brand-pink flex items-center justify-center text-white shadow-brand-glow shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-lg text-white flex items-center space-x-2">
                <span>AI Product Assistant</span>
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-brand-purple/20 text-brand-pink border border-brand-purple/30">
                  KING DAY AI
                </span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Paste your raw product details below. AI will organize them into the KING DAY product form.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Input Phase */}
        {!aiResult && (
          <form onSubmit={handleGenerate} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase mb-2 tracking-wider">
                Paste Raw Product Information
              </label>
              <textarea
                rows={9}
                value={rawText}
                onChange={(e) => setRawText(e.target.value)}
                disabled={loading}
                className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-2xl text-xs font-mono text-slate-200 placeholder-slate-600 focus:outline-none focus:border-brand-purple focus:ring-2 focus:ring-brand-purple/20 leading-relaxed"
                placeholder={`Paste product information here...\n\nExample:\nProduct: Kids Electric Jeep\nModel: WN1166\n12V battery\n4 motors\nRemote control\nBluetooth music\nLED lights\nMaximum load 60kg\nAge 2–8 years\nMRP ₹12,999\nOffer Price ₹6,999\nBrand: KING DAY\n\nYou can paste unstructured supplier/catalogue/WhatsApp information.`}
              />
            </div>

            {error && (
              <div className="p-3 bg-rose-500/15 border border-rose-500/30 rounded-xl text-xs text-rose-300 flex items-start space-x-2 font-semibold">
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
              <span className="text-[11px] text-slate-500 font-medium">
                ✨ AI will extract name, pricing, SKU, features, specs, and suggested category.
              </span>
              <div className="flex space-x-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={onClose}
                  className="w-1/2 sm:w-auto px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition-all min-h-[44px]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || !rawText.trim()}
                  className="w-1/2 sm:w-auto px-6 py-2.5 bg-gradient-to-r from-brand-purple via-brand-pink to-brand-yellow text-white rounded-xl text-xs font-extrabold shadow-brand-glow hover:shadow-pink-glow hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 min-h-[44px] flex items-center justify-center space-x-2"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Analyzing product information...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Generate Product Details</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        )}

        {/* Preview & Apply Phase */}
        {aiResult && currentProduct && (
          <div className="space-y-5">
            {/* Multi Product Banner */}
            {aiResult.bulkDetected && (
              <div className="p-3 bg-brand-purple/20 border border-brand-purple/40 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center space-x-2 text-xs font-extrabold text-brand-pink">
                  <Layers className="w-4 h-4" />
                  <span>{aiResult.productCount} PRODUCTS DETECTED IN PASTED DATA</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {aiResult.products.map((p: any, idx: number) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedIndex(idx)}
                      className={`px-3 py-1 rounded-xl text-[11px] font-bold transition-all ${
                        idx === selectedIndex
                          ? 'bg-brand-pink text-white shadow-xs'
                          : 'bg-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      Product {idx + 1}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* AI Generated Data Preview */}
            <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-4 max-h-[60vh] overflow-y-auto pr-1">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <h4 className="text-xs font-black uppercase text-brand-pink tracking-widest flex items-center space-x-2">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>AI GENERATED PRODUCT DATA</span>
                </h4>
                {currentProduct.missingFields && currentProduct.missingFields.length > 0 && (
                  <span className="text-[10px] font-bold text-amber-400 bg-amber-400/10 border border-amber-400/20 px-2.5 py-0.5 rounded-full flex items-center space-x-1">
                    <AlertTriangle className="w-3 h-3" />
                    <span>Missing: {currentProduct.missingFields.join(', ')}</span>
                  </span>
                )}
              </div>

              {/* Grid Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
                <div className="p-3 bg-slate-900 rounded-xl space-y-0.5">
                  <span className="text-[10px] font-bold uppercase text-slate-500">Product Name</span>
                  <p className="font-extrabold text-white">{currentProduct.name}</p>
                </div>

                <div className="p-3 bg-slate-900 rounded-xl space-y-0.5">
                  <span className="text-[10px] font-bold uppercase text-slate-500">SKU</span>
                  <p className="font-mono font-bold text-brand-purple">
                    {currentProduct.sku ? currentProduct.sku : '⚠️ Not Provided (Enter manually)'}
                  </p>
                </div>

                <div className="p-3 bg-slate-900 rounded-xl space-y-0.5">
                  <span className="text-[10px] font-bold uppercase text-slate-500">Brand</span>
                  <p className="font-extrabold text-white">{currentProduct.brand}</p>
                </div>

                <div className="p-3 bg-slate-900 rounded-xl space-y-0.5">
                  <span className="text-[10px] font-bold uppercase text-slate-500">MRP (₹)</span>
                  <p className="font-bold text-slate-300 line-through">₹{Number(currentProduct.mrp).toLocaleString('en-IN')}</p>
                </div>

                <div className="p-3 bg-slate-900 rounded-xl space-y-0.5">
                  <span className="text-[10px] font-bold uppercase text-slate-500">Offer / Sale Price (₹)</span>
                  <p className="font-extrabold text-emerald-400 text-sm">₹{Number(currentProduct.salePrice).toLocaleString('en-IN')}</p>
                </div>

                <div className="p-3 bg-slate-900 rounded-xl space-y-0.5">
                  <span className="text-[10px] font-bold uppercase text-slate-500">Calculated Discount</span>
                  <p className="font-extrabold text-brand-pink">{currentProduct.discount}% OFF</p>
                </div>
              </div>

              {/* Features List */}
              {currentProduct.features && currentProduct.features.length > 0 && (
                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold uppercase text-slate-400">Extracted Bullet Features</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {currentProduct.features.map((feat: string, idx: number) => (
                      <div key={idx} className="flex items-center space-x-2 text-xs text-slate-200 p-2 bg-slate-900 rounded-lg">
                        <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Specifications */}
              {currentProduct.specifications && currentProduct.specifications.length > 0 && (
                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold uppercase text-slate-400">Technical Specifications</span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {currentProduct.specifications.map((spec: any, idx: number) => (
                      <div key={idx} className="p-2 bg-slate-900 rounded-lg text-xs space-y-0.5">
                        <span className="text-[10px] font-bold text-slate-500 block">{spec.name}</span>
                        <span className="font-extrabold text-white block">{spec.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Description */}
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase text-slate-400">Full Description</span>
                <p className="text-xs text-slate-300 bg-slate-900 p-3 rounded-xl whitespace-pre-line leading-relaxed font-normal">
                  {currentProduct.description}
                </p>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
              <button
                type="button"
                onClick={() => setAiResult(null)}
                className="w-full sm:w-auto px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition-all min-h-[44px] flex items-center justify-center space-x-1.5"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Edit Input Text</span>
              </button>

              <div className="flex space-x-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={onClose}
                  className="w-1/2 sm:w-auto px-4 py-2.5 bg-slate-800 text-slate-300 rounded-xl text-xs font-bold min-h-[44px]"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleApplyToForm}
                  className="w-1/2 sm:w-auto px-6 py-2.5 bg-gradient-to-r from-brand-purple to-brand-pink text-white rounded-xl text-xs font-extrabold shadow-brand-glow hover:shadow-pink-glow transition-all min-h-[44px] flex items-center justify-center space-x-2"
                >
                  <Check className="w-4 h-4" />
                  <span>Apply to Product Form</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
