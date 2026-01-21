/**
 * Sistema de Colores - WholeSelf Counseling
 * 
 * Define aquí SOLO los colores principales de la paleta.
 * El sistema generará automáticamente 5 tintes (más claros) y 5 sombras (más oscuros)
 * para cada color.
 * 
 * Para cambiar la paleta completa, solo modifica los valores de baseColors.
 */

/**
 * Colores base de la paleta
 * Solo modifica estos valores para cambiar toda la paleta
 */
export const baseColors = {
  white: '#FEFEFE',        // White - no necesita variaciones
  brown: '#765e47',        // Brown
  lightbrown: '#9c7346',   // Light Brown
  softAquaGray: '#D1DADA', // Soft Aqua Gray
  tealBlue: '#518399',     // Teal Blue
  blueGreen: '#3e9791',    // Blue Green
  navy: '#274776',         // Navy
} as const;

/**
 * Convierte un color HEX a RGB
 */
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

/**
 * Convierte RGB a HEX
 */
function rgbToHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b].map((x) => x.toString(16).padStart(2, '0')).join('');
}

/**
 * Mezcla un color con blanco para crear un tinte (más claro)
 * @param hex Color base en formato HEX
 * @param amount Cantidad de mezcla (0-1, donde 1 es completamente blanco)
 */
function tint(hex: string, amount: number): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;

  const r = Math.round(rgb.r + (255 - rgb.r) * amount);
  const g = Math.round(rgb.g + (255 - rgb.g) * amount);
  const b = Math.round(rgb.b + (255 - rgb.b) * amount);

  return rgbToHex(r, g, b);
}

/**
 * Mezcla un color con negro para crear una sombra (más oscuro)
 * @param hex Color base en formato HEX
 * @param amount Cantidad de mezcla (0-1, donde 1 es completamente negro)
 */
function shade(hex: string, amount: number): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;

  const r = Math.round(rgb.r * (1 - amount));
  const g = Math.round(rgb.g * (1 - amount));
  const b = Math.round(rgb.b * (1 - amount));

  return rgbToHex(r, g, b);
}

/**
 * Genera una paleta completa de colores con tintes y sombras
 * @param baseColor Color base en formato HEX
 * @returns Objeto con todas las variaciones (50-950)
 */
function generateColorScale(baseColor: string) {
  return {
    50: tint(baseColor, 0.95),   // Muy claro
    100: tint(baseColor, 0.9),   // Claro
    200: tint(baseColor, 0.75),  // Claro-medio
    300: tint(baseColor, 0.5),   // Medio-claro
    400: tint(baseColor, 0.25),  // Ligeramente claro
    500: baseColor,              // Color base
    600: shade(baseColor, 0.2),  // Ligeramente oscuro
    700: shade(baseColor, 0.4),  // Medio-oscuro
    800: shade(baseColor, 0.6),  // Oscuro
    900: shade(baseColor, 0.75), // Muy oscuro
    950: shade(baseColor, 0.9),  // Extremadamente oscuro
  };
}

/**
 * Genera la paleta completa de colores para Tailwind
 * Solo modifica baseColors arriba para cambiar toda la paleta
 */
export function generateThemeColors() {
  return {
    // White - sin variaciones, solo el color base
    white: baseColors.white,
    
    // Brown - con todas las variaciones
    brown: generateColorScale(baseColors.brown),
    
    // Light Brown - con todas las variaciones
    lightbrown: generateColorScale(baseColors.lightbrown),
    
    // Soft Aqua Gray - con todas las variaciones
    softAquaGray: generateColorScale(baseColors.softAquaGray),
    
    // Teal Blue - con todas las variaciones
    tealBlue: generateColorScale(baseColors.tealBlue),
    
    // Blue Green - con todas las variaciones
    blueGreen: generateColorScale(baseColors.blueGreen),
    
    // Navy - con todas las variaciones
    navy: generateColorScale(baseColors.navy),
  };
}

/**
 * Exporta los colores generados para usar en Tailwind
 */
export const themeColors = generateThemeColors();

