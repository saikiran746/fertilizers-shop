/** @type {import("tailwindcss").Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "sans-serif"],
        heading: ["Poppins", "sans-serif"],
      },
      colors: {
        primary: {
          50: "#f0fdf4", 100: "#dcfce7", 200: "#bbf7d0", 300: "#86efac",
          400: "#4ade80", 500: "#22c55e", 600: "#16a34a", 700: "#15803d",
          800: "#166534", 900: "#14532d",
        },
        brand: {
          green: "#2E7D32", light: "#4CAF50", dark: "#1B5E20",
          accent: "#8BC34A", blue: "#1565C0", gold: "#F57F17", bg: "#F1F8E9",
        },
        admin: {
          bg: "#0B1120",
          sidebar: "#111827",
          card: "#1E293B",
          hover: "#263548",
        },
      },
      backgroundImage: {
        "hero-gradient": "linear-gradient(135deg, #1B5E20 0%, #2E7D32 40%, #388E3C 70%, #1565C0 100%)",
        "card-gradient": "linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)",
        "admin-gradient": "linear-gradient(135deg, #0B1120 0%, #1a2332 50%, #0B1120 100%)",
      },
      animation: {
        float: "float 3s ease-in-out infinite",
        "fade-in-up": "fadeInUp 0.6s ease-out forwards",
        "slide-in": "slideIn 0.4s ease-out forwards",
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        glow: "glow 2s ease-in-out infinite alternate",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
        fadeInUp: {
          from: { opacity: "0", transform: "translateY(30px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        slideIn: {
          from: { opacity: "0", transform: "translateX(-20px)" },
          to: { opacity: "1", transform: "translateX(0)" },
        },
        glow: {
          from: { boxShadow: "0 0 5px rgba(16, 185, 129, 0.2)" },
          to: { boxShadow: "0 0 20px rgba(16, 185, 129, 0.4)" },
        },
      },
    },
  },
  plugins: [],
};
