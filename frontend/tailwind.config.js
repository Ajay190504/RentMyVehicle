/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          black: "#000000",
          white: "#ffffff",
          primary: "#000000",
          "on-primary": "#ffffff",
          ink: "#000000",
          body: "#5e5e5e",
          mute: "#afafaf",
          "hairline-mid": "#4b4b4b",
          canvas: "#ffffff",
          "canvas-soft": "#efefef",
          "canvas-softer": "#f3f3f3",
          "surface-pressed": "#e2e2e2",
          link: "#0000ee",
          "on-dark": "#ffffff",
          "black-elevated": "#282828",
          accent: "#000000", // Monochrome accent
        }
      },
      spacing: {
        xxs: "4px",
        xs: "6px",
        sm: "8px",
        md: "12px",
        lg: "16px",
        xl: "20px",
        "2xl": "24px",
        "3xl": "32px",
      },
      borderRadius: {
        none: "0px",
        md: "8px",
        lg: "12px",
        xl: "16px",
        pill: "999px",
        "pill-tab": "36px",
        full: "9999px",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "Helvetica Neue", "Arial", "sans-serif"],
        display: ["Outfit", "Inter", "system-ui", "sans-serif"],
      }
    },
  },
  plugins: [],
}
