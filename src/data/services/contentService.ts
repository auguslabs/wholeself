/**
 * Servicio de Contenido - Content Service
 * 
 * Lee los datos de contenido desde archivos JSON o desde la BD cuando
 * PUBLIC_USE_CONTENT_FROM_BD está activo (servidor: contentDbService; cliente: fetch a /api/content).
 */

import type { ContentPage } from '../models/ContentPage';
import { getLocalizedText } from '../models/ContentPage';
import { safeValidateContentPage } from '../validators/contentSchemas';
import { updateMetadata, updateLastUpdated } from '../utils/metadataUtils';
import { validateLinks } from '../utils/linkValidator';

function useContentFromDb(): boolean {
  // Detalle: extra/learning-from-coding.md (variables de entorno en Vite/Astro).
  const v = import.meta.env.PUBLIC_USE_CONTENT_FROM_BD;
  return v === 'true' || v === true;
}

// Cache para almacenar contenido cargado (solo cuando se usa JSON)
const contentCache = new Map<string, ContentPage>();
const contentModules = import.meta.glob('../content/**/pages/*.json', { eager: true });

/**
 * Carga el contenido de una página específica desde JSON
 * @param pageId Identificador de la página (ej: 'home', 'services', 'contact')
 * @param locale Idioma opcional ('en' | 'es') para cargar contenido por idioma
 * @returns Contenido de la página
 */
export async function getPageContent(
  pageId: string,
  locale?: 'en' | 'es'
): Promise<ContentPage> {
  if (useContentFromDb()) {
    if (import.meta.env.SSR) {
      const { getPageContentFromDb } = await import('./contentDbService.server');
      return getPageContentFromDb(pageId, locale);
    }
    const base = (import.meta.env.BASE_URL || '/').replace(/\/$/, '') || '';
    const url = `${base}/api/content/${encodeURIComponent(pageId)}?locale=${locale || 'en'}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Failed to load content for page: ${pageId}`);
    return res.json();
  }

  const cacheKey = locale ? `${locale}:${pageId}` : pageId;
  const contentPath = locale
    ? `../content/${locale}/pages/${pageId}.json`
    : `../content/pages/${pageId}.json`;
  const isDev = import.meta.env.DEV;

  // Verificar cache primero
  if (!isDev && contentCache.has(cacheKey)) {
    return contentCache.get(cacheKey)!;
  }

  try {
    const contentModule = contentModules[contentPath] as { default: unknown } | undefined;
    if (!contentModule) {
      throw new Error(`Content module not found for path: ${contentPath}`);
    }
    const rawContent = contentModule.default;
    
    // Validar estructura con Zod
    const validation = safeValidateContentPage(rawContent);
    
    if (!validation.success) {
      console.error(`Validation error for page "${pageId}":`, validation.error);
      // En desarrollo, mostrar errores detallados
      if (import.meta.env.DEV) {
        console.error('Validation details:', JSON.stringify(validation.error.errors, null, 2));
      }
      throw new Error(`Invalid content structure for page: ${pageId}`);
    }
    
    const content = validation.data;
    
    // Guardar en cache
    if (!isDev) {
      contentCache.set(cacheKey, content);
    }
    
    return content;
  } catch (error: any) {
    // Mejorar mensaje de error para debugging
    const errorMessage = error?.message || String(error);
    const isImportError = errorMessage.includes('Failed to fetch') || 
                         errorMessage.includes('Cannot find module') ||
                         errorMessage.includes('Failed to resolve');
    
    if (isImportError) {
      console.error(`Error loading content for page "${pageId}":`, error);
      console.error(`Trying to load: ${contentPath}`);
      console.error('Tip: If this is a new file, try restarting the dev server.');
      throw new Error(`Failed to load content for page: ${pageId}. File may not exist or dev server needs restart.`);
    }
    
    console.error(`Error loading content for page "${pageId}":`, error);
    throw new Error(`Failed to load content for page: ${pageId}`);
  }
}

/**
 * Carga contenido compartido (footer, header, etc.)
 * @param type Tipo de contenido compartido ('footer' | 'header')
 * @returns Contenido compartido
 */
export async function getSharedContent(type: 'footer' | 'header'): Promise<ContentPage> {
  if (useContentFromDb()) {
    if (import.meta.env.SSR) {
      const { getSharedContentFromDb } = await import('./contentDbService.server');
      return getSharedContentFromDb(type);
    }
    const base = (import.meta.env.BASE_URL || '/').replace(/\/$/, '') || '';
    const pageId = type === 'header' ? 'shared-header' : 'shared-footer';
    const url = `${base}/api/content/${pageId}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Failed to load shared content: ${type}`);
    return res.json();
  }

  const cacheKey = `shared-${type}`;
  const isDev = import.meta.env.DEV;
  
  // Verificar cache primero
  if (!isDev && contentCache.has(cacheKey)) {
    return contentCache.get(cacheKey)!;
  }

  try {
    // Cargar desde JSON usando import dinámico
    const contentModule = await import(`../content/shared/${type}.json`);
    const rawContent = contentModule.default;
    
    // Validar estructura con Zod
    const validation = safeValidateContentPage(rawContent);
    
    if (!validation.success) {
      console.error(`Validation error for shared content "${type}":`, validation.error);
      if (import.meta.env.DEV) {
        console.error('Validation details:', JSON.stringify(validation.error.errors, null, 2));
      }
      throw new Error(`Invalid content structure for shared: ${type}`);
    }
    
    const content = validation.data;
    
    // Guardar en cache
    if (!isDev) {
      contentCache.set(cacheKey, content);
    }
    
    return content;
  } catch (error) {
    console.error(`Error loading shared content "${type}":`, error);
    throw new Error(`Failed to load shared content: ${type}`);
  }
}

/**
 * Obtiene el texto localizado según el idioma
 * Re-exporta la función del modelo para conveniencia
 * @param text Objeto con textos en en/es
 * @param language Idioma deseado ('en' | 'es')
 * @returns Texto en el idioma especificado
 */
export { getLocalizedText } from '../models/ContentPage';

/**
 * Limpia el cache de contenido
 * Útil para desarrollo cuando se actualizan los JSON
 */
export function clearContentCache(): void {
  contentCache.clear();
}

/**
 * Limpia el cache de una página específica
 * @param pageId Identificador de la página
 */
export function clearPageCache(pageId: string): void {
  contentCache.delete(pageId);
}

/**
 * Actualiza los metadatos de un ContentPage
 * Útil para cuando se guarda contenido desde el portal
 * @param content ContentPage a actualizar
 * @returns ContentPage con metadatos actualizados
 */
export function updateContentMetadata(content: ContentPage): ContentPage {
  return updateMetadata(content);
}

/**
 * Actualiza solo lastUpdated sin incrementar version
 * Útil para correcciones menores
 * @param content ContentPage a actualizar
 * @returns ContentPage con lastUpdated actualizado
 */
export function updateContentLastUpdated(content: ContentPage): ContentPage {
  return updateLastUpdated(content);
}

/**
 * Valida todos los links en un ContentPage
 * @param content ContentPage a validar
 * @returns Resultado de validación con links inválidos si los hay
 */
export function validateContentLinks(content: ContentPage) {
  return validateLinks(content);
}

/**
 * ⚠️ NOTA: La función saveContentVersion ha sido movida a contentAdminService.server.ts
 * 
 * Para usar funciones de administración de contenido (escritura, versiones), importa desde:
 * @example
 * import { saveContentVersion } from '@/data/services/contentAdminService.server';
 * 
 * Esto asegura que el código de servidor no se incluya en el bundle del cliente.
 */
