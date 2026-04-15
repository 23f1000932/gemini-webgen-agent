/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        neo: {
          bg: '#FFFDF5',
          ink: '#000000',
          accent: '#FF6B6B',
          secondary: '#FFD93D',
          muted: '#C4B5FD',
        },
      },
      fontFamily: {
        sans: ['"Space Grotesk"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        neoSm: '4px 4px 0px 0px #000',
        neoMd: '8px 8px 0px 0px #000',
        neoLg: '12px 12px 0px 0px #000',
        neoXl: '16px 16px 0px 0px #000',
      },
      keyframes: {
        wiggle: {
          '0%, 100%': { transform: 'rotate(-1deg)' },
          '50%': { transform: 'rotate(1deg)' },
        },
      },
      animation: {
        wiggle: 'wiggle 1.2s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
