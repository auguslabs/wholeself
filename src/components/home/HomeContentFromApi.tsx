/**
 * HomeContentFromApi - Contenido de la home cargado desde la API en el cliente.
 * Cuando PUBLIC_USE_CONTENT_FROM_BD está activo, este componente hace fetch a
 * GET /api/content/home para que los cambios guardados desde Augushub (incluida
 * la imagen del hero) se vean en el sitio en vivo. Re-consulta la API al cargar,
 * cada 60 s y al volver a la pestaña para detectar cambios y re-pintar.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { getLocalizedText } from '@/data/models/ContentPage';
import type { ContentPage } from '@/data/models/ContentPage';
import { getPageContent } from '@/data/services/contentService';
import { getLocaleFromPathname } from '@/utils/i18n';
import ValuePropositions from './ValuePropositions';
import CTASection from './CTASection';

interface HomeContentFromApiProps {
  pageId?: string;
  lang: 'en' | 'es';
  /** Datos iniciales (del build) para primera pintada; luego se reemplazan por la API. */
  initialData: ContentPage | null;
}

/** Respuesta de la API puede incluir updatedAt para cache busting de imágenes */
type ContentPageWithUpdated = ContentPage & { updatedAt?: string | null };

/** Origen del sitio para URLs absolutas (imagen hero). Evita que en /es/ la imagen se pida a /es/banner... (404). */
function getAssetOrigin(): string {
  if (typeof window === 'undefined') return '';
  return window.location.origin;
}

const REFETCH_INTERVAL_MS = 60_000;

export default function HomeContentFromApi({ pageId = 'home', lang: langProp, initialData }: HomeContentFromApiProps) {
  const [content, setContent] = useState<ContentPageWithUpdated | null>(initialData);
  const [error, setError] = useState<string | null>(null);
  /** Timestamp de la última vez que recibimos contenido de la API; se usa como cache buster para la imagen y forzar que el navegador pida la imagen de nuevo (no use caché vieja). */
  const [contentFetchedAt, setContentFetchedAt] = useState<number | null>(null);

  /** En cliente usar siempre el idioma de la URL para que en /es/ se muestre español aunque el prop venga mal por persist/hydration. */
  const lang =
    typeof window !== 'undefined'
      ? getLocaleFromPathname(window.location.pathname)
      : langProp;

  const fetchContent = useCallback(() => {
    getPageContent(pageId, lang)
      .then((data: ContentPageWithUpdated) => {
        setContentFetchedAt(Date.now());
        setContent(data);
        setError(null);
      })
      .catch((err) => setError(err?.message || 'Failed to load content'));
  }, [pageId, lang]);

  useEffect(() => {
    fetchContent();
    const interval = setInterval(fetchContent, REFETCH_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [fetchContent]);

  useEffect(() => {
    const onFocus = () => fetchContent();
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, [fetchContent]);

  // Si la API falló, mostrar el error siempre (así se ve el 500 u otro fallo)
  if (error) {
    return (
      <div className="py-12 px-4 text-center text-gray-700 max-w-xl mx-auto">
        <p className="font-medium text-red-700 mb-2">No se pudo cargar el contenido.</p>
        <p className="text-sm text-gray-600">{error}</p>
      </div>
    );
  }

  if (!content?.content) {
    return (
      <div className="py-12 px-4 text-center text-gray-500">
        <p>Cargando…</p>
      </div>
    );
  }

  const hero = content.content.hero || {};
  const heroHeadline = (hero as any).headline ?? (hero as any).title;
  const heroDescription = (hero as any).description;
  const heroBg = getLocalizedText((hero as any).backgroundImage, lang);
  const origin = getAssetOrigin();
  const rawPath = heroBg ? String(heroBg).replace(/^\//, '') : '';
  const imagePath = rawPath ? (origin ? `${origin}/${rawPath}` : `/${rawPath}`) : '';
  const cacheBuster = contentFetchedAt ?? content.meta?.lastUpdated ?? (content as ContentPageWithUpdated).updatedAt ?? '';
  const heroImageSrc = imagePath
    ? (cacheBuster ? `${imagePath}${imagePath.includes('?') ? '&' : '?'}v=${encodeURIComponent(String(cacheBuster))}` : imagePath)
    : '';

  return (
    <>
      <section id="home-hero" className="relative flex items-center justify-center min-h-[60vh] py-12 overflow-hidden">
        {heroImageSrc && (
          <img
            src={heroImageSrc}
            alt={getLocalizedText((hero as any).backgroundImageAlt, lang)}
            className="absolute inset-0 w-full h-full object-cover object-center"
          />
        )}
        <div className="relative z-10 flex flex-col items-center justify-center w-full max-w-4xl mx-auto px-4">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 text-center">
            {getLocalizedText(heroHeadline, lang)}
          </h1>
          <p className="text-lg md:text-xl text-white mb-8 text-center max-w-3xl">
            {getLocalizedText(heroDescription, lang)}
          </p>
        </div>
      </section>

      {content.content.valuePropositions?.items && (
        <ValuePropositions items={content.content.valuePropositions.items} language={lang} />
      )}

      {content.content.ctaSection && (
        <CTASection ctaSection={content.content.ctaSection} lang={lang} />
      )}
    </>
  );
}
