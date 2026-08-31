import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        forest: {
          50: '#f2f8f5',
          100: '#dceee5',
          500: '#24795e',
          700: '#185440',
          900: '#102f27',
        },
        sand: '#f5f1e8',
        coral: '#e7775f',
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['Manrope', 'Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 18px 45px rgba(20, 47, 40, 0.08)',
      },
    },
  },
  plugins: [],
} satisfies Config;

