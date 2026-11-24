/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: { ink: '#17212b', polar: '#f4f3ef', glacier: '#e2e8f0', cream: '#f4f3ef', surface: '#ffffff', orange: { DEFAULT: '#fb923c', 500: '#fb923c' }, coral: '#fb923c', muted: '#64748b', sky: '#94a3b8', mint: '#64748b' },
      fontFamily: { sans: ['Segoe UI', 'sans-serif'], display: ['Arial Black', 'Segoe UI', 'sans-serif'], mono: ['Consolas', 'monospace'] },
      boxShadow: { glow: '0 8px 30px #fb923c2b', studio: '0 20px 50px -20px #0f172a2e' },
    },
  },
  plugins: [],
};
