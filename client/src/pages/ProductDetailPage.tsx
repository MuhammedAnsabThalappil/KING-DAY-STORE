import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Heart,
  ShoppingBag,
  MessageCircle,
  Truck,
  ShieldCheck,
  RotateCcw,
  Check,
  Zap,
  ChevronRight
} from 'lucide-react';
import { fetchApi } from '../api/client';
import { Product } from '../types';
import { useCart } from '../contexts/CartContext';
import { ProductCard } from '../components/ProductCard';
import { SEO } from '../components/SEO';

export const ProductDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { addToCart, toggleWishlist, isInWishlist } = useCart();

  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    const loadProduct = async () => {
      if (!slug) return;
      setLoading(true);
      const res = await fetchApi<Product>(`/products/${slug}`);

      if (res.success && res.data) {
        const p = res.data;
        setProduct(p);
        const prim = p.images?.find((i) => i.isPrimary)?.imageUrl || p.images?.[0]?.imageUrl || '';
        setSelectedImage(prim);

        if (p.categoryId) {
          const relRes = await fetchApi<{ products: Product[] }>(
            `/products?categoryId=${p.categoryId}&limit=4`
          );
          if (relRes.success && relRes.data) {
            setRelatedProducts(relRes.data.products.filter((item) => item.id !== p.id));
          }
        }
      }
      setLoading(false);
    };

    loadProduct();
  }, [slug]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 animate-pulse space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="h-96 bg-slate-200 rounded-3xl" />
          <div className="space-y-4">
            <div className="h-8 bg-slate-200 w-3/4 rounded-xl" />
            <div className="h-6 bg-slate-200 w-1/4 rounded-lg" />
            <div className="h-20 bg-slate-200 rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold text-slate-800">Product Not Found</h2>
        <Link to="/shop" className="text-brand-purple font-bold text-sm underline mt-2 inline-block">
          Return to Shop
        </Link>
      </div>
    );
  }

  const isSaved = isInWishlist(product.id);
  const availableStock = product.inventory?.availableQuantity ?? 10;
  const isOutOfStock = availableStock <= 0;

  const handleAddToCart = async () => {
    if (isOutOfStock) return;
    const success = await addToCart(product.id, quantity);
    if (success) {
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
    }
  };

  const handleBuyNow = async () => {
    if (isOutOfStock) return;
    const success = await addToCart(product.id, quantity);
    if (success) {
      navigate('/checkout');
    }
  };

  // Dynamic WhatsApp Message Template per Specification #17
  const currentUrl = `${window.location.origin}/product/${product.slug}`;
  const rawWhatsappMsg = `Hello KING DAY 👋\n\nI'm interested in this product:\n\n🛍️ Product: ${product.name}\n💰 Price: ₹${Number(product.salePrice).toLocaleString('en-IN')}\n🔖 SKU: ${product.sku}\n\n🔗 Product: ${currentUrl}\n\nPlease share more details and availability.\n\nThank you!`;
  const whatsappUrl = `https://wa.me/919495902904?text=${encodeURIComponent(rawWhatsappMsg)}`;

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 md:py-10 space-y-10 pb-28 md:pb-12">
      <SEO
        title={`${product.name} — Buy Online`}
        description={product.shortDescription || product.description.slice(0, 160)}
      />

      {/* Breadcrumb Navigation */}
      <nav className="flex items-center space-x-2 text-xs font-semibold text-slate-500 overflow-x-auto pb-2">
        <Link to="/" className="hover:text-brand-purple">Home</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link to="/shop" className="hover:text-brand-purple">Shop</Link>
        {product.category && (
          <>
            <ChevronRight className="w-3.5 h-3.5" />
            <Link to={`/category/${product.category.slug}`} className="hover:text-brand-purple">
              {product.category.name}
            </Link>
          </>
        )}
        <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
        <span className="text-slate-800 truncate max-w-xs">{product.name}</span>
      </nav>

      {/* Product Main Container */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12 bg-white p-6 md:p-10 rounded-3xl border border-slate-100 shadow-sm">
        {/* Left Column: Image Gallery */}
        <div className="lg:col-span-6 space-y-4">
          <div className="relative aspect-square rounded-2xl overflow-hidden bg-slate-50 border border-slate-100 shadow-inner">
            <img
              src={selectedImage || 'https://images.unsplash.com/photo-1594787318286-3d835c1d207f?auto=format&fit=crop&w=1000&q=80'}
              alt={product.name}
              className="w-full h-full object-cover object-center"
            />
            {product.discount > 0 && (
              <span className="absolute top-4 left-4 bg-brand-pink text-white font-extrabold text-xs px-3.5 py-1.5 rounded-full shadow-lg">
                {Math.round(product.discount)}% OFF
              </span>
            )}
            <button
              onClick={() => toggleWishlist(product)}
              className="absolute top-4 right-4 p-3 rounded-full bg-white/90 backdrop-blur-md shadow-md text-slate-600 hover:text-brand-pink transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
              aria-label="Wishlist"
            >
              <Heart className={`w-6 h-6 ${isSaved ? 'fill-brand-pink text-brand-pink' : ''}`} />
            </button>
          </div>

          {/* Thumbnail Strip */}
          {product.images && product.images.length > 1 && (
            <div className="flex space-x-3 overflow-x-auto pb-2">
              {product.images.map((img) => (
                <button
                  key={img.id}
                  onClick={() => setSelectedImage(img.imageUrl)}
                  className={`w-20 h-20 rounded-xl overflow-hidden border-2 shrink-0 transition-all ${
                    selectedImage === img.imageUrl ? 'border-brand-purple shadow-md scale-95' : 'border-slate-200'
                  }`}
                >
                  <img src={img.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Product Overview & Actions */}
        <div className="lg:col-span-6 space-y-6 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs font-bold text-slate-400">
              <span className="bg-slate-100 text-slate-700 px-3 py-1 rounded-full uppercase">
                {product.brand || 'KING DAY'}
              </span>
              <span>SKU: {product.sku}</span>
            </div>

            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 leading-tight">
              {product.name}
            </h1>

            {product.shortDescription && (
              <p className="text-slate-600 text-sm leading-relaxed border-l-2 border-brand-purple pl-3">
                {product.shortDescription}
              </p>
            )}

            {/* Price Box */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-baseline justify-between">
              <div className="flex items-baseline space-x-3">
                <span className="text-3xl font-black text-slate-900">
                  ₹{Number(product.salePrice).toLocaleString('en-IN')}
                </span>
                {product.mrp > product.salePrice && (
                  <span className="text-base text-slate-400 line-through">
                    ₹{Number(product.mrp).toLocaleString('en-IN')}
                  </span>
                )}
              </div>
              <div>
                {isOutOfStock ? (
                  <span className="text-xs font-bold text-red-600 bg-red-100 px-3 py-1 rounded-full">
                    Out of Stock
                  </span>
                ) : (
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full flex items-center space-x-1">
                    <Check className="w-3.5 h-3.5" />
                    <span>In Stock ({availableStock} available)</span>
                  </span>
                )}
              </div>
            </div>

            {/* Quantity Selector */}
            {!isOutOfStock && (
              <div className="flex items-center space-x-4">
                <label className="text-xs font-bold text-slate-700 uppercase">Quantity:</label>
                <div className="flex items-center border border-slate-200 rounded-xl bg-white overflow-hidden shadow-sm">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="px-3.5 py-2 font-extrabold text-slate-600 hover:bg-slate-100 transition-colors min-h-[44px] min-w-[44px]"
                  >
                    -
                  </button>
                  <span className="px-4 font-bold text-sm text-slate-900">{quantity}</span>
                  <button
                    onClick={() => setQuantity((q) => Math.min(availableStock, q + 1))}
                    className="px-3.5 py-2 font-extrabold text-slate-600 hover:bg-slate-100 transition-colors min-h-[44px] min-w-[44px]"
                  >
                    +
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Primary Action: BUY THROUGH WHATSAPP */}
          <div className="space-y-3 pt-4 border-t border-slate-100">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-4 px-6 rounded-2xl font-extrabold text-sm md:text-base bg-emerald-600 hover:bg-emerald-700 text-white transition-all shadow-lg shadow-emerald-600/20 flex items-center justify-center space-x-2.5 min-h-[52px]"
            >
              <MessageCircle className="w-6 h-6 fill-current" />
              <span>BUY THROUGH WHATSAPP</span>
            </a>

            {/* Secondary Actions: Add to Cart & Buy Now */}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                className={`w-full py-3 px-4 rounded-xl font-bold text-xs md:text-sm flex items-center justify-center space-x-1.5 transition-all min-h-[44px] ${
                  added
                    ? 'bg-emerald-100 text-emerald-800'
                    : isOutOfStock
                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                }`}
              >
                {added ? <Check className="w-4 h-4" /> : <ShoppingBag className="w-4 h-4" />}
                <span>{added ? 'Added to Cart' : 'ADD TO CART'}</span>
              </button>

              <button
                onClick={handleBuyNow}
                disabled={isOutOfStock}
                className="w-full py-3 px-4 rounded-xl font-bold text-xs md:text-sm bg-brand-purple hover:bg-brand-blue text-white transition-all min-h-[44px] flex items-center justify-center space-x-1"
              >
                <Zap className="w-4 h-4 fill-current" />
                <span>BUY NOW</span>
              </button>
            </div>
          </div>

          {/* Delivery & Warranty Guarantees */}
          <div className="grid grid-cols-3 gap-3 pt-4 border-t border-slate-100 text-center">
            <div className="p-3 bg-slate-50 rounded-xl space-y-1">
              <Truck className="w-5 h-5 mx-auto text-brand-purple" />
              <span className="block text-[11px] font-bold text-slate-700">Insured Shipping</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl space-y-1">
              <ShieldCheck className="w-5 h-5 mx-auto text-brand-pink" />
              <span className="block text-[11px] font-bold text-slate-700">Authentic Build</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl space-y-1">
              <RotateCcw className="w-5 h-5 mx-auto text-brand-blue" />
              <span className="block text-[11px] font-bold text-slate-700">7-Day Support</span>
            </div>
          </div>
        </div>
      </div>

      {/* Description, Features & Specifications Tabs */}
      <div className="bg-white rounded-3xl p-6 md:p-10 border border-slate-100 shadow-sm space-y-8">
        <div>
          <h3 className="text-xl font-extrabold text-slate-900 mb-4 pb-2 border-b border-slate-100">
            Product Description
          </h3>
          <div className="prose prose-slate max-w-none text-slate-700 text-sm leading-relaxed whitespace-pre-line">
            {product.description}
          </div>
        </div>

        {/* Features Bullet List */}
        {product.features && product.features.length > 0 && (
          <div>
            <h3 className="text-xl font-extrabold text-slate-900 mb-4 pb-2 border-b border-slate-100">
              Key Features
            </h3>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {product.features.map((feat) => (
                <li key={feat.id} className="flex items-start space-x-2.5 text-sm text-slate-700">
                  <div className="w-5 h-5 rounded-full bg-brand-purple/10 text-brand-purple flex items-center justify-center shrink-0 mt-0.5 font-bold text-xs">
                    ✓
                  </div>
                  <span>{feat.feature}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Specifications Table */}
        {product.specifications && product.specifications.length > 0 && (
          <div>
            <h3 className="text-xl font-extrabold text-slate-900 mb-4 pb-2 border-b border-slate-100">
              Technical Specifications
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {product.specifications.map((spec) => (
                <div key={spec.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl text-xs">
                  <span className="font-bold text-slate-500">{spec.name}</span>
                  <span className="font-semibold text-slate-900">{spec.value}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div className="space-y-6">
          <h3 className="text-2xl font-extrabold text-slate-900">You May Also Like</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {relatedProducts.map((rel) => (
              <ProductCard key={rel.id} product={rel} />
            ))}
          </div>
        </div>
      )}

      {/* Mobile Sticky Bottom Purchase Bar */}
      <div
        className="md:hidden fixed bottom-16 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 p-3 shadow-2xl flex items-center justify-between space-x-3"
        style={{ paddingBottom: 'calc(0.75rem + env(safe-area-inset-bottom))' }}
      >
        <div className="truncate">
          <span className="block text-[10px] text-slate-400 font-bold uppercase truncate">{product.name}</span>
          <span className="text-base font-extrabold text-slate-900">₹{Number(product.salePrice).toLocaleString('en-IN')}</span>
        </div>
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="px-4 py-2.5 rounded-xl bg-emerald-600 text-white font-extrabold text-xs flex items-center space-x-1.5 shrink-0 shadow-md min-h-[44px]"
        >
          <MessageCircle className="w-4 h-4 fill-current" />
          <span>BUY ON WHATSAPP</span>
        </a>
      </div>
    </div>
  );
};
