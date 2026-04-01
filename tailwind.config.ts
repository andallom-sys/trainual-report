import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        nao: {
          ink: "#16303d",
          teal: "#0a7b83",
          navy: "#123642",
          mint: "#dff4ea",
          sand: "#fff7df",
          line: "#d8e7ea",
          soft: "#eef4f8",
          green: "#2d8a5f",
          yellow: "#d3a11f",
          red: "#c75b50"
        }
      },
      boxShadow: {
        card: "0 18px 44px rgba(18, 48, 61, 0.10)"
      }
    }
  },
  plugins: []
};

export default config;
