/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#4f46e5',
        secondary: '#ec4899',
        darkBg: '#0f172a',
        darkCard: '#1e293b'
      }
    },
  },
  darkMode: 'class',
  plugins: [],
}
