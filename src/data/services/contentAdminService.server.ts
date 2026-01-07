/**
 * Servicio de Administración de Contenido - Content Admin Service
 * 
 * Funciones de escritura y administración de contenido.
 * ⚠️ SOLO PARA SERVIDOR - NO USAR EN CLIENTE
 * 
 * El sufijo .server.ts asegura que Astro/Vite nunca intente incluir este módulo
 * en el bundle del cliente.
 */

import type { ContentPage } from '../models/ContentPage';

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
  
  // Importación dinámica del módulo .server.ts
  // El sufijo .server.ts asegura que nunca se incluya en el bundle del cliente
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
