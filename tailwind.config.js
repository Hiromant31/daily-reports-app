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
        sans: ['var(--font-days-one)', 'sans-serif'],
        sans: ['var(--font-comfortaa)', 'sans-serif'],
        "rubik": ['var(--font-rubik)'],
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
