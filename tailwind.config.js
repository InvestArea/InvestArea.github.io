/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./public/**/*.{html,js}",
    "./src/main/resources/static/**/*.{html,js}"
  ],
  corePlugins: {
    preflight: false
  },
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#f0fdf7",
          100: "#dcfce9",
          500: "#10b981",
          600: "#059669",
          700: "#047857",
          800: "#065f46",
          900: "#064e3b",
          emerald: "#0d4d3a",
          teal: "#4fd1c5",
          gold: "#eab308"
        }
      },
      fontFamily: {
        sans: ["'Plus Jakarta Sans'", "sans-serif"],
        display: ["Inter", "sans-serif"]
      }
    }
  },
  plugins: []
};
