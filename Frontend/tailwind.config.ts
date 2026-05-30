import type { Config } from "tailwindcss";
import animate from "tailwindcss-animate";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./constants/**/*.{ts,tsx}",
    "./hooks/**/*.{ts,tsx}",
    "./utils/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#faf9fd",
        foreground: "#1a1c1e",
        surface: "#faf9fd",
        "surface-lowest": "#ffffff",
        "surface-low": "#f4f3f7",
        "surface-container": "#efedf1",
        "surface-high": "#e9e7eb",
        "surface-highest": "#e3e2e6",
        primary: "#002045",
        "primary-soft": "#d6e3ff",
        "primary-muted": "#86a0cd",
        secondary: "#1b6b51",
        "secondary-soft": "#a6f2d1",
        "secondary-muted": "#8bd6b6",
        tertiary: "#321b00",
        "tertiary-soft": "#ffddba",
        "tertiary-muted": "#f2bc82",
        outline: "#74777f",
        "outline-soft": "#c4c6cf",
      },
      borderRadius: {
        card: "2rem",
        "card-lg": "3rem",
      },
      boxShadow: {
        soft: "0 10px 30px rgba(26, 28, 30, 0.06)",
        lift: "0 18px 40px rgba(0, 32, 69, 0.16)",
        nav: "0 -4px 18px rgba(26, 54, 93, 0.09)",
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
        display: ["Lexend", "Inter", "sans-serif"],
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [animate],
};

export default config;
