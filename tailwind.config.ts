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
        up: {
          50: "#FAF2FB",
          100: "#F3DCF8",
          200: "#E7ACF5",
          300: "#D768F2",
          400: "#C616F2",
          500: "#8807A8", // Couleur Principale
          600: "#780395",
          700: "#58026D",
          800: "#3C014A",
          900: "#200127",
        },
      },
    },
  },
  plugins: [],
};

export default config;
