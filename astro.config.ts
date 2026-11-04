import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  site: 'https://ryukami-ui.pages.dev',
  devToolbar: {
    enabled: false,
  },
  compressHTML: true,
  prefetch: {
    prefetchAll: true,
    defaultStrategy: 'hover',
  },
  vite: {
    plugins: [tailwindcss()],
  },
  output: 'static',
});
