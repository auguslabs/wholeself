/**
 * FellowshipContentFromApi - Contenido de la página Fellowship desde la API en el cliente.
 * Refetchea GET /api/content/fellowship para que los cambios del editor se vean en vivo.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { getPageContent } from '@/data/services/contentService';
import type { ContentPage } from '@/data/models/ContentPage';
import { getLocalizedText } from '@/data/models/ContentPage';
import ConditionIcon from '@/components/services/ConditionIcon';
import FellowshipContent from './FellowshipContent';

interface FellowshipContentFromApiProps {
  lang: 'en' | 'es';
  initialData: ContentPage | null;
}

const REFETCH_INTERVAL_MS = 60_000;

export default function FellowshipContentFromApi({ lang, initialData }: FellowshipContentFromApiProps) {
  const [content, setContent] = useState<ContentPage | null>(initialData);
  const [error, setError] = useState<string | null>(null);

  const fetchContent = useCallback(() => {
    getPageContent('fellowship', lang)
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

  const { hero, mission, benefits, programDetails, howToApply, footnote } = data.content;
  if (!mission || !benefits || !programDetails || !howToApply) return null;

  return (
    <>
      <section className="relative flex items-center justify-center min-h-[40vh] py-12 bg-brown-600">
        <div className="container mx-auto max-w-4xl px-4 text-center">
          {hero?.announcement != null && (
            <div className="mb-4 inline-flex items-center gap-2 bg-lightbrown-400 text-white px-4 py-2 rounded-full font-bold text-sm">
              <span>{getLocalizedText(hero.announcement, lang)}</span>
            </div>
          )}
          {hero?.icon != null && (
            <div className="mb-4 inline-flex items-center justify-center w-16 h-16 rounded-full bg-white border-4 border-brown-300">
              <div className="text-brown-600">
                <ConditionIcon iconName={getLocalizedText(hero.icon, lang)} className="w-8 h-8" />
              </div>
            </div>
          )}
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
            {hero?.title != null ? getLocalizedText(hero.title, lang) : ''}
          </h1>
          {hero?.subtitle != null && (
            <p className="text-xl md:text-2xl text-white/90 mb-4">
              {getLocalizedText(hero.subtitle, lang)}
            </p>
          )}
          {hero?.description != null && (
            <p className="text-base md:text-lg text-white/90 max-w-3xl mx-auto">
              {getLocalizedText(hero.description, lang)}
            </p>
          )}
        </div>
      </section>

      <section className="py-12 px-4 bg-gray-50">
        <FellowshipContent
          mission={mission}
          benefits={benefits}
          programDetails={programDetails}
          howToApply={howToApply}
          footnote={footnote ?? ''}
          language={lang}
        />
      </section>
    </>
  );
}
