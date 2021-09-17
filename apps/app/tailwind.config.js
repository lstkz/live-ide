/* eslint-disable no-undef */

const defaultTheme = require('tailwindcss/defaultTheme');

module.exports = {
  purge: ['./src/**/*.{ts,tsx}'],
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter var', ...defaultTheme.fontFamily.sans],
      },
      animation: {
        'spin-slow': 'spin 3s linear infinite',
      },
      colors: {
        'editor-bg': '#011627',
        alpha: {
          black30: 'rgba(0, 0, 0, 0.3)',
          black80: 'rgba(0, 0, 0, 0.8)',
          black20: 'rgba(255, 255, 255, 0.2)',
          white90: 'rgba(255, 255, 255, 0.9)',
          white10: 'rgba(255, 255, 255, 0.1)',
          white20: 'rgba(255, 255, 255, 0.2)',
          white60: 'rgba(255, 255, 255, 0.6)',
          white07: 'rgba(255, 255, 255, 0.075)',
        },
      },
    },
    container: {
      center: true,
      padding: '1.5rem',
    },
  },
  variants: {
    extend: {},
  },
  plugins: [require('@tailwindcss/forms')],
};
