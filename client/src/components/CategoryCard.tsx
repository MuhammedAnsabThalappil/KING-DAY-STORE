import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Category } from '../types';

interface CategoryCardProps {
  category: Category;
}

export const CategoryCard: React.FC<CategoryCardProps> = ({ category }) => {
  const imageUrl =
    category.imageUrl ||
    'https://images.unsplash.com/photo-1594787318286-3d835c1d207f?auto=format&fit=crop&w=600&q=80';

  const productCount = category._count?.products ?? 0;

  return (
    <Link
      to={`/category/${category.slug}`}
      className="group relative rounded-2xl overflow-hidden bg-white border border-slate-100 shadow-2xs hover:shadow-premium hover:-translate-y-1 transition-all duration-300 flex flex-col h-full"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
        <img
          src={imageUrl}
          alt={category.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-900/30 to-transparent opacity-85 group-hover:opacity-95 transition-opacity" />

        <div className="absolute bottom-3 left-3.5 right-3.5 text-white">
          <h3 className="font-extrabold text-base md:text-lg leading-snug group-hover:text-brand-yellow transition-colors">
            {category.name}
          </h3>
          <p className="text-[11px] md:text-xs text-slate-200 font-medium">
            {productCount} Products Available
          </p>
        </div>
      </div>

      {category.children && category.children.length > 0 && (
        <div className="p-3 bg-slate-50/80 border-t border-slate-100 flex-1 flex flex-col justify-between">
          <div className="flex flex-wrap gap-1.5 mb-2">
            {category.children.slice(0, 3).map((sub) => (
              <span
                key={sub.id}
                className="text-[10px] font-semibold bg-white px-2 py-0.5 rounded-md border border-slate-200 text-slate-600 truncate max-w-[120px]"
              >
                {sub.name}
              </span>
            ))}
          </div>
          <div className="flex items-center text-xs font-bold text-brand-purple group-hover:translate-x-1 transition-transform">
            <span>Browse Subcategories</span>
            <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </div>
        </div>
      )}
    </Link>
  );
};

