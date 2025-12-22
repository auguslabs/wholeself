import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';

// https://astro.build/config
export default defineConfig({
  integrations: [
    react(),
    tailwind({
      // Configuración de Tailwind
      applyBaseStyles: false, // Usaremos nuestro propio global.css
    }),
  ],
  output: 'static', // SSG por defecto, cambiar a 'server' para SSR
  // Para habilitar SSR, descomentar:
  // output: 'server',
  // adapter: node(),
  // Configuración del servidor de desarrollo para acceso desde red local
  server: {
    host: '0.0.0.0', // Escucha en todas las interfaces de red (accesible desde otros dispositivos)
    port: 4321, // Puerto por defecto de Astro
    strictPort: false, // Permite usar otro puerto si 4321 está ocupado
  },
  // Configuración de Vite para excluir carpetas del build
  vite: {
    // Solo la carpeta 'public' se copia al build
    // La carpeta 'xtra' en la raíz NO se incluirá en producción
    publicDir: 'public',
  },
});

