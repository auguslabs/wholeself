/**
 * Immigration Evaluations content from API/BD.
 * Refetches GET /api/content/immigration-evaluations so editor changes appear live.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { getPageContent } from '@/data/services/contentService';
import { getLocalizedText } from '@/data/models/ContentPage';
import type { ContentPage } from '@/data/models/ContentPage';
import Breadcrumb from '@/components/common/Breadcrumb';
import FAQAccordion from '@/components/services/FAQAccordion';
import { withLocalePath } from '@/utils/i18n';
import { DocumentTextIcon } from '@heroicons/react/24/outline';

const REFETCH_INTERVAL_MS = 60_000;

interface ImmigrationEvaluationsContentFromApiProps {
  lang: 'en' | 'es';
  initialData: ContentPage | null;
}

export default function ImmigrationEvaluationsContentFromApi({ lang, initialData }: ImmigrationEvaluationsContentFromApiProps) {
  const [data, setData] = useState<ContentPage | null>(initialData);
  const [error, setError] = useState<string | null>(null);

  const fetchContent = useCallback(() => {
    getPageContent('immigration-evaluations', lang)
      .then((res) => {
        setData(res);
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

  const content = (data ?? initialData)?.content;
  if (error) {
    return (
      <div className="py-12 px-4 text-center text-gray-700 max-w-xl mx-auto">
        <p className="font-medium text-red-700 mb-2">No se pudo cargar el contenido.</p>
        <p className="text-sm text-gray-600">{error}</p>
      </div>
    );
  }
  if (!content?.hero || !content?.intro) {
    return (
      <div className="py-12 px-4 text-center text-gray-500">
        <p>Cargando…</p>
      </div>
    );
  }

  const hero = content.hero as { title?: { en?: string; es?: string }; description?: { en?: string; es?: string } };
  const intro = content.intro as { text?: { en?: string; es?: string } };
  const specializations = (content.specializations as Array<{ id?: string; title?: { en?: string; es?: string }; description?: { en?: string; es?: string } }>) ?? [];
  const faqRaw = (content.faq as Array<{ question?: { en?: string; es?: string }; answer?: { en?: string; es?: string }; paragraphs?: Array<{ en?: string; es?: string }>; isSource?: boolean }>) ?? [];
  const cta = content.cta as { title?: { en?: string; es?: string }; subtitle?: { en?: string; es?: string }; buttonText?: { en?: string; es?: string } } | undefined;

  const faqItems = faqRaw.map((item) => ({
    question: getLocalizedText(item.question, lang),
    answer: getLocalizedText(item.answer, lang) || '',
    paragraphs: item.paragraphs?.map((p) => getLocalizedText(p, lang)) ?? undefined,
    isSource: item.isSource,
  }));

  return (
    <>
      <section className="relative flex items-center justify-center min-h-[50vh] py-16 bg-navy-600">
        <div className="container mx-auto max-w-4xl px-4 text-center">
          <div className="mb-6 inline-flex items-center justify-center w-20 h-20 rounded-full bg-white border-4 border-navy-500">
            <DocumentTextIcon className="w-10 h-10 text-navy-600" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            {getLocalizedText(hero.title, lang)}
          </h1>
          <p className="text-xl text-white/90 max-w-3xl mx-auto">
            {getLocalizedText(hero.description, lang)}
          </p>
        </div>
      </section>

      <Breadcrumb
        items={[
          { label: lang === 'en' ? 'Services' : 'Servicios', href: withLocalePath('/services', lang) },
          { label: getLocalizedText(hero.title, lang) },
        ]}
        language={lang}
        backHref={withLocalePath('/services', lang)}
        backText={lang === 'en' ? 'Back to Services' : 'Volver a Servicios'}
      />

      <section className="py-12 px-4 bg-white">
        <div className="container mx-auto max-w-4xl">
          <div className="prose prose-lg max-w-none mb-12">
            <p className="text-gray-700 leading-relaxed text-lg mb-8">
              {getLocalizedText(intro.text, lang)}
            </p>

            <h2 className="text-3xl font-bold text-navy-900 mb-6">
              {lang === 'en' ? 'We Specialize In' : 'Nos Especializamos En'}
            </h2>
            <div className="space-y-6 mb-12">
              {specializations.map((spec) => (
                <div key={spec.id || getLocalizedText(spec.title, lang)} className="bg-navy-50 border-l-4 border-navy-600 p-6 rounded-r-lg">
                  <h3 className="text-xl font-bold text-navy-900 mb-2">
                    {getLocalizedText(spec.title, lang)}
                  </h3>
                  <p className="text-gray-700">
                    {getLocalizedText(spec.description, lang)}
                  </p>
                </div>
              ))}
            </div>

            <h2 className="text-3xl font-bold text-navy-900 mb-6">
              {lang === 'en' ? 'Frequently Asked Questions' : 'Preguntas Frecuentes'}
            </h2>
            <FAQAccordion items={faqItems} />
          </div>

          {cta && (
            <section className="py-16 px-4 bg-gray-50 mt-12">
              <div className="container mx-auto max-w-4xl">
                <div className="text-center mb-8">
                  <h2 className="text-3xl md:text-4xl font-bold text-navy-900 mb-4">
                    {getLocalizedText(cta.title, lang)}
                  </h2>
                  <p className="text-lg text-gray-700 mb-8">
                    {getLocalizedText(cta.subtitle, lang)}
                  </p>
                  <a
                    href={withLocalePath('/contact', lang)}
                    className="inline-block bg-navy-600 hover:bg-navy-700 text-white font-semibold py-4 px-8 rounded-lg transition-colors duration-300 shadow-md hover:shadow-lg"
                  >
                    {getLocalizedText(cta.buttonText, lang)}
                  </a>
                </div>
              </div>
            </section>
          )}
        </div>
      </section>
    </>
  );
}
