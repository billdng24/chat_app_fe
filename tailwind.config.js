/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      backgroundColor: {
        "bgc-0.5": "rgba(0,0,0,0.5)",
      },
    },
    screens: {
      sm_mobile: "320px",
      mobile: "500px",
      sm_tablet: "600px",
      tablet: "768px",
      pc: "1024px",
    },
  },
  plugins: [],
};
