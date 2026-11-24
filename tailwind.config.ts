import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "system-ui", "-apple-system", "sans-serif"],
        urdu: ["Noto Nastaliq Urdu", "serif"],
      },
      colors: {
        royal: {
          50: "#eff6ff",
          100: "#dbeafe",
          200: "#bfdbfe",
          300: "#93c5fd",
          500: "#3b82f6",
          600: "#2563eb",
          700: "#1d4ed8",
          800: "#1e3a8a",
          900: "#0f2347",
          950: "#08142b",
        },
        gold: {
          300: "#fcd34d",
          400: "#fbbf24",
          500: "#d99b26",
          600: "#b47d14",
        },
      },
    },
  },
  plugins: [],
};
export default config;
