/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        "primary": "#f9f506",
        "primary-hover": "#e6e205",
        "primary-dim": "#d9d505",
        "background-light": "#f8f8f5",
        "background-dark": "#23220f",
        "text-light": "#181811",
        "text-dark": "#f5f5f0",
        "surface-light": "#ffffff",
        "surface-dark": "#2c2b18",
        "surface-hover": "#f2f2ed",
        "surface-dark-hover": "#363523",
        "border-light": "#e6e6db",
        "border-dark": "#3a3928",
        "muted-light": "#8c8b5f",
        "muted-dark": "#cbcb9c",
        "neutral-dark": "#181811",
        "neutral-light": "#f0f0eb",
        "card-light": "#ffffff",
        "card-dark": "#2c2b18",
      },
      fontFamily: {
        "display": ["Spline Sans", "sans-serif"],
        "body": ["Noto Sans", "sans-serif"],
      },
      borderRadius: {
        "DEFAULT": "1rem",
        "lg": "1.5rem",
        "xl": "2rem",
        "2xl": "3rem",
        "full": "9999px"
      },
      animation: {
        'fade-in-up': 'fadeInUp 0.5s ease-out forwards',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
          fadeInUp: {
              '0%': { opacity: '0', transform: 'translateY(10px)' },
              '100%': { opacity: '1', transform: 'translateY(0)' },
          }
      }
    },
  },
  plugins: [],
}
