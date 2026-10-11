/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './layout/*.liquid',
    './sections/*.liquid',
    './snippets/*.liquid',
    './templates/*.liquid',
    './templates/**/*.json',
    './assets/*.js',
  ],
  prefix: 'tw-',
  corePlugins: {
    preflight: false,
  },
  theme: {
    extend: {
      colors: {
        'gift-text': '#1e1e1e',
        'gift-border': '#b3b3b3',
        'gift-bg': '#f5f5f5',
        'gift-preview': '#707070',
      },
      fontSize: {
        'gift': ['16px', '26px'],
        'gift-counter': ['12px', '16px'],
      },
      letterSpacing: {
        'gift': '0.16px',
      },
      lineHeight: {
        'gift': '26px',
      },
      spacing: {
        'gift-y': '8px',
        'gift-x': '16px',
        'gift-gap': '16px',
        'gift-checkbox': '20px',
      },
      borderRadius: {
        'gift': '4px',
      },
    },
  },
  plugins: [],
};
