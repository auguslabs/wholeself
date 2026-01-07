/**
 * Sistema de Versiones - Version History
 * 
 * Gestiona el historial de versiones de archivos JSON.
 * Permite guardar versiones anteriores, hacer rollback y mostrar diffs.
 * 
 * ⚠️ SOLO PARA SERVIDOR - NO USAR EN CLIENTE
 * Este módulo usa APIs de Node.js (fs/promises) que no están disponibles en el navegador.
 * Vite debe externalizar estos módulos para que no se incluyan en el bundle del cliente.
 */

import type { ContentPage } from '../models/ContentPage';
import { readFile, writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import { join } from 'path';

/**
 * Configuración del sistema de versiones
 */
const VERSION_HISTORY_DIR = join(process.cwd(), '.content-history');
const MAX_VERSIONS_PER_FILE = 50; // Mantener máximo 50 versiones por archivo

/**
 * Estructura de una entrada en el historial
 */
export interface VersionEntry {
  version: number;
  timestamp: string;
  pageId: string;
  content: ContentPage;
  author?: string;
  comment?: string;
}

/**
 * Historial completo de un archivo
 */
export interface VersionHistory {
  pageId: string;
  versions: VersionEntry[];
  currentVersion: number;
}

/**
 * Asegura que el directorio de historial existe
 */
async function ensureHistoryDir(): Promise<void> {
  if (!existsSync(VERSION_HISTORY_DIR)) {
    await mkdir(VERSION_HISTORY_DIR, { recursive: true });
  }
}

/**
 * Obtiene la ruta del archivo de historial para una página
 */
function getHistoryFilePath(pageId: string): string {
  return join(VERSION_HISTORY_DIR, `${pageId}.history.json`);
}

/**
 * Guarda una versión en el historial
 * 
 * @param pageId Identificador de la página
 * @param content Contenido a guardar
 * @param author Autor del cambio (opcional)
 * @param comment Comentario del cambio (opcional)
 * @returns Versión guardada
 */
export async function saveVersion(
  pageId: string,
  content: ContentPage,
  author?: string,
  comment?: string
): Promise<VersionEntry> {
  await ensureHistoryDir();
  
  const historyPath = getHistoryFilePath(pageId);
  let history: VersionHistory;
  
  // Cargar historial existente o crear uno nuevo
  if (existsSync(historyPath)) {
    const historyData = await readFile(historyPath, 'utf-8');
    history = JSON.parse(historyData);
  } else {
    history = {
      pageId,
      versions: [],
      currentVersion: 0,
    };
  }
  
  // Crear nueva entrada de versión
  const versionEntry: VersionEntry = {
    version: content.meta.version,
    timestamp: content.meta.lastUpdated,
    pageId,
    content: JSON.parse(JSON.stringify(content)), // Deep copy
    author,
    comment,
  };
  
  // Agregar al historial
  history.versions.push(versionEntry);
  history.currentVersion = content.meta.version;
  
  // Limpiar versiones antiguas si excede el límite
  if (history.versions.length > MAX_VERSIONS_PER_FILE) {
    // Mantener las versiones más recientes
    history.versions = history.versions
      .sort((a, b) => b.version - a.version)
      .slice(0, MAX_VERSIONS_PER_FILE)
      .sort((a, b) => a.version - b.version);
  }
  
  // Guardar historial
  await writeFile(historyPath, JSON.stringify(history, null, 2), 'utf-8');
  
  return versionEntry;
}

/**
 * Obtiene el historial completo de una página
 * 
 * @param pageId Identificador de la página
 * @returns Historial de versiones
 */
export async function getVersionHistory(pageId: string): Promise<VersionHistory | null> {
  const historyPath = getHistoryFilePath(pageId);
  
  if (!existsSync(historyPath)) {
    return null;
  }
  
  const historyData = await readFile(historyPath, 'utf-8');
  return JSON.parse(historyData);
}

/**
 * Obtiene una versión específica del historial
 * 
 * @param pageId Identificador de la página
 * @param version Número de versión
 * @returns Entrada de versión o null
 */
export async function getVersion(
  pageId: string,
  version: number
): Promise<VersionEntry | null> {
  const history = await getVersionHistory(pageId);
  
  if (!history) {
    return null;
  }
  
  return history.versions.find(v => v.version === version) || null;
}

/**
 * Obtiene la versión más reciente del historial
 * 
 * @param pageId Identificador de la página
 * @returns Entrada de versión o null
 */
export async function getLatestVersion(pageId: string): Promise<VersionEntry | null> {
  const history = await getVersionHistory(pageId);
  
  if (!history || history.versions.length === 0) {
    return null;
  }
  
  return history.versions[history.versions.length - 1];
}

/**
 * Calcula el diff entre dos versiones
 * 
 * @param pageId Identificador de la página
 * @param version1 Versión inicial
 * @param version2 Versión final
 * @returns Objeto con cambios detectados
 */
export async function getVersionDiff(
  pageId: string,
  version1: number,
  version2: number
): Promise<{
  added: string[];
  removed: string[];
  modified: string[];
  fromVersion: number;
  toVersion: number;
} | null> {
  const v1 = await getVersion(pageId, version1);
  const v2 = await getVersion(pageId, version2);
  
  if (!v1 || !v2) {
    return null;
  }
  
  // Comparación simple de campos (puede mejorarse con librería de diff)
  const added: string[] = [];
  const removed: string[] = [];
  const modified: string[] = [];
  
  // Comparar estructura básica
  const compareObjects = (obj1: any, obj2: any, path: string = ''): void => {
    const keys1 = Object.keys(obj1);
    const keys2 = Object.keys(obj2);
    
    // Encontrar claves agregadas
    keys2.forEach(key => {
      if (!keys1.includes(key)) {
        added.push(path ? `${path}.${key}` : key);
      }
    });
    
    // Encontrar claves removidas
    keys1.forEach(key => {
      if (!keys2.includes(key)) {
        removed.push(path ? `${path}.${key}` : key);
      }
    });
    
    // Comparar valores
    keys1.forEach(key => {
      if (keys2.includes(key)) {
        const newPath = path ? `${path}.${key}` : key;
        const val1 = obj1[key];
        const val2 = obj2[key];
        
        if (typeof val1 === 'object' && typeof val2 === 'object' && val1 !== null && val2 !== null) {
          if (Array.isArray(val1) && Array.isArray(val2)) {
            if (JSON.stringify(val1) !== JSON.stringify(val2)) {
              modified.push(newPath);
            }
          } else {
            compareObjects(val1, val2, newPath);
          }
        } else if (val1 !== val2) {
          modified.push(newPath);
        }
      }
    });
  };
  
  compareObjects(v1.content, v2.content);
  
  return {
    added,
    removed,
    modified,
    fromVersion: version1,
    toVersion: version2,
  };
}

/**
 * Lista todas las páginas con historial
 * 
 * @returns Array de pageIds con historial
 */
export async function listPagesWithHistory(): Promise<string[]> {
  await ensureHistoryDir();
  
  if (!existsSync(VERSION_HISTORY_DIR)) {
    return [];
  }
  
  // En un entorno real, leería los archivos del directorio
  // Por ahora retornamos un array vacío
  // Esto requeriría importar 'fs' adicional o usar glob
  return [];
}
