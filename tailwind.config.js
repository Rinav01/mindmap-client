/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#c0c1ff",
        primary_container: "#8083ff",
        primary_fixed: "#c0c1ff",
        on_primary_fixed_variant: "#1a1a3a",
        secondary: "#7bd0ff",
        tertiary: "#cebdff",
        surface: "#101419",
        surface_container_lowest: "#12161b",
        surface_container_low: "#181c21",
        surface_container: "#1c2025",
        surface_container_high: "#282b30",
        surface_container_highest: "#31353b",
        surface_bright: "#36393f",
        on_surface: "#e0e2ea",
        on_surface_variant: "#c7c4d7",
        outline: "#908fa0",
        outline_variant: "#464554",
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['Manrope', 'sans-serif'],
      },
      boxShadow: {
        'ambient': '0 10px 40px rgba(192, 193, 255, 0.08)',
        'active_glow': '0 0 15px rgba(192, 193, 255, 0.15)',
        'node_bevel': 'inset 0 1px 0 rgba(255, 255, 255, 0.1)',
      },
    },
  },
  plugins: [],
};
