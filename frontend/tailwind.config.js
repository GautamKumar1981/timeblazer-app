/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}', './public/index.html'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        category: {
          work: '#2563eb',
          meetings: '#ef4444',
          breaks: '#facc15',
          learning: '#22c55e',
          personal: '#a855f7',
        },
      },
    },
  },
  plugins: [],
};
