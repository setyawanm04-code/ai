/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          950: "#07080B",
          900: "#0C0E13",
          800: "#12151C",
          700: "#1B1F29",
          600: "#262B38",
          500: "#3A4152",
        },
        mist: {
          50: "#F5F6F8",
          100: "#E7E9EE",
          200: "#C9CEDA",
          300: "#9AA3B7",
          400: "#6B768F",
        },
        forge: {
          400: "#6EE7C0",
          500: "#2FD495",
          600: "#18B37E",
          700: "#0F8F66",
        },
        signal: {
          amber: "#F2B84B",
          rose: "#F0637A",
          violet: "#9B8CFB",
        },
      },
      fontFamily: {
        display: ["'Fraunces'", "serif"],
        sans: ["'Inter'", "system-ui", "sans-serif"],
        mono: ["'JetBrains Mono'", "monospace"],
      },
      boxShadow: {
        forge: "0 0 0 1px rgba(47,212,149,0.15), 0 8px 30px -8px rgba(47,212,149,0.25)",
      },
      keyframes: {
        rise: {
          "0%": { opacity: 0, transform: "translateY(8px)" },
          "100%": { opacity: 1, transform: "translateY(0)" },
        },
      },
      animation: {
        rise: "rise 0.5s cubic-bezier(0.16,1,0.3,1) both",
      },
    },
  },
  plugins: [],
};
