import type { Config } from 'tailwindcss';

/**
 * Palette premium UP : Noir Nuit + Or.
 * Toute couleur utilisee dans l'app doit venir d'ici (pas de hex en dur dans les composants).
 */
const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        night: {
          DEFAULT: '#0B0B0C', // fond principal
          soft: '#121214', // surfaces / cartes
          raised: '#1A1A1D', // surfaces elevees, inputs
          border: '#26262B',
        },
        gold: {
          DEFAULT: '#D4AF37',
          soft: '#E4C766',
          deep: '#A8862A',
          dim: 'rgba(212, 175, 55, 0.12)',
        },
        ink: {
          DEFAULT: '#FFFFFF',
          muted: '#A1A1AA',
          faint: '#71717A',
        },
        status: {
          success: '#3FB57A',
          warning: '#E0A33E',
          danger: '#E05A5A',
          info: '#5A9CE0',
        },
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        gold: '0 0 0 1px rgba(212, 175, 55, 0.35), 0 8px 24px -12px rgba(212, 175, 55, 0.45)',
        card: '0 1px 2px rgba(0, 0, 0, 0.6), 0 8px 24px -16px rgba(0, 0, 0, 0.9)',
      },
      borderRadius: {
        xl: '0.875rem',
        '2xl': '1.25rem',
      },
      keyframes: {
        'fade-up': {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.35s ease-out both',
        shimmer: 'shimmer 1.6s infinite',
      },
    },
  },
  plugins: [],
};

export default config;
