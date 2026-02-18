/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#2b8cee",
        "background-dark": "#101922",
        surface: "#1a2530",
        border: "#2d3a4b",
      },
    },
  },
  plugins: [],
};
