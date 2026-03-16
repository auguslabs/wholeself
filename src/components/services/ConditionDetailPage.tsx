/**
 * ConditionDetailPage - Página de detalle de una condición, cargada desde la API en el cliente.
 * Evita depender del build: no hay redirect en el HTML; los datos vienen de GET /api/content/services.
 */

import React, { useState, useEffect } from 'react';
import { getPageContent } from '@/data/services/contentService';
import { getLocalizedText } from '@/data/models/ContentPage';
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

interface ConditionDetailPageProps {
  slug: string;
  language: 'en' | 'es';
}

export default function ConditionDetailPage({ slug, language }: ConditionDetailPageProps) {
  const [condition, setCondition] = useState<Condition | null>(null);
  const [conditions, setConditions] = useState<Condition[]>([]);
  const [ctaSection, setCtaSection] = useState<{
    title: LocalizedText;
    subtitle: LocalizedText;
    primaryCTAs?: Array<{ id: string; title: LocalizedText; link: string; color: string }>;
    secondaryCTA?: { id: string; title: LocalizedText; link: string; text: LocalizedText } | null;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setNotFound(false);
    getPageContent('services', language)
      .then((data) => {
        if (cancelled) return;
        const section = (data.content as Record<string, unknown>)?.conditionsSection as { conditions?: Condition[] } | undefined;
        const list = section?.conditions ?? [];
        const current = list.find((c: Condition) => c.id === slug);
        const cta = (data.content as Record<string, unknown>)?.ctaSection as typeof ctaSection;
        setConditions(list);
        setCtaSection(cta ?? null);
        if (!current) {
          setNotFound(true);
          setCondition(null);
        } else {
          setCondition(current);
        }
      })
      .catch(() => {
        if (!cancelled) setNotFound(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [slug, language]);

  useEffect(() => {
    if (!notFound || loading) return;
    const base = language === 'es' ? '/es/services' : '/services';
    window.location.href = base;
  }, [notFound, loading, language]);

  if (loading) {
    return (
      <div className="min-h-[40vh] flex items-center justify-center">
        <p className="text-gray-600">{language === 'en' ? 'Loading…' : 'Cargando…'}</p>
      </div>
    );
  }

  if (notFound || !condition) {
    return null;
  }

  const detailTitle = getLocalizedText(condition.detailTitle ?? condition.name, language);
  const detailContent = getLocalizedText(condition.detailContent ?? '', language);
  const paragraphs = detailContent ? detailContent.split(/\n\n+/).filter(Boolean) : [];

  return (
    <>
      <section className="relative flex items-center justify-center min-h-[25vh] py-8 bg-blueGreen-300">
        <div className="container mx-auto max-w-4xl px-4 text-center">
          <div className="mb-3 inline-flex items-center justify-center w-12 h-12 rounded-full bg-white border-2 border-blueGreen-500">
            <div className="text-blueGreen-500">
              <ConditionIcon iconName={getLocalizedText(condition.icon, language)} className="w-6 h-6" />
            </div>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
            {getLocalizedText(condition.name, language)}
          </h1>
          <p className="text-base text-white/90 max-w-2xl mx-auto">
            {getLocalizedText(condition.description, language)}
          </p>
        </div>
      </section>

      <ConditionBreadcrumb conditionName={condition.name} language={language} />

      <section className="py-12 px-4 bg-white">
        <div className="container mx-auto max-w-4xl">
          <div className="prose prose-lg max-w-none mb-12">
            <h2 className="text-2xl font-bold text-navy-900 mb-4">{detailTitle}</h2>
            {paragraphs.length > 0 ? (
              paragraphs.map((p, i) => (
                <p key={i} className="text-gray-700 leading-relaxed mb-4">
                  {p}
                </p>
              ))
            ) : (
              <p className="text-gray-700 leading-relaxed">{detailContent || ''}</p>
            )}
          </div>

          <ConditionNavigation
            conditions={conditions}
            currentConditionId={condition.id}
            language={language}
          />

          {ctaSection && (
            <ServicesCTA
              title={ctaSection.title}
              subtitle={ctaSection.subtitle}
              primaryCTAs={ctaSection.primaryCTAs}
              secondaryCTA={ctaSection.secondaryCTA}
              language={language}
            />
          )}
        </div>
      </section>
    </>
  );
}
