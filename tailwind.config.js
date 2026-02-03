/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        // Lighter Mango CIB Palette
        'mango-green': '#8BBF72',
        'mango-green-dark': '#5A8A4A',
        'mango-green-light': '#A8D48F',
        'mango-yellow': '#FFE099',
        'mango-yellow-light': '#FFF0CC',
        'mango-orange': '#FFAA4D',
        
        // Editorial Colors
        'background': '#FDFCF9',
        'background-alt': '#F8F6F2',
        'text-primary': '#2D3A24',
        'text-muted': '#5A6B52',
        'text-light': '#7A8872',
        'border-color': '#E5E2DC',
        'cyan-tint': '#E5F7F8',
      },
      fontFamily: {
        'display': ['Playfair Display', 'Georgia', 'serif'],
        'body': ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.6s ease-out forwards',
        'fade-in-up': 'fadeInUp 0.6s ease-out forwards',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}
