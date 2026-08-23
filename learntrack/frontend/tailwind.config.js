/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        night: '#161B33',
        night2: '#20274A',
        gold: '#F2B705',
        cyan: '#28C2C2',
        flame: '#E6483C',
        violet: '#5B4B8A',
      },
      fontFamily: {
        display: ['"Baloo 2"', 'cursive'],
        body: ['Nunito', 'sans-serif'],
        stat: ['Rajdhani', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
