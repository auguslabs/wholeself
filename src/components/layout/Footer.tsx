// Importar React para usar componentes funcionales
import React, { useState, useEffect, useCallback } from 'react';
import { getLocalizedText } from '@/data/models/ContentPage';
import { pathWithBase } from '@/utils/basePath';
import { getLocaleFromPathname, withLocalePath } from '@/utils/i18n';
import { getSharedContent } from '@/data/services/contentService';
import type { ContentPage } from '@/data/models/ContentPage';

const REFETCH_FOOTER_MS = 60_000;

/**
 * Props del componente Footer
 */
interface FooterProps {
  footerData: ContentPage;
  language?: 'en' | 'es';
}

/**
 * Componente Footer - Layout
 * 
 * Pie de página de la aplicación con enlaces a todas las páginas principales.
 * Incluye Crisis Resources siempre visible para acceso rápido.
 * Contenido cargado desde la API (shared-footer).
 * 
 * Deriva el idioma de la URL en el cliente para que al cambiar de idioma (ej. /redesigned → /redesigned/es)
 * el footer se actualice aunque use transition:persist.
 *
 * En el cliente hace fetch a GET /api/content/shared-footer (misma lógica que Home:
 * al montar, cada 60 s y al volver a la pestaña) para mostrar siempre el contenido
 * actual de la BD; así los cambios del editor se ven sin hacer build.
 */
export function Footer({ footerData, language: initialLanguage = 'en' }: FooterProps) {
  const [language, setLanguage] = useState<'en' | 'es'>(initialLanguage);
  const [liveFooterData, setLiveFooterData] = useState<ContentPage | null>(null);

  const fetchFooter = useCallback(() => {
    getSharedContent('footer')
      .then((data) => {
        setLiveFooterData(data);
      })
      .catch((err) => {
        console.error('[Footer] Fetch footer FAILED — se muestra footerData del build/SSR. Error:', err?.message ?? err);
      });
  }, []);

  useEffect(() => {
    fetchFooter();
    const interval = setInterval(fetchFooter, REFETCH_FOOTER_MS);
    return () => clearInterval(interval);
  }, [fetchFooter]);

  useEffect(() => {
    const onFocus = () => fetchFooter();
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, [fetchFooter]);

  const data = liveFooterData ?? footerData;
  const content = data.content || {};
  const companyInfo = content.companyInfo || {};
  const navigation = content.navigation || {};
  const resources = content.resources || {};
  const resourcesItems = Array.isArray(resources.items) ? resources.items : [];
  const items = resourcesItems.filter((item: { label?: unknown }) => {
    const en = getLocalizedText((item as { label?: { en?: string; es?: string } })?.label, 'en');
    const es = getLocalizedText((item as { label?: { en?: string; es?: string } })?.label, 'es');
    return (en + es).trim() !== '';
  });
  // Fallbacks para títulos vacíos (API/BD pueden devolver ''): siempre mostrar "Navigation" y "Resources".
  const navSectionTitle = getLocalizedText(navigation.title, language) || (language === 'es' ? 'Navegación' : 'Navigation');
  const resourcesSectionTitle = getLocalizedText(resources.title, language) || (language === 'es' ? 'Recursos' : 'Resources');
  // Fallback para el 4.º recurso (Fellowship) cuando la API devuelve label "0" o vacío.
  const fellowshipLabel = language === 'es' ? 'Programa de Fellowship' : 'Fellowship Program';
  const copyright = content.copyright;

  useEffect(() => {
    const updateFromUrl = () => {
      if (typeof window === 'undefined') return;
      setLanguage(getLocaleFromPathname(window.location.pathname));
    };
    updateFromUrl();
    window.addEventListener('popstate', updateFromUrl);
    document.addEventListener('astro:page-load', updateFromUrl);
    return () => {
      window.removeEventListener('popstate', updateFromUrl);
      document.removeEventListener('astro:page-load', updateFromUrl);
    };
  }, []);

  const basePath = language === 'es' ? '/es' : '';
  const withLocale = (path: string) => pathWithBase(basePath ? `${basePath}${path}` : path);

  // Enlaces de navegación: desde API (navigation.items) o fallback hardcodeado
  const navItemsFromApi = Array.isArray(navigation.items) ? navigation.items : [];
  const defaultNavLinks = [
    { label: { en: 'Home', es: 'Inicio' }, href: pathWithBase(basePath ? `${basePath}/` : '/') },
    { label: { en: 'Services', es: 'Servicios' }, href: withLocale('/services') },
    { label: { en: 'What to Expect', es: 'Que Esperar' }, href: withLocale('/what-to-expect') },
    { label: { en: 'Rates', es: 'Tarifas' }, href: withLocale('/rates') },
    { label: { en: 'Team', es: 'Equipo' }, href: withLocale('/team') },
    { label: { en: 'Contact', es: 'Contacto' }, href: withLocale('/contact') },
  ];
  const navLinks = navItemsFromApi.length > 0
    ? navItemsFromApi.map((item: { label?: { en?: string; es?: string }; link?: string }) => {
        const link = typeof item.link === 'string' ? item.link : '';
        const href = link.startsWith('http') ? link : (link === '/' ? pathWithBase(basePath ? `${basePath}/` : '/') : withLocale(link));
        return { label: item.label ?? { en: '', es: '' }, href };
      })
    : defaultNavLinks;

  return (
    // Elemento footer principal con fondo blueGreen-300 (mismo que el header)
    <footer className="bg-blueGreen-300 text-gray-900">
      {/* Contenedor principal con ancho máximo y padding responsive */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Grid responsive: 1 columna en móvil, 3 columnas en desktop */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Primera columna: Información de la empresa */}
          <div>
            {/* Título de la sección con tamaño grande y negrita */}
            <h3 className="text-lg font-semibold mb-4 text-gray-900">
              {getLocalizedText(companyInfo.name, language)}
            </h3>
            {/* Texto descriptivo en gris oscuro */}
            <p className="text-gray-700">
              {getLocalizedText(companyInfo.tagline, language)}
            </p>
          </div>
          {/* Segunda columna: Enlaces de navegación */}
          <div>
            {/* Título de la sección de enlaces */}
            <h3 className="text-lg font-semibold mb-4 text-gray-900">
              {getLocalizedText(navigation.title, language)}
            </h3>
            {/* Lista de enlaces con espaciado vertical */}
            <ul className="space-y-2 text-gray-700">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <a 
                    href={link.href} 
                    data-astro-transition-scroll="false"
                    className="hover:text-gray-900 transition-colors"
                  >
                    {getLocalizedText(link.label, language)}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          {/* Tercera columna: Recursos importantes */}
          <div>
            {/* Título de la sección de recursos */}
            <h3 className="text-lg font-semibold mb-4 text-gray-900">
              {getLocalizedText(resources.title, language)}
            </h3>
            {/* Lista de recursos con espaciado vertical */}
            <ul className="space-y-2 text-gray-700">
              {items.map((item: any) => {
                const link = typeof item.link === 'string' ? item.link : getLocalizedText(item.link, language);
                const labelStr = getLocalizedText(item.label, language);
                // Crisis Resources siempre abre el modal (por diseño). Si la BD tiene link=/crisis-resources e isModal=0, evitar 404 tratándolo como modal por etiqueta.
                const isCrisisByLabel = /crisis|recursos de crisis/i.test(labelStr);
                const isCrisisModal =
                  isCrisisByLabel ||
                  (Boolean(item.isModal) && (link === '#' || link === '' || (typeof link === 'string' && link.toLowerCase().includes('crisis'))));
                if (isCrisisModal) {
                  return (
                    <li key="crisis-resources" data-float-stop="crisis">
                      <button
                        onClick={() => {
                          const event = new CustomEvent('openCrisisModal');
                          window.dispatchEvent(event);
                        }}
                        className="hover:text-gray-900 transition-colors text-left"
                      >
                        {labelStr}
                      </button>
                    </li>
                  );
                }
                // Enlace normal (Fellowship, Immigration, Client Portal, etc.)
                const isExternal = typeof link === 'string' && link.startsWith('http');
                const resolvedLink = withLocalePath(link, language);
                return (
                  <li key={link || labelStr} data-float-stop={link === '/fellowship' ? 'fellowship' : undefined}>
                    <a 
                      href={resolvedLink} 
                      data-astro-transition-scroll="false"
                      target={isExternal ? "_blank" : undefined}
                      rel={isExternal ? "noopener noreferrer" : undefined}
                      className="hover:text-gray-900 transition-colors"
                    >
                      {labelStr}
                    </a>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
        {/* Sección de copyright con borde superior y texto centrado */}
        <div className="mt-8 pt-8 border-t border-gray-600 text-center text-gray-700">
          {/* Móvil: layout en tres líneas */}
          <div className="md:hidden flex flex-col items-center gap-2">
            <span>
              &copy; {new Date().getFullYear()} {getLocalizedText(companyInfo.name, language)}
            </span>
            <span className="inline-flex items-center gap-1">
              {getLocalizedText(copyright, language)}
            </span>
            <span className="inline-flex items-center gap-1 text-white">
              Powered
              <svg className="w-3.5 h-3.5" style={{ color: '#07549B' }} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12 21s-7-4.35-9.33-8.11C1.4 10.72 2 7.86 4.22 6.38A5.2 5.2 0 0 1 12 8.12a5.2 5.2 0 0 1 7.78-1.74c2.22 1.48 2.82 4.34 1.55 6.51C19 16.65 12 21 12 21z" />
              </svg>
              by
              <a
                href="https://www.auguslabs.com"
                target="_blank"
                rel="noopener noreferrer"
                className="underline text-white"
              >
                AugusLabs
              </a>
            </span>
          </div>
          {/* Desktop: layout actual */}
          <div className="hidden md:flex flex-col items-center justify-center gap-2">
            <div className="flex flex-row items-center justify-center gap-2">
              <span>
                &copy; {new Date().getFullYear()} {getLocalizedText(companyInfo.name, language)}. {getLocalizedText(copyright, language)}
              </span>
            </div>
            <div className="inline-flex items-center gap-1 text-white">
              Powered
              <svg className="w-3.5 h-3.5" style={{ color: '#07549B' }} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12 21s-7-4.35-9.33-8.11C1.4 10.72 2 7.86 4.22 6.38A5.2 5.2 0 0 1 12 8.12a5.2 5.2 0 0 1 7.78-1.74c2.22 1.48 2.82 4.34 1.55 6.51C19 16.65 12 21 12 21z" />
              </svg>
              by
              <a
                href="https://www.auguslabs.com"
                target="_blank"
                rel="noopener noreferrer"
                className="underline text-white"
              >
                AugusLabs
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

