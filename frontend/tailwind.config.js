/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}"
  ],
  theme: {
    extend: {
      colors: {
        ink: "#0c0f14",
        fog: "#e7eef7",
        mist: "#d6e3f2",
        cloud: "#f7f9fc",
        accent: "#2b6ae6",
        accent2: "#18b47b",
        warn: "#f5a524"
      },
      boxShadow: {
        soft: "0 20px 60px -40px rgba(12, 15, 20, 0.45)",
        lift: "0 18px 35px -24px rgba(12, 15, 20, 0.4)"
      }
    }
  },
  plugins: []
}
