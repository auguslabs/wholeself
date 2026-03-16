/**
 * ConditionDetailFromApi
 * Carga la página de una condición desde la API cuando en el build no hubo datos (BD).
 * Evita el redirect estático: muestra contenido real al cargar desde GET /api/content/services.
 */

import React, { useState, useEffect } from 'react';
import { getPageContent } from '@/data/services/contentService';
import { getLocalizedText } from '@/data/models/ContentPage';
import type { ContentPage } from '@/data/models/ContentPage';
import type { LocalizedText } from '@/data/models/ContentPage';
import ConditionIcon from './ConditionIcon';
import ConditionBreadcrumb from './ConditionBreadcrumb';
import ConditionNavigation from './ConditionNavigation';
import ServicesCTA from './ServicesCTA';

interface Condition {
  id: string;
  name: LocalizedText;
  description: LocalizedText;
  icon: string;
  link: string;
  detailTitle?: LocalizedText;
  detailContent?: LocalizedText;
}

interface ConditionDetailFromApiProps {
  slug: string;
  language: 'en' | 'es';
}

export default function ConditionDetailFromApi({ slug, language }: ConditionDetailFromApiProps) {
  const [data, setData] = useState<ContentPage | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getPageContent('services', language)
      .then(setData)
      .catch((err) => setError(err?.message ?? 'Failed to load'));
  }, [language]);

  useEffect(() => {
    if (!data) return;
    const conditions = (data.content as Record<string, unknown>)?.conditionsSection as { conditions?: Condition[] } | undefined;
    const list = conditions?.conditions ?? [];
    const current = list.find((c: Condition) => c.id === slug);
    if (!current) {
      window.location.href = language === 'es' ? '/es/services' : '/services';
    }
  }, [data, slug, language]);

  if (error) {
    return (
      <div className="py-12 px-4 text-center text-gray-700">
        <p className="font-medium text-red-700 mb-2">No se pudo cargar el contenido.</p>
        <p className="text-sm">{error}</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="py-12 px-4 text-center text-gray-500">
        <p>Cargando…</p>
      </div>
    );
  }

  const content = data.content as Record<string, unknown>;
  const conditionsSection = content.conditionsSection as { conditions?: Condition[] } | undefined;
  const conditions = conditionsSection?.conditions ?? [];
  const currentCondition = conditions.find((c: Condition) => c.id === slug);

  if (!currentCondition) {
    return null;
  }

  const ctaSection = content.ctaSection as {
    title?: LocalizedText;
    subtitle?: LocalizedText;
    primaryCTAs?: Array<{ id: string; title: LocalizedText; link: string; color: string }>;
    secondaryCTA?: { id: string; title: LocalizedText; link: string; text: LocalizedText } | null;
  } | undefined;
  const detailTitle = currentCondition.detailTitle ?? { en: '', es: '' };
  const detailContent = currentCondition.detailContent ?? { en: '', es: '' };

  return (
    <>
      <section className="relative flex items-center justify-center min-h-[25vh] py-8 bg-blueGreen-300">
        <div className="container mx-auto max-w-4xl px-4 text-center">
          <div className="mb-3 inline-flex items-center justify-center w-12 h-12 rounded-full bg-white border-2 border-blueGreen-500">
            <div className="text-blueGreen-500">
              <ConditionIcon iconName={currentCondition.icon} className="w-6 h-6" />
            </div>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
            {getLocalizedText(currentCondition.name, language)}
          </h1>
          <p className="text-base text-white/90 max-w-2xl mx-auto">
            {getLocalizedText(currentCondition.description, language)}
          </p>
        </div>
      </section>

      <ConditionBreadcrumb conditionName={currentCondition.name} language={language} />

      <section className="py-12 px-4 bg-white">
        <div className="container mx-auto max-w-4xl">
          <div className="prose prose-lg max-w-none mb-12">
            <h2 className="text-2xl font-bold text-navy-900 mb-4">
              {getLocalizedText(detailTitle, language)}
            </h2>
            <p className="text-gray-700 leading-relaxed whitespace-pre-line">
              {getLocalizedText(detailContent, language)}
            </p>
          </div>

          <ConditionNavigation
            conditions={conditions}
            currentConditionId={slug}
            language={language}
          />

          {ctaSection && (
            <ServicesCTA
              title={ctaSection.title ?? { en: '', es: '' }}
              subtitle={ctaSection.subtitle ?? { en: '', es: '' }}
              primaryCTAs={ctaSection.primaryCTAs ?? []}
              secondaryCTA={ctaSection.secondaryCTA ?? null}
              language={language}
            />
          )}
        </div>
      </section>
    </>
  );
}
