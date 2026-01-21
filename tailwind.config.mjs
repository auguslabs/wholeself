import { themeColors } from './src/styles/theme-colors.ts';

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        // Paleta de colores de WholeSelf Counseling
        // Los colores se generan automáticamente desde src/styles/theme-colors.ts
        // Para cambiar la paleta, edita solo los colores base en theme-colors.ts
        
        // White - sin variaciones
        white: themeColors.white,
        
        // Brown - con variaciones 50-950
        brown: themeColors.brown,
        
        // Light Brown - con variaciones 50-950
        lightbrown: themeColors.lightbrown,
        
        // Soft Aqua Gray - con variaciones 50-950
        softAquaGray: themeColors.softAquaGray,
        
        // Teal Blue - con variaciones 50-950
        tealBlue: themeColors.tealBlue,
        
        // Blue Green - con variaciones 50-950
        blueGreen: themeColors.blueGreen,
        
        // Navy - con variaciones 50-950
        navy: themeColors.navy,
        
        // Aliases para uso común (opcional, puedes usar los nombres completos)
        primary: themeColors.tealBlue,    // Teal Blue como color primario
        secondary: themeColors.navy,      // Navy como color secundario
        accent: themeColors.brown,         // Brown como acento
      },
    },
  },
  plugins: [],
};

