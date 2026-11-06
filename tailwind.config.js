/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        paper: "#f4efe6",
        ink: "#1c1915",
        muted: "#6f675c",
        line: "#e3d9cb",
        terra: "#c24e24",
        moss: "#215743",
        gold: "#8d6b2f",
        side: "#141210",
        card: "#fbf8f3",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        serif: ["var(--font-serif)", "Georgia", "serif"],
      },
      boxShadow: {
        card: "0 1px 0 rgba(28,25,21,0.04), 0 12px 32px -20px rgba(28,25,21,0.35)",
      },
    },
  },
  plugins: [],
};
