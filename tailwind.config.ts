import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./styles/**/*.{css}"
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#008080"
        },
        accent: {
          DEFAULT: "#ffc300"
        },
        brand: {
          50: "#eef6ff",
          500: "#2563eb",
          600: "#1d4ed8",
          700: "#1e40af"
        }
      }
    }
  },
  plugins: []
};

export default config;
