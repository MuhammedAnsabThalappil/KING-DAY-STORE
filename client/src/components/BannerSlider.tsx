import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Banner } from '../types';

interface BannerSliderProps {
  banners: Banner[];
}

export const BannerSlider: React.FC<BannerSliderProps> = ({ banners }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (banners.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [banners.length]);

  if (!banners || banners.length === 0) return null;

  const current = banners[currentIndex];

  return (
    <div className="relative w-full rounded-3xl overflow-hidden bg-slate-900 shadow-xl min-h-[300px] md:min-h-[440px] flex items-center">
      {/* Background Image with Overlay */}
      <img
        src={current.imageUrl}
        alt={current.title}
        className="absolute inset-0 w-full h-full object-cover object-center opacity-60 transition-opacity duration-700"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-brand-dark/90 via-brand-dark/60 to-transparent" />

      {/* Content */}
      <div className="relative z-10 max-w-2xl p-6 md:p-12 lg:p-16 text-white space-y-4">
        <span className="inline-block px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-widest bg-brand-pink/90 text-white shadow-lg">
          KING DAY Featured
        </span>
        <h2 className="text-2xl md:text-5xl font-extrabold leading-tight tracking-tight">
          {current.title}
        </h2>
        {current.subtitle && (
          <p className="text-sm md:text-lg text-slate-200 font-medium line-clamp-2 max-w-xl">
            {current.subtitle}
          </p>
        )}
        {current.link && (
          <div className="pt-2">
            <Link
              to={current.link}
              className="inline-flex items-center px-6 py-3.5 rounded-full font-bold text-sm bg-gradient-to-r from-brand-purple to-brand-pink text-white shadow-brand-glow hover:shadow-pink-glow hover:scale-105 active:scale-95 transition-all min-h-[44px]"
            >
              Explore Collection
            </Link>
          </div>
        )}
      </div>

      {/* Controls */}
      {banners.length > 1 && (
        <>
          <button
            onClick={() => setCurrentIndex((prev) => (prev - 1 + banners.length) % banners.length)}
            className="absolute left-4 z-20 p-2.5 rounded-full bg-white/20 backdrop-blur-md text-white hover:bg-white/40 transition-all min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-label="Previous banner"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={() => setCurrentIndex((prev) => (prev + 1) % banners.length)}
            className="absolute right-4 z-20 p-2.5 rounded-full bg-white/20 backdrop-blur-md text-white hover:bg-white/40 transition-all min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-label="Next banner"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          {/* Dots Indicator */}
          <div className="absolute bottom-4 inset-x-0 z-20 flex justify-center space-x-2">
            {banners.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`h-2.5 rounded-full transition-all ${
                  idx === currentIndex ? 'w-8 bg-brand-pink' : 'w-2.5 bg-white/50'
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};
