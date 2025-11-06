/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    fontFamily: {
      sans: ["Kanit", "sans-serif"],
    },
    extend: {
      colors: {
        // Luxury Muted Gold Theme (Master App Style)
        primary: {
          DEFAULT: "#C5A100", // ทองหลัก
          gold: "#FFD700", // ทองสว่าง
          "light-gold": "#FFE87C", // ทองอ่อน
          "dark-gold": "#B8860B", // ทองเข้ม
          dark: "#1A1A1A", // ดำพื้นหลัง
          light: "#F5F5F5", // เทาอ่อนพื้นหลัง
          mustard: "#D4AF37", // ทองมัสตาร์ด
        },
        bg: {
          dark: "#5D4037",
          darker: "#3E2723",
          "dark-light": "#6D4C41",
          "dark-gray": "#4E342E",
          "dark-warm": "#3E2723",
          cream: "#FFF9E6",
          "light-cream": "#FFFEF5",
          card: "#FFFFFF",
        },
        text: {
          primary: "#2C1810",
          secondary: "#5D4037",
          muted: "#8D6E63",
          light: "#FFFFFF",
        },
        accent: {
          success: "#4CAF50",
          error: "#E53935",
          warning: "#FB8C00",
          info: "#1E88E5",
          purple: "#7E57C2",
          blue: "#42A5F5",
          red: "#EF5350",
        },
        border: {
          default: "#D7CCC8",
        },
      },
      boxShadow: {
        gold: "0 4px 14px 0 rgba(255, 205, 80, 0.3)",
        "gold-lg": "0 10px 30px 0 rgba(255, 205, 80, 0.3)",
      },
      keyframes: {
        "slide-in-right": {
          "0%": { transform: "translateX(100%)", opacity: "0" },
          "100%": { transform: "translateX(0)", opacity: "1" },
        },
      },
      animation: {
        "slide-in-right": "slide-in-right 0.3s ease-out",
      },
    },
  },
  plugins: [],
};
