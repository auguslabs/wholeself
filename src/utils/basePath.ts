/**
 * Base path para deploy en subcarpeta (ej. /redesigned/ en Bluehost).
 * Usar en enlaces y assets para que funcionen cuando base !== '/'.
 */
const BASE = (typeof import.meta !== 'undefined' && import.meta.env?.BASE_URL) || '';

/** Base sin barra final, ej. '' o '/redesigned' */
export function getBasePath(): string {
  return BASE ? BASE.replace(/\/$/, '') : '';
}

/** Devuelve la ruta con el base path prepuesto. Ej: pathWithBase('/team') → '/redesigned/team' */
export function pathWithBase(path: string): string {
  const base = getBasePath();
  if (!base) return path;
  return base + (path.startsWith('/') ? path : `/${path}`);
}
