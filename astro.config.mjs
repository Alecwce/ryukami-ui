import { defineConfig, fontProviders } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  devToolbar: {
    enabled: false,
  },
  compressHTML: true,
  fonts: [
    {
      provider: fontProviders.google(),
      name: 'Press Start 2P',
      cssVariable: '--font-pixel',
    },
    {
      provider: fontProviders.google(),
      name: 'Tiny5',
      cssVariable: '--font-sub',
    },
    {
      provider: fontProviders.google(),
      name: 'JetBrains Mono',
      cssVariable: '--font-mono',
    },
    {
      provider: fontProviders.google(),
      name: 'VT323',
      cssVariable: '--font-vt323',
    },
  ],
  vite: {
    plugins: [tailwindcss()],
  },
  output: 'static',
});
