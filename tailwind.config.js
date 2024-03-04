/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      backgroundColor: {
        "bgc-0.5": "rgba(0,0,0,0.5)",
      },
    },
  },
  plugins: [],
};