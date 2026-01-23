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
        lumaire: {
          brown: "#544541", // Deep loam
          tan: "#c4a092",   // Rose clay
          wine: "#722410",  // Aged wine
          cream: "#FDFCF8", // The new "Paper" background
          ivory: "#fffaeb", // Kept for legacy compatibility
        }
      },
      fontFamily: {
        // Matches the CSS variables in the new code
        serif: ['var(--font-playfair)', 'serif'], 
        sans: ['var(--font-inter)', 'sans-serif'], 
        script: ['var(--font-pinyon)', 'cursive'], 
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      }
    },
  },
  plugins: [],
};
export default config;
