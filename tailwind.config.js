/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        "primary": "#e7a2ae",
        "primary-hover": "#d68c99",
        "primary-dark": "#d18a96",
        "background-light": "#fcfaf8",
        "background-dark": "#312b2e",
        "card-light": "#ffffff",
        "card-dark": "#3f373b",
        "surface-light": "#ffffff",
        "surface-dark": "#3f373b",
        "warm-gray": "#4A454C",
        "soft-pink": "#FBEDEF",
        "text-main": "#4A454C",
        "text-sub": "#83676c",
        "text-muted": "#83676c",
        "card-pink": "#F5E0E3",
        "card-beige": "#F0EFE9",
        "text-grey": "#4A4A4A",
      },
      fontFamily: {
        "display": ["var(--font-display)", "Plus Jakarta Sans", "sans-serif"],
        "body": ["var(--font-body)", "Noto Sans", "sans-serif"],
      },
      borderRadius: {
        "DEFAULT": "0.5rem",
        "lg": "1rem",
        "xl": "1.5rem",
        "2xl": "2rem",
        "3xl": "2.5rem",
        "full": "9999px"
      },
      boxShadow: {
        "soft": "0 20px 40px -15px rgba(231, 162, 174, 0.2)",
        "inner-glow": "inset 0 2px 4px 0 rgba(255, 255, 255, 0.5)",
        "glow": "0 0 20px rgba(231, 162, 174, 0.4)"
      },
      backgroundImage: {
        "gradient-pastel": "linear-gradient(180deg, #F7F5F0 0%, #FCF9F9 100%)",
      },
    },
  },
  plugins: [],
}

