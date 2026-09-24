/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        develop: {
          blue: '#0f094f',
          plum: '#640354',
          violet: '#29008e',
          hero: '#07052e',
          surface: '#F8F8FC',
          primary: '#111111',
          secondary: '#555555',
          muted: '#888888',
          glow: '#a78bfa',
          pink: '#f472b6',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      borderRadius: {
        'develop-sm': '12px',
        'develop-md': '16px',
        'develop-lg': '24px',
        'develop-xl': '28px',
      },
      boxShadow: {
        'develop-card': '0 18px 50px rgba(0, 0, 0, 0.05)',
        'develop-hover': '0 24px 60px rgba(0, 0, 0, 0.10)',
        'develop-glow': '0 8px 24px rgba(167, 139, 250, 0.35)',
        'develop-dark-card': '0 20px 50px rgba(0, 0, 0, 0.12)',
        'develop-modal': '0 32px 90px rgba(0, 0, 0, 0.28)',
        'develop-box': '0 8px 20px rgba(15, 9, 79, 0.18)',
      },
      transitionTimingFunction: {
        'develop': 'cubic-bezier(0.16, 1, 0.3, 1)',
      }
    },
  },
  plugins: [],
}
