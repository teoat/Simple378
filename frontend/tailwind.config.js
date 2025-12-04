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
          DEFAULT: "hsl(222.2 47.4% 11.2%)", // Approx slate-900
          light: "hsl(210 40% 98%)", // Off-white, for light theme
        },
        foreground: "hsl(210 40% 98%)", // Off-white
        
        card: {
          DEFAULT: "hsl(222.2 47.4% 13.5%)", // Slightly lighter than background for cards
          foreground: "hsl(210 40% 98%)",
        },
        border: "hsl(217.2 32.6% 17.5%)", // Slightly lighter border than card
        
        primary: {
          DEFAULT: "hsl(221.2 83.2% 53.3%)", // A vibrant blue (approx blue-600)
          foreground: "hsl(210 40% 98%)",
        },
        secondary: {
          DEFAULT: "hsl(217.2 32.6% 25%)", // A darker gray for secondary elements
          foreground: "hsl(210 40% 98%)",
        },
        muted: {
          DEFAULT: "hsl(215 20.2% 65.1%)", // Lighter gray for muted text
          foreground: "hsl(215 20.2% 65.1%)",
        },
        accent: {
          DEFAULT: "hsl(262.1 83.3% 57.8%)", // A vibrant purple/violet (approx violet-600)
          foreground: "hsl(210 40% 98%)",
        },
        
        // Semantic Colors
        success: {
          DEFAULT: "hsl(142.1 76.2% 36.3%)", // Green
          foreground: "hsl(210 40% 98%)",
        },
        warning: {
          DEFAULT: "hsl(48 96% 40%)", // Yellow/Orange
          foreground: "hsl(222.2 47.4% 11.2%)",
        },
        danger: {
          DEFAULT: "hsl(0 84.2% 60.2%)", // Red
          foreground: "hsl(210 40% 98%)",
        },
        info: {
          DEFAULT: "hsl(217.2 91.2% 59.8%)", // Light Blue
          foreground: "hsl(210 40% 98%)",
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
