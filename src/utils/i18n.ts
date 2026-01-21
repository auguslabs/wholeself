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

  if (locale === 'es') {
    if (path === '/es' || path.startsWith('/es/')) {
      return path;
    }
    if (path.startsWith('/')) {
      return `/es${path}`;
    }
  }

  return path;
}
