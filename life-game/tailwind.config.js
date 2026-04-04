/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        neonPink: '#FF6B9D',
        neonCyan: '#00D4FF',
        neonYellow: '#FFE66D',
        neonGreen: '#7CFF6B',
        neonPurple: '#B06BFF',
      },
      boxShadow: {
        'neon-pink': '0 0 5px #FF6B9D, 0 0 20px #FF6B9D, 0 0 40px #FF6B9D',
        'neon-cyan': '0 0 5px #00D4FF, 0 0 20px #00D4FF, 0 0 40px #00D4FF',
        'neon-green': '0 0 5px #7CFF6B, 0 0 20px #7CFF6B, 0 0 40px #7CFF6B',
      },
    },
  },
  plugins: [],
};
