/**
 * Hero de página que fetchea contenido desde la API para que la imagen del banner
 * se actualice al refrescar (mismo patrón que Home: cache buster con timestamp).
 * Usado en Services y Rates.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { getLocalizedText } from '@/data/models/ContentPage';

type PageId = 'services' | 'rates';

interface PageHeroFromApiProps {
  pageId: PageId;
  lang: 'en' | 'es';
  /** Datos iniciales del build para primera pintada */
  initialData: {
    content?: { hero?: { backgroundImage?: unknown; backgroundImageAlt?: unknown; title?: unknown; subtitle?: unknown } };
    meta?: { lastUpdated?: string };
  } | null;
}

function getBaseUrl(): string {
  if (typeof window === 'undefined') return '';
  const fromEnv = (import.meta.env?.PUBLIC_API_BASE || import.meta.env?.BASE_URL || '').toString().replace(/\/$/, '') || '';
  if (fromEnv) return fromEnv;
  return window.location.origin;
}

const sectionId: Record<PageId, string> = { services: 'services-hero', rates: 'rates-hero' };

export default function PageHeroFromApi({ pageId, lang, initialData }: PageHeroFromApiProps) {
  const [content, setContent] = useState(initialData);
  const [contentFetchedAt, setContentFetchedAt] = useState<number | null>(null);

  const fetchContent = useCallback(() => {
    const base = getBaseUrl();
    const url = `${base}/api/content/${pageId}?locale=${lang}`;
    fetch(url, { cache: 'no-store' })
      .then((res) => {
        if (!res.ok) throw new Error(`Failed to load content: ${res.status}`);
        return res.json();
      })
      .then((data: typeof initialData) => {
        setContentFetchedAt(Date.now());
        setContent(data);
      })
      .catch(() => { /* mantener initialData */ });
  }, [pageId, lang]);

  useEffect(() => {
    fetchContent();
  }, [fetchContent]);

  const hero = content?.content?.hero;
  if (!hero) return null;

  const heroBg = getLocalizedText(hero.backgroundImage as any, lang);
  const baseUrl = getBaseUrl();
  const imagePath = heroBg ? `${baseUrl ? baseUrl + '/' : ''}${String(heroBg).replace(/^\//, '')}` : '';
  const cacheBuster = contentFetchedAt ?? content?.meta?.lastUpdated ?? '';
  const heroImageSrc = imagePath && cacheBuster
    ? `${imagePath}${imagePath.includes('?') ? '&' : '?'}v=${encodeURIComponent(String(cacheBuster))}`
    : imagePath;

  const title = getLocalizedText(hero.title ?? (hero as any).headline, lang);
  const subtitle = getLocalizedText(hero.subtitle ?? (hero as any).description, lang);

  return (
    <section
      id={sectionId[pageId]}
      className="relative flex items-center justify-center min-h-[40vh] py-12 bg-cover bg-center bg-no-repeat"
      style={heroImageSrc ? { backgroundImage: `url('${heroImageSrc}')` } : undefined}
      aria-label={hero.backgroundImageAlt ? getLocalizedText(hero.backgroundImageAlt as any, lang) : undefined}
    >
      <div className="absolute inset-0 bg-blueGreen-500/90" />
      <div className="relative z-10 text-center max-w-4xl mx-auto px-4">
        <h1 className={pageId === 'rates' ? 'text-[1.584rem] md:text-[2.116rem] font-bold text-white mb-4' : 'text-4xl md:text-5xl font-bold text-white mb-4'}>
          {title}
        </h1>
        {subtitle && (
          <p className="text-xl text-white leading-relaxed">
            {subtitle}
          </p>
        )}
      </div>
    </section>
  );
}
