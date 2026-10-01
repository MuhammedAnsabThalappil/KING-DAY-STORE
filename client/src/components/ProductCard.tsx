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

  const productUrl = `${window.location.origin}/product/${product.slug}`;
  const whatsappMessage = encodeURIComponent(
    `Hello KING DAY, I would like to order:\n\n*${product.name}*\nSKU: ${product.sku}\nPrice: ₹${Number(product.salePrice).toLocaleString('en-IN')}\n\nLink: ${productUrl}`
  );
  const whatsappUrl = `https://wa.me/919495902904?text=${whatsappMessage}`;

  return (
    <div className="group relative bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-premium transition-all duration-300 flex flex-col justify-between overflow-hidden">
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
          <div className="absolute top-2.5 left-2.5 bg-brand-pink text-white font-bold text-xs px-2.5 py-1 rounded-full shadow-md tracking-wider">
            {Math.round(product.discount)}% OFF
          </div>
        )}

        {/* Wishlist Button */}
        <button
          onClick={handleWishlistToggle}
          aria-label="Add to wishlist"
          className="absolute top-2.5 right-2.5 w-10 h-10 rounded-full bg-white/90 backdrop-blur-md shadow-sm flex items-center justify-center text-slate-600 hover:text-brand-pink hover:bg-white transition-colors min-h-[44px] min-w-[44px]"
        >
          <Heart
            className={`w-5 h-5 transition-colors ${
              isSaved ? 'fill-brand-pink text-brand-pink' : ''
            }`}
          />
        </button>

        {/* Stock status overlay if out of stock */}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-[2px] flex items-center justify-center">
            <span className="bg-red-600 text-white font-semibold text-xs px-3 py-1.5 rounded-full uppercase tracking-wider">
              Out of Stock
            </span>
          </div>
        )}
      </div>

      {/* Product Details Section */}
      <div className="p-3.5 md:p-5 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between text-xs text-slate-400 font-medium mb-1">
            <span className="uppercase tracking-wider">{product.brand || 'KING DAY'}</span>
            <span className="truncate max-w-[100px]">{product.sku}</span>
          </div>

          <Link
            to={`/product/${product.slug}`}
            className="font-semibold text-slate-800 hover:text-brand-blue line-clamp-2 text-sm md:text-base leading-snug mb-2 min-h-[40px]"
          >
            {product.name}
          </Link>
        </div>

        {/* Pricing & Actions */}
        <div className="mt-3 pt-3 border-t border-slate-100">
          <div className="flex items-baseline space-x-2 mb-3">
            <span className="text-lg md:text-xl font-extrabold text-slate-900">
              ₹{Number(product.salePrice).toLocaleString('en-IN')}
            </span>
            {product.mrp > product.salePrice && (
              <span className="text-xs md:text-sm text-slate-400 line-through">
                ₹{Number(product.mrp).toLocaleString('en-IN')}
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={handleAddToCart}
              disabled={isOutOfStock || adding}
              className={`w-full py-2.5 px-3 rounded-xl font-semibold text-xs md:text-sm flex items-center justify-center space-x-1.5 transition-all min-h-[44px] ${
                added
                  ? 'bg-emerald-600 text-white'
                  : isOutOfStock
                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                  : 'bg-brand-blue text-white hover:bg-brand-purple active:scale-95 shadow-md shadow-brand-blue/10'
              }`}
            >
              {added ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Added</span>
                </>
              ) : (
                <>
                  <ShoppingBag className="w-4 h-4" />
                  <span>Add</span>
                </>
              )}
            </button>

            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-2.5 px-2 rounded-xl font-semibold text-xs md:text-sm bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white border border-emerald-200 transition-all flex items-center justify-center space-x-1 min-h-[44px]"
            >
              <MessageCircle className="w-4 h-4 fill-emerald-600 group-hover:fill-white" />
              <span>WhatsApp</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
