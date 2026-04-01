/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'ie-red': '#C41E3A',
        'ie-black': '#1A1A1A',
        'ie-surface': '#2A2A2A',
        'ie-cream': '#F5E6C8',
        'ie-gold': '#D4A017',
        'ie-border': '#E05050',
      },
      fontFamily: {
        serif: ['"Noto Serif JP"', 'serif'],
        sans: ['"Noto Sans JP"', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
