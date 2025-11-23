/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          light: "#E8D5FF",
          DEFAULT: "#A855F7",
        },
        accent: {
          orange: "#FB923C",
        },
      },
    },
  },
  plugins: [],
};
