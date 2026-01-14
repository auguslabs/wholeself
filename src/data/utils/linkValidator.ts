/**
 * Validación de Referencias - Link Validator
 * 
 * Valida que los links y rutas en el contenido existan y sean válidos.
 */

import type { ContentPage } from '../models/ContentPage';

/**
 * Resultado de validación de links
 */
export interface LinkValidationResult {
  valid: boolean;
  invalidLinks: Array<{
    path: string;
    link: string;
    reason: string;
  }>;
  validLinks: string[];
}

/**
 * Rutas válidas en la aplicación
 * Puede expandirse para incluir todas las rutas dinámicas
 */
const VALID_ROUTES = new Set([
  '/',
  '/home',
  '/services',
  '/services/anxiety',
  '/services/adhd',
  '/services/depression',
  '/services/bipolar',
  '/services/trauma',
  '/services/stress',
  '/services/identity',
  '/services/immigration-evaluations',
  '/rates',
  '/what-to-expect',
  '/contact',
  '/contact/i-need-help',
  '/contact/loved-one-needs-help',
  '/contact/referral',
  '/about',
  '/crisis-resources',
  '/team',
]);

/**
 * Prefijos de rutas válidos (para rutas dinámicas)
 */
const VALID_ROUTE_PREFIXES = [
  '/services/',
  '/contact/',
];

/**
 * Valida si una ruta existe
 * 
 * @param route Ruta a validar
 * @returns true si la ruta es válida
 */
function routeExists(route: string): boolean {
  // Normalizar ruta
  const normalizedRoute = route.split('?')[0].split('#')[0]; // Remover query params y hash
  
  // Verificar ruta exacta
  if (VALID_ROUTES.has(normalizedRoute)) {
    return true;
  }
  
  // Verificar prefijos válidos
  for (const prefix of VALID_ROUTE_PREFIXES) {
    if (normalizedRoute.startsWith(prefix)) {
      return true;
    }
  }
  
  return false;
}

/**
 * Valida si una URL externa es válida
 * 
 * @param url URL a validar
 * @returns true si la URL es válida
 */
function isValidExternalUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    // Verificar que tenga protocolo válido
    return ['http:', 'https:', 'mailto:'].includes(parsed.protocol);
  } catch {
    return false;
  }
}

/**
 * Extrae todos los links de un objeto de contenido
 * 
 * @param obj Objeto a analizar
 * @param path Ruta actual en el objeto (para reportar errores)
 * @returns Array de links encontrados con sus rutas
 */
function extractLinks(obj: any, path: string = ''): Array<{ path: string; link: string }> {
  const links: Array<{ path: string; link: string }> = [];
  
  if (obj === null || obj === undefined) {
    return links;
  }
  
  if (typeof obj === 'string') {
    // Buscar URLs en strings
    const urlRegex = /(https?:\/\/[^\s]+|mailto:[^\s]+)/g;
    const matches = obj.match(urlRegex);
    if (matches) {
      matches.forEach(match => links.push({ path, link: match }));
    }
    return links;
  }
  
  if (Array.isArray(obj)) {
    obj.forEach((item, index) => {
      links.push(...extractLinks(item, path ? `${path}[${index}]` : `[${index}]`));
    });
    return links;
  }
  
  if (typeof obj === 'object') {
    Object.keys(obj).forEach(key => {
      const newPath = path ? `${path}.${key}` : key;
      const value = obj[key];
      
      // Si la clave es 'link', 'href', 'url', etc., es probablemente un link
      if (['link', 'href', 'url', 'src'].includes(key.toLowerCase()) && typeof value === 'string') {
        links.push({ path: newPath, link: value });
      } else {
        links.push(...extractLinks(value, newPath));
      }
    });
  }
  
  return links;
}

/**
 * Valida todos los links en un ContentPage
 * 
 * @param content ContentPage a validar
 * @returns Resultado de validación
 */
export function validateLinks(content: ContentPage): LinkValidationResult {
  const links = extractLinks(content);
  const invalidLinks: LinkValidationResult['invalidLinks'] = [];
  const validLinks: string[] = [];
  
  links.forEach(({ path, link }) => {
    // Verificar si es URL externa
    if (link.startsWith('http://') || link.startsWith('https://') || link.startsWith('mailto:')) {
      if (isValidExternalUrl(link)) {
        validLinks.push(link);
      } else {
        invalidLinks.push({
          path,
          link,
          reason: 'URL externa inválida',
        });
      }
    }
    // Verificar si es ruta interna
    else if (link.startsWith('/')) {
      if (routeExists(link)) {
        validLinks.push(link);
      } else {
        invalidLinks.push({
          path,
          link,
          reason: 'Ruta interna no encontrada',
        });
      }
    }
    // Links relativos (sin /)
    else if (!link.includes('://')) {
      // Asumir que es válido si no tiene protocolo
      validLinks.push(link);
    }
    // Otros casos
    else {
      invalidLinks.push({
        path,
        link,
        reason: 'Formato de link desconocido',
      });
    }
  });
  
  return {
    valid: invalidLinks.length === 0,
    invalidLinks,
    validLinks,
  };
}

/**
 * Valida links en un objeto específico (no ContentPage completo)
 * 
 * @param obj Objeto a validar
 * @param objPath Ruta del objeto en el ContentPage (para reportar errores)
 * @returns Resultado de validación
 */
export function validateLinksInObject(
  obj: any,
  objPath: string = 'content'
): LinkValidationResult {
  const links = extractLinks(obj, objPath);
  const invalidLinks: LinkValidationResult['invalidLinks'] = [];
  const validLinks: string[] = [];
  
  links.forEach(({ path, link }) => {
    if (link.startsWith('http://') || link.startsWith('https://') || link.startsWith('mailto:')) {
      if (isValidExternalUrl(link)) {
        validLinks.push(link);
      } else {
        invalidLinks.push({
          path,
          link,
          reason: 'URL externa inválida',
        });
      }
    } else if (link.startsWith('/')) {
      if (routeExists(link)) {
        validLinks.push(link);
      } else {
        invalidLinks.push({
          path,
          link,
          reason: 'Ruta interna no encontrada',
        });
      }
    } else if (!link.includes('://')) {
      validLinks.push(link);
    } else {
      invalidLinks.push({
        path,
        link,
        reason: 'Formato de link desconocido',
      });
    }
  });
  
  return {
    valid: invalidLinks.length === 0,
    invalidLinks,
    validLinks,
  };
}

/**
 * Agrega una ruta válida al conjunto de rutas conocidas
 * Útil para rutas dinámicas descubiertas en tiempo de ejecución
 * 
 * @param route Ruta a agregar
 */
export function addValidRoute(route: string): void {
  VALID_ROUTES.add(route);
}

/**
 * Obtiene todas las rutas válidas conocidas
 * 
 * @returns Array de rutas válidas
 */
export function getValidRoutes(): string[] {
  return Array.from(VALID_ROUTES);
}
