import React, { useEffect } from 'react';

interface SEOProps {
  title?: string;
  description?: string;
}

export const SEO: React.FC<SEOProps> = ({
  title = 'KING DAY — Fun • Quality • Happiness | Kids & Baby Products',
  description = 'Discover premium electric ride-ons, bikes, toys, baby strollers, and accessories at KING DAY STORE. Fast shipping across India.'
}) => {
  useEffect(() => {
    document.title = title.includes('KING DAY') ? title : `${title} | KING DAY STORE`;
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute('content', description);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [title, description]);

  return null;
};
