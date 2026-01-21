import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';
import netlify from '@astrojs/netlify';

// https://astro.build/config
export default defineConfig({
  adapter: netlify(),
  integrations: [
    react(),
    tailwind({
      // Configuraci?n de Tailwind
      applyBaseStyles: false, // Usaremos nuestro propio global.css
    }),
  ],
  output: 'server', // Necesario para SSR en Netlify
  // Configuraci?n del servidor de desarrollo para acceso desde red local
  server: {
    host: '0.0.0.0', // Escucha en todas las interfaces de red (accesible desde otros dispositivos)
    port: 4321, // Puerto por defecto de Astro
    strictPort: false, // Permite usar otro puerto si 4321 est? ocupado
  },
  // Configuraci?n de Vite para excluir carpetas del build
  vite: {
    // Solo la carpeta 'public' se copia al build
    // La carpeta 'xtra' en la ra?z NO se incluir? en producci?n
    publicDir: 'public',
    // Configuraci?n SSR para manejar m?dulos de Node.js
    ssr: {
      // Externalizar m?dulos de Node.js para que no se incluyan en el bundle del cliente
      external: ['fs/promises', 'fs', 'path'],
    },
    // Configuraci?n de build para externalizar m?dulos de Node.js en el bundle del cliente
    // Esto es una medida adicional de seguridad junto con el sufijo .server.ts
    build: {
      rollupOptions: {
        external: ['path', 'fs', 'fs/promises'],
      },
    },
    // Configuraci?n de resoluci?n
    resolve: {
      conditions: ['import', 'module', 'browser', 'default'],
    },
  },
});

