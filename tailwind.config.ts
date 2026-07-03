import type { Config } from "tailwindcss";
import typography from "@tailwindcss/typography";

/**
 * Colors reference CSS variables set per-theme in globals.css (data-theme="...").
 * `<alpha-value>` lets Tailwind opacity modifiers work with the rgb channels.
 */
const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: "rgb(var(--bg) / <alpha-value>)",
        surface: "rgb(var(--surface) / <alpha-value>)",
        "surface-2": "rgb(var(--surface-2) / <alpha-value>)",
        border: "rgb(var(--border) / <alpha-value>)",
        muted: "rgb(var(--muted) / <alpha-value>)",
        fg: "rgb(var(--fg) / <alpha-value>)",
        neon: "rgb(var(--neon) / <alpha-value>)",
        "neon-2": "rgb(var(--neon-2) / <alpha-value>)",
        danger: "rgb(var(--danger) / <alpha-value>)",
        warn: "rgb(var(--warn) / <alpha-value>)",
        ok: "rgb(var(--ok) / <alpha-value>)",
      },
      fontFamily: {
        mono: ["var(--font-mono)", "ui-monospace", "SFMono-Regular", "monospace"],
        sans: ["var(--font-sans)", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      boxShadow: {
        neon: "0 0 5px rgb(var(--neon) / 0.6), 0 0 20px rgb(var(--neon) / 0.35)",
        "neon-lg":
          "0 0 8px rgb(var(--neon) / 0.7), 0 0 32px rgb(var(--neon) / 0.45)",
        "inset-neon": "inset 0 0 12px rgb(var(--neon) / 0.15)",
      },
      keyframes: {
        flicker: {
          "0%, 19%, 21%, 23%, 25%, 54%, 56%, 100%": { opacity: "1" },
          "20%, 24%, 55%": { opacity: "0.4" },
        },
        scanline: {
          "0%": { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(100%)" },
        },
        "pulse-neon": {
          "0%, 100%": { boxShadow: "0 0 5px rgb(var(--neon) / 0.5)" },
          "50%": { boxShadow: "0 0 22px rgb(var(--neon) / 0.8)" },
        },
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        marquee: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
      },
      animation: {
        flicker: "flicker 3s linear infinite",
        scanline: "scanline 6s linear infinite",
        "pulse-neon": "pulse-neon 2.5s ease-in-out infinite",
        "fade-up": "fade-up 0.5s ease-out both",
        marquee: "marquee 30s linear infinite",
      },
      backgroundImage: {
        grid: "linear-gradient(rgb(var(--border) / 0.4) 1px, transparent 1px), linear-gradient(90deg, rgb(var(--border) / 0.4) 1px, transparent 1px)",
      },
    },
  },
  plugins: [typography],
};

export default config;
