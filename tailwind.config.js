/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: '#FCF5EC',
        sakura: '#F1DBDB',
        beige: '#D4D1C6',
        ash: '#938C83',
        'ash-light': '#B5ADA3',
        'rose-urgent': '#D88A8A',
        'sage-done': '#A8C8B8',
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', 'Helvetica Neue', 'sans-serif'],
      },
      borderRadius: {
        'soft': '14px',
        'pill': '999px',
      },
    },
  },
  plugins: [],
}
