/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        scorch: {
          crimson: '#E63946',
          dark: '#9B1B30',
          cyan: '#4DA3FF',
          gold: '#F4D35E',
          'gold-text': '#B45309',
        },
        canvas: {
          paper: '#F5F7FA',
          surface: '#FFFFFF',
          hacker: '#0B0F17',
          darkSurface: '#111827',
        },
      },
      boxShadow: {
        'brutal-sm': '-2px 2px 0px 0px var(--shadow-color, #000000)',
        'brutal': '-4px 4px 0px 0px var(--shadow-color, #000000)',
        'brutal-lg': '-6px 6px 0px 0px var(--shadow-color, #000000)',
        'brutal-xl': '-8px 8px 0px 0px var(--shadow-color, #000000)',
      },
      fontFamily: {
        pixel: ["'Press Start 2P'", "'VT323'", 'monospace'],
        sub: ["'Tiny5'", "'VT323'", 'monospace'],
        mono: ["'JetBrains Mono'", 'monospace'],
      },
      borderWidth: {
        '2': '2px',
        '3': '3px',
      },
    },
  },
  plugins: [],
};
