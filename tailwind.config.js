/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
    './context/**/*.{js,ts,jsx,tsx}'
  ],
  theme: {
    extend: {
      fontFamily: {
        'rubik': ['var(--font-rubik)', 'sans-serif'],
      },
      colors: {
        accent: {
          DEFAULT: '#af111c',
          500: '#af111c'
        }
      }
    }
  },
  plugins: [],
}
