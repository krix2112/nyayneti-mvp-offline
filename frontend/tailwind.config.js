/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#0a1629',
        'accent-gold': '#b89552',
        'gold-accent': '#c5a059',
        'gold-muted': '#8e7341',
        'background-light': '#f6f7f8',
        'background-dark': '#0a1629',
        'card-dark': '#131b2b',
        'sidebar-dark': '#070e1a',
        'surface-dark': '#13181f'
      },
      fontFamily: {
        display: ['Public Sans', 'sans-serif'],
        serif: ['Crimson Pro', 'serif']
      },
      borderRadius: {
        DEFAULT: '0.25rem',
        lg: '0.5rem',
        xl: '0.75rem',
        full: '9999px'
      }
    }
  },
  plugins: []
};


