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
        background: "#080d1a",
        surface: "#0f1629",
        card: "#131f35",
        border: "#1e3052",
        primary: {
          DEFAULT: "#10b981",
          dark: "#059669",
          light: "#34d399",
        },
        accent: "#6366f1",
        gold: "#f59e0b",
        danger: "#ef4444",
        muted: "#64748b",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        display: ["'Bebas Neue'", "Impact", "sans-serif"],
      },
      backgroundImage: {
        "gradient-hero": "linear-gradient(135deg, #080d1a 0%, #0f1e3a 50%, #0a1628 100%)",
        "gradient-card": "linear-gradient(135deg, #131f35 0%, #0f1629 100%)",
        "gradient-green": "linear-gradient(135deg, #10b981 0%, #059669 100%)",
      },
    },
  },
  plugins: [],
};
export default config;
