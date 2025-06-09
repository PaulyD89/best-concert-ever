/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
      "./pages/**/*.{js,ts,jsx,tsx}",
      "./components/**/*.{js,ts,jsx,tsx}"
    ],
    safelist: [
      "animate-flicker"
    ],
    theme: {
  extend: {
    animation: {
      fadeIn: 'fadeIn 0.6s ease-in forwards',
    },
    keyframes: {
      fadeIn: {
        '0%': { opacity: '0' },
        '100%': { opacity: '1' },
      },
    },
  }
},
    plugins: []
  }
  