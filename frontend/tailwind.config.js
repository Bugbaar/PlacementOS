/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        obsidian: "#09090B",
        card: "#18181B",
        grid: "#27272A",
        success: "#10B981",
        danger: "#F43F5E",
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["IBM Plex Mono", "ui-monospace", "SFMono-Regular", "monospace"],
      },
      boxShadow: {
        glow: "0 0 40px rgba(139, 92, 246, 0.18)",
      },
    },
  },
  plugins: [],
};
