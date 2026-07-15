import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        botverse: {
          black: "#0a0a0a",
          green: "#00ff88",
          pink: "#ff2e93",
          blue: "#00c2ff",
          white: "#ffffff",
        },
      },
    },
  },
  plugins: [],
};
export default config;
