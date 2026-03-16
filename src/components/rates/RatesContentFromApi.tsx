/**
 * RatesContentFromApi - Contenido de la página Rates cargado desde la API en el cliente.
 * Refetchea GET /api/content/rates para que los cambios del editor se vean en vivo.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { getPageContent } from '@/data/services/contentService';
import type { ContentPage } from '@/data/models/ContentPage';
import PageHeroFromApi from '@/components/shared/PageHeroFromApi';
import PricingTable from './PricingTable';
import InsuranceCardWithModal from './InsuranceCardWithModal';
import RatesCard from './RatesCard';
import RatesFAQ from './RatesFAQ';
import RatesCTASection from './RatesCTASection';

interface RatesContentFromApiProps {
  lang: 'en' | 'es';
  initialData: ContentPage | null;
}

const REFETCH_INTERVAL_MS = 60_000;

export default function RatesContentFromApi({ lang, initialData }: RatesContentFromApiProps) {
  const [content, setContent] = useState<ContentPage | null>(initialData);
  const [error, setError] = useState<string | null>(null);

  const fetchContent = useCallback(() => {
    getPageContent('rates', lang)
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

  const { hero, pricing, insurance, paymentOptions, faq, ctaSection } = data.content;
  if (!pricing || !insurance || !paymentOptions || !faq || !ctaSection) return null;

  return (
    <>
      <PageHeroFromApi pageId="rates" lang={lang} initialData={data} />

      <PricingTable
        sessions={pricing.sessions}
        language={lang}
        title={pricing.title}
      />

      <section id="rates-cards" className="py-12 px-4 bg-gray-50">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
            <InsuranceCardWithModal
              title={insurance.title}
              description={insurance.description}
              icon="ShieldCheckIcon"
              language={lang}
              items={insurance.providers}
              providerList={insurance.providerList}
              modal={insurance.modal}
              colorClass="border-blueGreen-500"
            />
            <RatesCard
              title={paymentOptions.title}
              description={paymentOptions.description}
              icon="CreditCardIcon"
              language={lang}
              items={paymentOptions.options}
              colorClass="border-navy-500"
            />
          </div>
        </div>
      </section>

      <RatesFAQ
        questions={faq.questions}
        language={lang}
        title={faq.title}
      />

      <RatesCTASection
        title={ctaSection.title}
        subtitle={ctaSection.subtitle}
        primaryCTA={ctaSection.primaryCTA}
        secondaryCTA={ctaSection.secondaryCTA}
        language={lang}
        insuranceModal={{
          providerList: insurance.providerList,
          title: insurance.modal?.title,
          description: insurance.modal?.description,
          outOfNetworkInfo: insurance.modal?.outOfNetworkInfo,
          note: insurance.modal?.note,
        }}
      />
    </>
  );
}
