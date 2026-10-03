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
        sans: ['Arial', 'Helvetica', 'sans-serif'],
        mono: ['"SFMono-Regular"', 'Consolas', '"Liberation Mono"', 'monospace'],
      },
      colors: {
        slate: {
          950: '#020617',
        }
      }
    },
  },
  plugins: [],
};
export default config;
