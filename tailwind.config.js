/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        seed: {
          primary: '#ff6f0f',
          'primary-hover': '#ff9e66',
          'primary-pressed': '#ff9e66',
          marketing: '#ff6600',
          canvas: '#ffffff',
          background: '#f2f3f6',
          surface: '#f7f8fa',
          foreground: '#212124',
          muted: '#868b94',
          hairline: '#eaebee',
          'brand-tint': '#fff5f0',
          error: '#fa2314',
          info: '#009ceb',
          success: '#1aa174',
        },
        pastel: {
          bg: '#FFFBF5',
          card: '#FFFFFF',
          pink: {
            light: '#FFF0F5',
            DEFAULT: '#FFB6C1',
            dark: '#FF8DA1',
            deep: '#FF69B4',
          },
          purple: {
            light: '#F3E8FF',
            DEFAULT: '#D8B4F8',
            dark: '#B388EB',
          },
          blue: {
            light: '#E0F2FE',
            DEFAULT: '#7DD3FC',
            dark: '#38BDF8',
          },
          mint: {
            light: '#ECFDF5',
            DEFAULT: '#6EE7B7',
            dark: '#34D399',
          },
          yellow: {
            light: '#FEFCE8',
            DEFAULT: '#FDE047',
            dark: '#FACC15',
          },
          orange: {
            light: '#fff5f0',
            DEFAULT: '#ff6f0f',
            dark: '#ff6600',
          },
          peach: {
            light: '#FFF5F0',
            DEFAULT: '#FFCAB9',
            dark: '#FFA07A',
          }
        }
      },
      fontFamily: {
        sans: ['"Comic Sans MS"', '"Fredoka"', '"Jua"', '"Gaegu"', 'sans-serif'],
        rounded: ['"Fredoka"', '"Jua"', 'sans-serif'],
      },
      boxShadow: {
        'pastel': '0 8px 24px -4px rgba(255, 182, 193, 0.3)',
        'pastel-lg': '0 12px 32px -4px rgba(216, 180, 248, 0.4)',
        'cute': '0 6px 0px 0px rgba(0, 0, 0, 0.08)',
        'cute-lg': '0 8px 0px 0px rgba(0, 0, 0, 0.1)',
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      },
      animation: {
        'bounce-slow': 'bounce 2s infinite',
        'pulse-fast': 'pulse 1s infinite',
        'wiggle': 'wiggle 0.5s ease-in-out infinite',
        'float': 'float 3s ease-in-out infinite',
      },
      keyframes: {
        wiggle: {
          '0%, 100%': { transform: 'rotate(-3deg)' },
          '50%': { transform: 'rotate(3deg)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        }
      }
    },
  },
  plugins: [],
}
