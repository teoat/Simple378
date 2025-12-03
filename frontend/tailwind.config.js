/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./**/*.{js,ts,jsx,tsx}",
    "!./node_modules/**",
    "!./dist/**"
  ],
  theme: {
    extend: {
      colors: {
        background: "#09090b", // Zinc 950
        foreground: "#fafafa", // Zinc 50
        primary: {
          DEFAULT: "#3b82f6", // Blue 500
          foreground: "#ffffff",
        },
        secondary: {
          DEFAULT: "#27272a", // Zinc 800
          foreground: "#fafafa",
        },
        accent: {
          DEFAULT: "#f43f5e", // Rose 500
          foreground: "#ffffff",
        },
        muted: {
          DEFAULT: "#27272a", // Zinc 800
          foreground: "#a1a1aa", // Zinc 400
        },
        card: {
          DEFAULT: "#18181b", // Zinc 900
          foreground: "#fafafa",
        },
        border: "#27272a", // Zinc 800
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
