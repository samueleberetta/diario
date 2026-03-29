/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        sans: ['"Inter"', 'system-ui', 'sans-serif'],
      },
      colors: {
        paper: {
          50:  '#fdfaf4',
          100: '#f9f3e3',
          200: '#f0e6c8',
          300: '#e4d4a8',
        },
        ink: {
          DEFAULT: '#1a1a1a',
          light: '#3d3d3d',
          muted: '#6b6b6b',
        },
        done:    '#4a7c59',
        partial: '#c07a2a',
        missed:  '#b04040',
      },
    },
  },
  plugins: [],
}
