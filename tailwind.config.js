/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'ekvw-red': '#e50039',
        'ekvw-blue': '#0b3f73',
      },
      fontFamily: {
        'merriweather': ['"Merriweather Sans"', 'sans-serif'],
      },
    },
  },
  plugins: [],
};