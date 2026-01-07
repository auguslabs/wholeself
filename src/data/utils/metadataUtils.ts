/**
 * Utilidades de Metadatos - Metadata Utils
 * 
 * Funciones para actualizar automáticamente metadatos (lastUpdated, version)
 */

import type { ContentPage, ContentMeta } from '../models/ContentPage';

/**
 * Actualiza los metadatos de un ContentPage
 * - Actualiza lastUpdated a la fecha/hora actual (ISO 8601)
 * - Incrementa version en 1
 * 
 * @param content ContentPage a actualizar
 * @returns ContentPage con metadatos actualizados
 */
export function updateMetadata(content: ContentPage): ContentPage {
  return {
    ...content,
    meta: {
      ...content.meta,
      lastUpdated: new Date().toISOString(),
      version: content.meta.version + 1,
    },
  };
}

/**
 * Crea metadatos iniciales para una nueva página
 * 
 * @param pageId Identificador de la página
 * @returns ContentMeta inicializado
 */
export function createInitialMetadata(pageId: string): ContentMeta {
  return {
    pageId,
    lastUpdated: new Date().toISOString(),
    version: 1,
  };
}

/**
 * Actualiza solo lastUpdated sin incrementar version
 * Útil para correcciones menores que no requieren nueva versión
 * 
 * @param content ContentPage a actualizar
 * @returns ContentPage con lastUpdated actualizado
 */
export function updateLastUpdated(content: ContentPage): ContentPage {
  return {
    ...content,
    meta: {
      ...content.meta,
      lastUpdated: new Date().toISOString(),
    },
  };
}

/**
 * Incrementa version sin actualizar lastUpdated
 * Útil para casos especiales donde se necesita control manual
 * 
 * @param content ContentPage a actualizar
 * @returns ContentPage con version incrementada
 */
export function incrementVersion(content: ContentPage): ContentPage {
  return {
    ...content,
    meta: {
      ...content.meta,
      version: content.meta.version + 1,
    },
  };
}
