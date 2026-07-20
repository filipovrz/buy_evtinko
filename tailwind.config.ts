import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#eef6ff",
          100: "#d9ebff",
          200: "#bcd9ff",
          300: "#8ec0ff",
          400: "#589cff",
          500: "#3277ff",
          600: "#1a55f5",
          700: "#1441e1",
          800: "#1736b6",
          900: "#19318f",
          950: "#141f57",
        },
        ink: {
          50: "#f4f6f8",
          100: "#e4e9ee",
          200: "#ccd5df",
          300: "#a8b7c8",
          400: "#7d93aa",
          500: "#627790",
          600: "#4d6077",
          700: "#3f4e61",
          800: "#374352",
          900: "#313a46",
          950: "#1a2028",
        },
        accent: {
          DEFAULT: "#0d9488",
          light: "#14b8a6",
          dark: "#0f766e",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "Georgia", "serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
      backgroundImage: {
        "hero-mesh":
          "radial-gradient(ellipse 80% 60% at 20% 40%, rgba(50,119,255,0.18), transparent), radial-gradient(ellipse 60% 50% at 80% 20%, rgba(13,148,136,0.14), transparent), linear-gradient(165deg, #0f172a 0%, #1a2744 45%, #0f1b2d 100%)",
        "surface-grain":
          "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E\")",
      },
      animation: {
        "fade-up": "fadeUp 0.7s ease-out both",
        "fade-in": "fadeIn 0.5s ease-out both",
        "slide-in": "slideIn 0.4s ease-out both",
      },
      keyframes: {
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(24px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideIn: {
          "0%": { opacity: "0", transform: "translateX(-12px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
