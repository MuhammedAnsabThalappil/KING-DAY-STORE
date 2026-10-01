/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          blue: '#0B2D6B',
          purple: '#5B2BE0',
          pink: '#FF4FA3',
          yellow: '#FFC300',
          dark: '#081C42',
          light: '#F8FAFC',
          card: '#FFFFFF'
        },
      },
      backgroundImage: {
        'brand-gradient': 'linear-gradient(135deg, #0B2D6B 0%, #5B2BE0 45%, #FF4FA3 80%, #FFC300 100%)',
        'brand-gradient-hover': 'linear-gradient(135deg, #082150 0%, #4A22B8 45%, #E03E8C 80%, #E6B000 100%)',
        'hero-gradient': 'radial-gradient(circle at 50% 0%, rgba(91, 43, 224, 0.15) 0%, rgba(11, 45, 107, 0.05) 50%, transparent 100%)',
      },
      boxShadow: {
        'brand-glow': '0 4px 20px -2px rgba(91, 43, 224, 0.25)',
        'pink-glow': '0 4px 20px -2px rgba(255, 79, 163, 0.3)',
        'premium': '0 10px 30px -5px rgba(11, 45, 107, 0.08), 0 4px 6px -2px rgba(11, 45, 107, 0.04)',
      },
    },
  },
  plugins: [],
}
