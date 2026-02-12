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

function getBaseUrl(): string {
  if (typeof window === 'undefined') return '';
  const base = (import.meta.env?.BASE_URL || '/').replace(/\/$/, '') || '';
  return base;
}

const REFETCH_INTERVAL_MS = 60_000;

export default function HomeContentFromApi({ pageId = 'home', lang, initialData }: HomeContentFromApiProps) {
  const [content, setContent] = useState<ContentPageWithUpdated | null>(initialData);
  const [error, setError] = useState<string | null>(null);

  const fetchContent = useCallback(() => {
    const base = getBaseUrl();
    const url = `${base}/api/content/${encodeURIComponent(pageId)}?locale=${lang}`;
    fetch(url)
      .then((res) => {
        if (!res.ok) throw new Error(`Failed to load content: ${res.status}`);
        return res.json();
      })
      .then((data: ContentPageWithUpdated) => setContent(data))
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

  if (error) {
    return (
      <div className="py-12 px-4 text-center text-gray-600">
        <p>No se pudo cargar el contenido. ({error})</p>
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
  const heroBg = getLocalizedText((hero as any).backgroundImage, lang);
  const baseUrl = getBaseUrl();
  const imagePath = heroBg ? `${baseUrl ? baseUrl + '/' : ''}${String(heroBg).replace(/^\//, '')}` : '';
  const updatedAt = (content as ContentPageWithUpdated).updatedAt;
  const heroImageSrc = imagePath
    ? (updatedAt ? `${imagePath}${imagePath.includes('?') ? '&' : '?'}v=${encodeURIComponent(updatedAt)}` : imagePath)
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
            {getLocalizedText((hero as any).headline, lang)}
          </h1>
          <p className="text-lg md:text-xl text-white mb-8 text-center max-w-3xl">
            {getLocalizedText((hero as any).description, lang)}
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
