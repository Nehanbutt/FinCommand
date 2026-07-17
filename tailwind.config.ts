import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          950: '#05070D',
          900: '#0A0E17',
          800: '#10141F',
          700: '#161B29',
          600: '#1E2436',
        },
        // Brand accent — repointed from the old amber/brass scheme to the
        // same indigo/periwinkle used on the marketing pages, so the whole
        // product (marketing + app) now shares one identity.
        brass: {
          400: '#8FA7FF',
          500: '#3B5BFF',
          600: '#2A46E0',
        },
        accent: {
          400: '#8FA7FF',
          500: '#3B5BFF',
          600: '#2A46E0',
        },
        signal: {
          blue: '#4C8CFF',
          green: '#3DDC97',
          red: '#E8555A',
        },
        line: 'rgba(148,163,184,0.12)',
        // Namespaced palette for the marketing landing/pricing pages only —
        // kept separate from the tokens above so the app/dashboard theme
        // (brass/ink) is completely untouched.
        gloss: {
          ink: '#07070A',
          panel: '#0E0F16',
          panel2: '#12131C',
          accent: '#3B5BFF',
          accent2: '#7C9BFF',
          fg: '#ECECF1',
          muted: '#8A8A96',
          line: 'rgba(255,255,255,0.08)',
        },
      },
      fontFamily: {
        display: ['var(--font-display)', 'serif'],
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'ui-monospace', 'monospace'],
        // Namespaced fonts for the marketing pages — does not touch the
        // app-wide display/sans/mono stacks above.
        glossDisplay: ['"Space Grotesk"', 'sans-serif'],
        glossBody: ['"Inter"', 'sans-serif'],
        glossSignature: ['"Caveat"', 'cursive'],
        glossMono: ['"JetBrains Mono"', 'monospace'],
      },
      boxShadow: {
        glow: '0 0 0 1px rgba(59,91,255,0.18), 0 8px 30px rgba(59,91,255,0.12)',
        'gloss-glow': '0 0 40px rgba(59,91,255,0.35)',
        'gloss-glow-sm': '0 0 18px rgba(59,91,255,0.4)',
        'gloss-glow-gold': '0 0 40px rgba(245,185,66,0.32)',
        'gloss-glow-gold-sm': '0 0 18px rgba(245,185,66,0.45)',
      },
      keyframes: {
        marquee: {
          '0%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        drift1: {
          '0%, 100%': { transform: 'translate(0, 0) scale(1)' },
          '50%': { transform: 'translate(60px, 40px) scale(1.12)' },
        },
        drift2: {
          '0%, 100%': { transform: 'translate(0, 0) scale(1)' },
          '50%': { transform: 'translate(-50px, 30px) scale(1.08)' },
        },
        drift3: {
          '0%, 100%': { transform: 'translate(0, 0) scale(1)' },
          '50%': { transform: 'translate(30px, -50px) scale(1.15)' },
        },
      },
      animation: {
        marquee: 'marquee 18s linear infinite',
        drift1: 'drift1 22s ease-in-out infinite',
        drift2: 'drift2 26s ease-in-out infinite',
        drift3: 'drift3 30s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
export default config;
