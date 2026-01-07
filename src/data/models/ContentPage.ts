/**
 * Modelo de Datos - Content Page
 * 
 * Define la estructura de datos para el contenido de las páginas.
 * Todos los textos deben tener versión en inglés (en) y español (es).
 */

/**
 * Metadatos de la página
 */
export interface ContentMeta {
  pageId: string;           // Identificador único de la página
  lastUpdated: string;      // Fecha de última actualización (ISO 8601)
  version: number;           // Versión del contenido
}

/**
 * Texto localizado (inglés/español)
 */
export interface LocalizedText {
  en: string;
  es: string;
}

/**
 * Array localizado (inglés/español)
 */
export interface LocalizedArray {
  en: string[];
  es: string[];
}

/**
 * Contenido SEO de la página
 */
export interface SEOContent {
  title: LocalizedText;
  description: LocalizedText;
  keywords?: LocalizedArray;
}

/**
 * Estructura base de una página de contenido
 * El campo 'content' es específico para cada página
 */
export interface ContentPage {
  meta: ContentMeta;
  seo: SEOContent;
  content: Record<string, any>; // Estructura específica por página
}

/**
 * Obtiene el texto en el idioma especificado
 * @param text Objeto con textos en en/es
 * @param language Idioma deseado ('en' | 'es')
 * @returns Texto en el idioma especificado, o inglés por defecto
 */
export function getLocalizedText(
  text: LocalizedText,
  language: 'en' | 'es' = 'en'
): string {
  return text[language] || text.en || '';
}

/**
 * Obtiene un array en el idioma especificado
 * @param array Objeto con arrays en en/es
 * @param language Idioma deseado ('en' | 'es')
 * @returns Array en el idioma especificado, o inglés por defecto
 */
export function getLocalizedArray(
  array: LocalizedArray,
  language: 'en' | 'es' = 'en'
): string[] {
  return array[language] || array.en || [];
}
