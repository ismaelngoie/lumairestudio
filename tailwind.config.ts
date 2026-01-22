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
        // Colors from PDF Design Direction 
        lumaire: {
          brown: "#544541", // Deep brown
          tan: "#c4a092",   // Tan
          wine: "#722410",  // Wine red
          ivory: "#fffaeb", // Ivory
        }
      },
      fontFamily: {
        serif: ['var(--font-playfair)', 'serif'], // For headers 
        sans: ['var(--font-inter)', 'sans-serif'], // Clean readable font 
        script: ['var(--font-pinyon)', 'cursive'], // Script for logo 
      }
    },
  },
  plugins: [],
};
export default config;
