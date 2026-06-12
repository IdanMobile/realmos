import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        background: "#0b1020",
        surface: "#121829",
        card: "#171f33",
        border: "#24304d",
        accent: "#5b8cff",
        accentMuted: "#3d5a9e",
        textPrimary: "#e8edf8",
        textSecondary: "#9aa8c7"
      }
    }
  },
  plugins: []
};

export default config;
