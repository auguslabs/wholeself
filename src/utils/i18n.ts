import { getBasePath, pathWithBase } from './basePath';

export type SupportedLocale = 'en' | 'es';

export const supportedLocales: SupportedLocale[] = ['en', 'es'];
export const defaultLocale: SupportedLocale = 'en';

export function getLocaleFromPath(pathname: string): SupportedLocale {
  const trimmed = pathname.replace(/^\/+/, '');
  const firstSegment = trimmed.split('/')[0];

  if (supportedLocales.includes(firstSegment as SupportedLocale)) {
    return firstSegment as SupportedLocale;
  }

  return defaultLocale;
}

/**
 * Obtiene el idioma desde el pathname completo (incluye base, ej. /redesigned/es/rates).
 * Quita el base path antes de detectar el locale para que funcione en deploy en subcarpeta.
 */
export function getLocaleFromPathname(pathname: string): SupportedLocale {
  const base = getBasePath();
  const pathWithoutBase = base
    ? (pathname.replace(new RegExp('^' + base.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')), '') || '/')
    : pathname;
  return getLocaleFromPath(pathWithoutBase);
}

export function withLocalePath(path: string, locale: SupportedLocale): string {
  if (!path || path.startsWith('#')) {
    return path;
  }

  if (
    path.startsWith('http://') ||
    path.startsWith('https://') ||
    path.startsWith('mailto:') ||
    path.startsWith('tel:')
  ) {
    return path;
  }

  let result = path;
  if (locale === 'es') {
    if (path === '/es' || path.startsWith('/es/')) {
      result = path;
    } else if (path.startsWith('/')) {
      result = `/es${path}`;
    }
  }

  return pathWithBase(result);
}
