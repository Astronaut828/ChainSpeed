/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}", "./utils/**/*.{js,ts,jsx,tsx}"],
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  plugins: [require("daisyui")],
  darkTheme: "dark",
  darkMode: ["selector", "[data-theme='dark']"],
  // DaisyUI theme colors
  daisyui: {
    themes: [
      {
        light: {
          primary: "#93BBFB",
          "primary-content": "#212638",
          secondary: "#DAE8FF",
          "secondary-content": "#212638",
          accent: "#93BBFB",
          "accent-content": "#212638",
          neutral: "#212638",
          "neutral-content": "#ffffff",
          "base-100": "#ffffff",
          "base-200": "#f4f8ff",
          "base-300": "#DAE8FF",
          "base-content": "#212638",
          info: "#93BBFB",
          success: "#34EEB6",
          warning: "#FFCF72",
          error: "#FF8863",

          "--rounded-btn": "9999rem",

          ".tooltip": {
            "--tooltip-tail": "6px",
          },
          ".link": {
            textUnderlineOffset: "2px",
          },
          ".link:hover": {
            opacity: "80%",
          },
        },
      },
      {
        dark: {
          primary: "#1c1c1c", // Dark background
          "primary-content": "#e0e0e0", // Light text color
          secondary: "#ff4500", // Reddit orange
          "secondary-content": "#F9FBFF", // Light content color
          accent: "#0079d3", // Reddit blue
          "accent-content": "#F9FBFF", // Light content color
          neutral: "#2f2f2f", // Neutral dark color
          "neutral-content": "#ffffff", // White text for neutral
          "base-100": "#2a2a2a", // Base color for cards
          "base-200": "#3a3a3a", // Slightly lighter dark
          "base-300": "#4a4a4a", // Even lighter dark
          "base-content": "#ffffff", // Content color
          info: "#0079d3", // Blue for info
          success: "#34EEB6", // Green for success
          warning: "#FFCF72", // Yellow for warning
          error: "#FF8863", // Red for error

          "--rounded-btn": "9999rem",

          ".tooltip": {
            "--tooltip-tail": "6px",
            "--tooltip-color": "oklch(var(--p))",
          },
          ".link": {
            textUnderlineOffset: "2px",
          },
          ".link:hover": {
            opacity: "80%",
          },
        },
      },
    ],
  },
  theme: {
    extend: {
      boxShadow: {
        center: "0 0 12px -2px rgb(0 0 0 / 0.05)",
      },
      colors: {
        neonGreen: '#32CD32', // Custom neon green color
      },
      animation: {
        "pulse-fast": "pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
    },
  },
};
