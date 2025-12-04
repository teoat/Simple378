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
        background: {
          DEFAULT: "var(--background-primary)", // Approx slate-900
          light: "var(--background-light)", // Off-white, for light theme
        },
        foreground: "var(--text-primary)", // Off-white

        card: {
          DEFAULT: "var(--card-background)", // Slightly lighter than background for cards
          foreground: "var(--text-primary)",
        },
        border: "var(--card-border)", // Slightly lighter border than card

        primary: {
          DEFAULT: "var(--button-primary-bg)", // A vibrant blue (approx blue-600)
          foreground: "var(--button-primary-text)",
        },
        secondary: {
          DEFAULT: "var(--button-secondary-bg)", // A darker gray for secondary elements
          foreground: "var(--button-secondary-text)",
        },
        muted: {
          DEFAULT: "var(--text-muted)", // Lighter gray for muted text
          foreground: "var(--text-muted-foreground)",
        },
        accent: {
          DEFAULT: "var(--accent-primary)", // A vibrant purple/violet (approx violet-600)
          foreground: "var(--accent-foreground)",
        },

        // Semantic Colors
        success: {
          DEFAULT: "var(--success-primary)", // Green
          foreground: "var(--success-foreground)",
        },
        warning: {
          DEFAULT: "var(--warning-primary)", // Yellow/Orange
          foreground: "var(--warning-foreground)",
        },
        danger: {
          DEFAULT: "var(--danger-primary)", // Red
          foreground: "var(--danger-foreground)",
        },
        info: {
          DEFAULT: "var(--info-primary)", // Light Blue
          foreground: "var(--info-foreground)",
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
