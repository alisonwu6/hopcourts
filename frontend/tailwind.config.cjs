const animate = require('tailwindcss-animate')

module.exports = {
  darkMode: ['class'],
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'Noto Sans TC', 'sans-serif'],
      },
      colors: {
        border: 'hsl(var(--border))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        player: {
          50: '#F0F7FF',
          100: '#E0EFFE',
          200: '#B3D9FF',
          300: '#7FC3FF',
          400: '#4AADFF',
          500: '#1E90FF',
          600: '#0066FF',
          700: '#003D99',
          800: '#002966',
          900: '#001F4D',
        },
        venue: {
          50: '#f3f8ea',
          100: '#e5f1d0',
          200: '#cce3a1',
          300: '#b0d472',
          400: '#91c047',
          500: '#74A12E',
          600: '#5e8225',
          700: '#486318',
          800: '#324510',
          900: '#1e2b0b',
        },
        host: {
          50: '#F0F7FF',
          100: '#E0EFFE',
          200: '#B3D9FF',
          300: '#7FC3FF',
          400: '#4AADFF',
          500: '#1E90FF',
          600: '#0066FF',
          700: '#003D99',
          800: '#002966',
          900: '#001F4D',
        },
      },
      borderRadius: {
        '3xl': '24px',
      },
    },
  },
  plugins: [animate],
}
