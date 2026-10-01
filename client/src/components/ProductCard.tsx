import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingBag, MessageCircle, Check } from 'lucide-react';
import { Product } from '../types';
import { useCart } from '../contexts/CartContext';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart, toggleWishlist, isInWishlist } = useCart();
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);

  const primaryImage =
    product.images?.find((img) => img.isPrimary)?.imageUrl ||
    product.images?.[0]?.imageUrl ||
    'https://images.unsplash.com/photo-1594787318286-3d835c1d207f?auto=format&fit=crop&w=600&q=80';

  const isSaved = isInWishlist(product.id);
  const availableStock = product.inventory?.availableQuantity ?? 10;
  const isOutOfStock = availableStock <= 0;

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (isOutOfStock || adding) return;
    setAdding(true);
    const success = await addToCart(product.id, 1);
    setAdding(false);
    if (success) {
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
    }
  };

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    toggleWishlist(product);
  };

  // Dynamic WhatsApp Message Template
  const productUrl = `${window.location.origin}/product/${product.slug}`;
  const rawMsg = `Hello KING DAY 👋\n\nI'm interested in this product:\n\n🛍️ Product: ${product.name}\n💰 Price: ₹${Number(product.salePrice).toLocaleString('en-IN')}\n🔖 SKU: ${product.sku}\n\n🔗 Product: ${productUrl}\n\nPlease share more details and availability.\n\nThank you!`;
  const whatsappUrl = `https://wa.me/919495902904?text=${encodeURIComponent(rawMsg)}`;

  return (
    <div className="group relative bg-white rounded-2xl border border-slate-100 shadow-2xs hover:shadow-premium transition-all duration-300 flex flex-col justify-between overflow-hidden">
      {/* Top Image Section */}
      <div className="relative aspect-square overflow-hidden bg-slate-50">
        <Link to={`/product/${product.slug}`} className="block w-full h-full">
          <img
            src={primaryImage}
            alt={product.name}
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        </Link>

        {/* Discount Badge */}
        {product.discount > 0 && (
          <div className="absolute top-2 left-2 bg-brand-pink text-white font-bold text-[10px] md:text-xs px-2.5 py-0.5 rounded-full shadow-sm tracking-wider">
            {Math.round(product.discount)}% OFF
          </div>
        )}

        {/* Wishlist Button */}
        <button
          onClick={handleWishlistToggle}
          aria-label="Add to wishlist"
          className="absolute top-2 right-2 w-9 h-9 md:w-10 md:h-10 rounded-full bg-white/90 backdrop-blur-md shadow-2xs flex items-center justify-center text-slate-600 hover:text-brand-pink hover:bg-white transition-colors min-h-[44px] min-w-[44px]"
        >
          <Heart
            className={`w-4 h-4 md:w-5 md:h-5 transition-colors ${
              isSaved ? 'fill-brand-pink text-brand-pink' : ''
            }`}
          />
        </button>

        {/* Stock status overlay if out of stock */}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-[2px] flex items-center justify-center">
            <span className="bg-red-600 text-white font-semibold text-[10px] px-2.5 py-1 rounded-full uppercase tracking-wider">
              Out of Stock
            </span>
          </div>
        )}
      </div>

      {/* Product Details Section */}
      <div className="p-3 md:p-4 flex-1 flex flex-col justify-between space-y-2">
        <div>
          <div className="flex items-center justify-between text-[10px] md:text-xs text-slate-400 font-medium mb-1">
            <span className="uppercase tracking-wider font-bold">{product.brand || 'KING DAY'}</span>
            <span className="truncate max-w-[90px]">{product.sku}</span>
          </div>

          <Link
            to={`/product/${product.slug}`}
            className="font-bold text-slate-800 hover:text-brand-blue line-clamp-2 text-xs md:text-sm leading-snug mb-1 min-h-[36px]"
          >
            {product.name}
          </Link>
        </div>

        {/* Pricing & Actions */}
        <div className="pt-2 border-t border-slate-100 space-y-2">
          <div className="flex items-baseline space-x-1.5">
            <span className="text-base md:text-lg font-black text-slate-900">
              ₹{Number(product.salePrice).toLocaleString('en-IN')}
            </span>
            {product.mrp > product.salePrice && (
              <span className="text-[10px] md:text-xs text-slate-400 line-through">
                ₹{Number(product.mrp).toLocaleString('en-IN')}
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-2 px-2 rounded-xl font-extrabold text-[11px] bg-emerald-600 hover:bg-emerald-700 text-white transition-all flex items-center justify-center space-x-1 min-h-[44px] shadow-2xs"
            >
              <MessageCircle className="w-3.5 h-3.5 fill-current" />
              <span>BUY ON WHATSAPP</span>
            </a>

            <button
              onClick={handleAddToCart}
              disabled={isOutOfStock || adding}
              className={`w-full py-2 px-2 rounded-xl font-bold text-[11px] flex items-center justify-center space-x-1 transition-all min-h-[44px] ${
                added
                  ? 'bg-emerald-100 text-emerald-800'
                  : isOutOfStock
                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
              }`}
            >
              {added ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Added</span>
                </>
              ) : (
                <>
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>Add Cart</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
