import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: "#F2F4F7",
        dark: "#0F1829",
        primary: "#1D4ED8",
        primaryLight: "#3B82F6",
        primaryPale: "#EFF6FF",
        ink: "#1E293B",
        muted: "#64748B",
        border: "#DDE3EC",
        success: "#059669",
        warning: "#D97706",
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', "system-ui", "sans-serif"],
        mono: ['"JetBrains Mono"', "monospace"],
      },
    },
  },
  plugins: [],
};
export default config;
