/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        olive: {
          50: '#f6f7f4',
          100: '#e3e6dc',
          200: '#c8cfbb',
          300: '#a6b193',
          400: '#8a9772',
          500: '#657b50',
          600: '#4e6140',
          700: '#3f4d35',
          800: '#353f2e',
          900: '#2d3528',
          950: '#161c13',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Bebas Neue', 'sans-serif'],
      },
      animation: {
        'in': 'animateIn 0.5s ease-out',
      },
      keyframes: {
        animateIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}

