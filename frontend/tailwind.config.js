/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        nyay: {
          blue: '#1D4ED8',
          indigo: '#4C1D95'
        }
      }
    }
  },
  plugins: []
};

