/**
 * WhatToExpectContentFromApi - Contenido de la página What to Expect desde la API en el cliente.
 * Refetchea GET /api/content/what-to-expect para que los cambios del editor se vean en vivo.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { getPageContent } from '@/data/services/contentService';
import type { ContentPage } from '@/data/models/ContentPage';
import { getLocalizedText } from '@/data/models/ContentPage';
import WhatToExpectTimeline from './WhatToExpectTimeline';
import WhatToExpectCTA from './WhatToExpectCTA';

interface WhatToExpectContentFromApiProps {
  lang: 'en' | 'es';
  initialData: ContentPage | null;
}

const REFETCH_INTERVAL_MS = 60_000;

export default function WhatToExpectContentFromApi({ lang, initialData }: WhatToExpectContentFromApiProps) {
  const [content, setContent] = useState<ContentPage | null>(initialData);
  const [error, setError] = useState<string | null>(null);

  const fetchContent = useCallback(() => {
    getPageContent('what-to-expect', lang)
      .then((data) => {
        setContent(data);
        setError(null);
      })
      .catch((err) => setError(err?.message ?? 'Failed to load content'));
  }, [lang]);

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
      <div className="py-12 px-4 text-center text-gray-700 max-w-xl mx-auto">
        <p className="font-medium text-red-700 mb-2">No se pudo cargar el contenido.</p>
        <p className="text-sm text-gray-600">{error}</p>
      </div>
    );
  }

  const data = content ?? initialData;
  if (!data?.content) {
    return (
      <div className="py-12 px-4 text-center text-gray-500">
        <p>Cargando…</p>
      </div>
    );
  }

  const { hero, intro, sections, ctaSection } = data.content;

  return (
    <>
      <section id="what-to-expect-hero" className="relative flex items-center justify-center min-h-[50vh] py-16 bg-gradient-to-b from-blueGreen-50 to-white">
        <div className="container mx-auto max-w-4xl px-4 text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-navy-900 mb-4">
            {hero?.title != null ? getLocalizedText(hero.title, lang) : ''}
          </h1>
          {hero?.subtitle != null && (
            <p className="text-xl md:text-2xl text-gray-700">
              {getLocalizedText(hero.subtitle, lang)}
            </p>
          )}
        </div>
      </section>

      {intro?.text != null && (
        <section id="what-to-expect-intro" className="py-12 px-4 bg-white">
          <div className="container mx-auto max-w-4xl">
            <p className="text-lg md:text-xl text-gray-700 leading-relaxed text-center">
              {getLocalizedText(intro.text, lang)}
            </p>
          </div>
        </section>
      )}

      {sections && sections.length > 0 && (
        <WhatToExpectTimeline sections={sections} language={lang} />
      )}

      {ctaSection?.ctas != null && (
        <WhatToExpectCTA
          title={ctaSection.title}
          subtitle={ctaSection.subtitle}
          ctas={ctaSection.ctas}
          language={lang}
        />
      )}
    </>
  );
}
