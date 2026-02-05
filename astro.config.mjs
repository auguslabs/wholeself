import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';

// https://astro.build/config
// Deploy estático: output 'static'. Sin adapter. Base siempre raíz (public_html).
// Para volver a Node (BanaHost): import node from '@astrojs/node'; adapter: node({ mode: 'standalone' }); output: 'server';
const basePath = process.env.BASE_PATH || '/';
export default defineConfig({
  base: basePath,
  integrations: [
    react(),
    tailwind({
      applyBaseStyles: false,
    }),
  ],
  output: 'static',
  server: {
    host: '0.0.0.0',
    port: 4321,
    strictPort: false,
  },
  vite: {
    publicDir: 'public',
    resolve: {
      conditions: ['import', 'module', 'browser', 'default'],
    },
  },
});

