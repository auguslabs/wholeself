/**
 * Servicio de Contenido - Content Service
 * 
 * Lee los datos de contenido de las páginas desde archivos JSON.
 * Incluye validación con Zod y funciones para actualización de metadatos.
 * Preparado para migrar a API cuando esté lista la BD.
 */

import type { ContentPage } from '../models/ContentPage';
import { getLocalizedText } from '../models/ContentPage';
import { safeValidateContentPage } from '../validators/contentSchemas';
import { updateMetadata, updateLastUpdated } from '../utils/metadataUtils';
import { validateLinks } from '../utils/linkValidator';
// Importación condicional de versionHistory solo en servidor
// No importar directamente para evitar que se incluya en el bundle del cliente

// Cache para almacenar contenido cargado
const contentCache = new Map<string, ContentPage>();

/**
 * Carga el contenido de una página específica desde JSON
 * @param pageId Identificador de la página (ej: 'home', 'services', 'contact')
 * @returns Contenido de la página
 */
export async function getPageContent(pageId: string): Promise<ContentPage> {
  // Verificar cache primero
  if (contentCache.has(pageId)) {
    return contentCache.get(pageId)!;
  }

  try {
    // Cargar desde JSON usando import dinámico
    // Nota: Vite requiere que las rutas sean relativas y explícitas
    const contentModule = await import(`../content/pages/${pageId}.json`);
    const rawContent = contentModule.default;
    
    // Validar estructura con Zod
    const validation = safeValidateContentPage(rawContent);
    
    if (!validation.success) {
      console.error(`Validation error for page "${pageId}":`, validation.error);
      // En desarrollo, mostrar errores detallados
      if (process.env.NODE_ENV === 'development') {
        console.error('Validation details:', JSON.stringify(validation.error.errors, null, 2));
      }
      throw new Error(`Invalid content structure for page: ${pageId}`);
    }
    
    const content = validation.data;
    
    // Guardar en cache
    contentCache.set(pageId, content);
    
    return content;
  } catch (error: any) {
    // Mejorar mensaje de error para debugging
    const errorMessage = error?.message || String(error);
    const isImportError = errorMessage.includes('Failed to fetch') || 
                         errorMessage.includes('Cannot find module') ||
                         errorMessage.includes('Failed to resolve');
    
    if (isImportError) {
      console.error(`Error loading content for page "${pageId}":`, error);
      console.error(`Trying to load: ../content/pages/${pageId}.json`);
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
  const cacheKey = `shared-${type}`;
  
  // Verificar cache primero
  if (contentCache.has(cacheKey)) {
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
      if (process.env.NODE_ENV === 'development') {
        console.error('Validation details:', JSON.stringify(validation.error.errors, null, 2));
      }
      throw new Error(`Invalid content structure for shared: ${type}`);
    }
    
    const content = validation.data;
    
    // Guardar en cache
    contentCache.set(cacheKey, content);
    
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
 * Guarda una versión en el historial antes de actualizar
 * Útil para el portal de edición
 * Solo funciona en el servidor (Node.js)
 * @param pageId Identificador de la página
 * @param content Contenido a guardar en historial
 * @param author Autor del cambio (opcional)
 * @param comment Comentario del cambio (opcional)
 * @returns Entrada de versión guardada
 */
export async function saveContentVersion(
  pageId: string,
  content: ContentPage,
  author?: string,
  comment?: string
) {
  // Solo ejecutar en el servidor (Node.js)
  if (typeof window !== 'undefined' || typeof process === 'undefined') {
    throw new Error('saveContentVersion can only be called on the server');
  }
  
  // Importación dinámica solo en servidor
  // Usar import() con verificación de entorno para evitar que se incluya en el bundle del cliente
  // El sufijo .server.ts asegura que Astro/Vite no intente incluir este módulo en el bundle del cliente
  try {
    const versionHistoryModule = await import('../utils/versionHistory.server');
    return await versionHistoryModule.saveVersion(pageId, content, author, comment);
  } catch (error) {
    // Si falla la importación (por ejemplo, en el cliente), lanzar error descriptivo
    if (typeof window !== 'undefined') {
      throw new Error('saveContentVersion can only be called on the server');
    }
    throw error;
  }
}
