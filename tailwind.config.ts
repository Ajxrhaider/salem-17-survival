import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}", "./app/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      fontFamily: {
        inter: ["var(--font-inter)", "Inter", "sans-serif"],
        "space-grotesk": ["var(--font-space-grotesk)", "Space Grotesk", "sans-serif"],
        sans: ["var(--font-inter)", "Inter", "sans-serif"],
      },
      colors: {
        primary: { DEFAULT: "#6366f1", dark: "#4f46e5", light: "#818cf8", 50:"#eef2ff",100:"#e0e7ff",500:"#6366f1",600:"#4f46e5",700:"#4338ca",900:"#312e81" },
        secondary: "#e5e7eb",
        accent: { DEFAULT: "#10b981", dark: "#059669", light: "#34d399" },
        slate: { 850: "#1e293b", 950: "#0f172a" },
        background: "#f8fafc", foreground: "#0f172a",
      },
      borderRadius: { lg: "0.75rem", xl: "1rem", "2xl": "1.25rem" },
      boxShadow: { soft:"0 4px 20px -2px rgba(15,23,42,0.08)", medium:"0 8px 30px -6px rgba(15,23,42,0.12)", large:"0 20px 40px -10px rgba(15,23,42,0.15)" },
      animation: { "fade-in":"fadeIn 0.5s ease-out", "fade-in-up":"fadeInUp 0.6s ease-out forwards", "slide-in":"slideIn 0.4s ease-out", "pulse-slow":"pulse 3s cubic-bezier(0.4,0,0.6,1) infinite", shake:"shake 0.5s cubic-bezier(.36,.07,.19,.97) both" },
      keyframes: { fadeIn:{"0%":{opacity:"0"},"100%":{opacity:"1"}}, fadeInUp:{"0%":{opacity:"0",transform:"translateY(12px)"},"100%":{opacity:"1",transform:"translateY(0)"}}, slideIn:{"0%":{transform:"translateX(-8px)",opacity:"0"},"100%":{transform:"translateX(0)",opacity:"1"}}, shake:{"10%,90%":{transform:"translate3d(-1px,0,0)"},"20%,80%":{transform:"translate3d(2px,0,0)"},"30%,50%,70%":{transform:"translate3d(-4px,0,0)"},"40%,60%":{transform:"translate3d(4px,0,0)"}} },
    },
  },
  plugins: [],
};
export default config;