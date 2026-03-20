import type { Config } from "tailwindcss"

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: "#6C47FF",
        "deep-bg": "#080812",
      },
      keyframes: {
        "card-entrance": {
          from: { opacity: "0", transform: "translateY(20px) scale(0.96)" },
          to: { opacity: "1", transform: "translateY(0) scale(1)" },
        },
        "slide-in-right": {
          from: { transform: "translateX(100%)", opacity: "0" },
          to: { transform: "translateX(0)", opacity: "1" },
        },
        "fade-in-up": {
          from: { opacity: "0", transform: "translateY(20px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "float-bob": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-6px)" },
        },
        "float-flicker": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.6" },
        },
        "float-swing": {
          "0%, 100%": { transform: "rotate(-5deg)" },
          "50%": { transform: "rotate(5deg)" },
        },
        "float-rotate": {
          from: { transform: "rotate(0deg)" },
          to: { transform: "rotate(360deg)" },
        },
        "float-flip": {
          "0%, 100%": { transform: "rotateY(0deg)" },
          "50%": { transform: "rotateY(15deg)" },
        },
        "float-write": {
          "0%, 100%": { transform: "translateX(0)" },
          "50%": { transform: "translateX(3px)" },
        },
        "orb-drift-1": {
          "0%, 100%": { transform: "translate(0, 0)" },
          "33%": { transform: "translate(30px, -20px)" },
          "66%": { transform: "translate(-10px, 15px)" },
        },
        "orb-drift-2": {
          "0%, 100%": { transform: "translate(0, 0)" },
          "33%": { transform: "translate(-20px, 30px)" },
          "66%": { transform: "translate(15px, -10px)" },
        },
        "confetti-fall": {
          "0%": { transform: "translateY(0) rotate(0deg)", opacity: "1" },
          "100%": { transform: "translateY(80px) rotate(360deg)", opacity: "0" },
        },
      },
      animation: {
        "card-entrance": "card-entrance 0.6s ease-out",
        "slide-in-right": "slide-in-right 0.3s ease-out",
        "fade-in-up": "fade-in-up 0.5s cubic-bezier(0.16, 1, 0.3, 1) both",
        "float-bob": "float-bob 3s ease-in-out infinite",
        "float-flicker": "float-flicker 2s ease-in-out infinite",
        "float-swing": "float-swing 4s ease-in-out infinite",
        "float-rotate": "float-rotate 6s linear infinite",
        "float-flip": "float-flip 3s ease-in-out infinite",
        "float-write": "float-write 2s ease-in-out infinite",
        "orb-drift-1": "orb-drift-1 20s ease-in-out infinite",
        "orb-drift-2": "orb-drift-2 25s ease-in-out infinite",
        "confetti-fall": "confetti-fall 1s ease-out forwards",
      },
    },
  },
  plugins: [],
}

export default config