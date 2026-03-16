/**
 * ContactContentFromApi - Contenido de la página Contact cargado desde la API en el cliente.
 * Refetchea GET /api/content/contact para que los cambios del editor se vean en vivo.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { getPageContent } from '@/data/services/contentService';
import type { ContentPage } from '@/data/models/ContentPage';
import { getLocalizedText } from '@/data/models/ContentPage';
import { ContactInfo, ContactForm } from '@/components/contact';

interface ContactContentFromApiProps {
  lang: 'en' | 'es';
  initialData: ContentPage | null;
}

const REFETCH_INTERVAL_MS = 60_000;

export default function ContactContentFromApi({ lang, initialData }: ContactContentFromApiProps) {
  const [content, setContent] = useState<ContentPage | null>(initialData);
  const [error, setError] = useState<string | null>(null);

  const fetchContent = useCallback(() => {
    getPageContent('contact', lang)
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

  const hero = data.content.hero;
  if (!hero) return null;

  return (
    <section id="contact-main" className="py-16 px-4 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-navy-900 mb-4">
            {getLocalizedText(hero.title, lang)}
          </h1>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
          <ContactInfo contactData={data} language={lang} />
          <ContactForm contactData={data} language={lang} />
        </div>
      </div>
    </section>
  );
}
