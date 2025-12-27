/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#fef3f2',
          100: '#fee4e2',
          200: '#fececa',
          300: '#fcaca4',
          400: '#f87c6f',
          500: '#ef5242',
          600: '#dc3524',
          700: '#b9291a',
          800: '#992519',
          900: '#7f251c',
          950: '#450f09',
        },
        secondary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#b9e6fe',
          300: '#7cd3fd',
          400: '#36bffa',
          500: '#0ca6eb',
          600: '#0084c9',
          700: '#0169a3',
          800: '#065986',
          900: '#0b4a6f',
          950: '#072f4a',
        },
        game: {
          dark: '#0f0f1a',
          darker: '#0a0a12',
          light: '#1a1a2e',
          accent: '#16213e',
        }
      },
      fontFamily: {
        game: ['Cinzel', 'serif'],
        body: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
