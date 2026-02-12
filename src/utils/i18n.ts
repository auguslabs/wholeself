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

/** path puede ser string o objeto localizado { en?, es? } (p. ej. contenido desde BD). */
export function withLocalePath(
  path: string | { en?: string; es?: string },
  locale: SupportedLocale
): string {
  const s =
    typeof path === 'string'
      ? path
      : (path && (path[locale] ?? path.en ?? path.es)) ?? '';
  const str = typeof s === 'string' ? s : '';
  if (!str || str.startsWith('#')) {
    return str;
  }

  if (
    str.startsWith('http://') ||
    str.startsWith('https://') ||
    str.startsWith('mailto:') ||
    str.startsWith('tel:')
  ) {
    return str;
  }

  let result = str;
  if (locale === 'es') {
    if (str === '/es' || str.startsWith('/es/')) {
      result = str;
    } else if (str.startsWith('/')) {
      result = `/es${str}`;
    }
  }

  return pathWithBase(result);
}
