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
        display: ["'Cormorant Garamond'", "serif"],
        body: ["'Syne'", "sans-serif"],
        mono: ["'JetBrains Mono'", "monospace"],
      },
      colors: {
        bg: "#04040a",
        surface: "#0c0c18",
        card: "#10101e",
        border: "#1a1a30",
        accent: "#e8c547",
        accent2: "#4fc3f7",
        accent3: "#a78bfa",
        muted: "#3a3a5c",
        text: "#eeeef5",
        dim: "#7878a0",
      },
      animation: {
        marquee: "marquee 25s linear infinite",
        pulse2: "pulse2 4s ease-in-out infinite",
        float: "float 6s ease-in-out infinite",
        blink: "blink 2s ease-in-out infinite",
      },
      keyframes: {
        marquee: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
        pulse2: {
          "0%,100%": { opacity: "0.3", transform: "scale(1)" },
          "50%": { opacity: "0.7", transform: "scale(1.06)" },
        },
        float: {
          "0%,100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-20px)" },
        },
        blink: {
          "0%,100%": { opacity: "1" },
          "50%": { opacity: "0.3" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
