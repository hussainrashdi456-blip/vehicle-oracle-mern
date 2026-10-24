/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brandBlue: '#0EA5E9', // primary (sky-500)
        brandDark: '#0C4A6E', // sky-900 for headings on light
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 25px 60px -15px rgba(3, 62, 94, 0.45)',
        soft: '0 10px 30px -10px rgba(14, 165, 233, 0.35)',
      },
      backgroundImage: {
        'hero-gradient': 'linear-gradient(135deg, #0284c7 0%, #0ea5e9 45%, #38bdf8 100%)',
        'grid-white':
          "linear-gradient(to right, rgba(255,255,255,.07) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,.07) 1px, transparent 1px)",
      },
    },
  },
  plugins: [],
}
