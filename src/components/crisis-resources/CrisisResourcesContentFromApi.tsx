/**
 * CrisisResourcesContentFromApi - Contenido de la página Crisis Resources desde la API en el cliente.
 * Refetchea GET /api/content/crisis-resources para que los cambios del editor se vean en vivo.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { getPageContent } from '@/data/services/contentService';
import type { ContentPage, LocalizedText } from '@/data/models/ContentPage';
import { getLocalizedText } from '@/data/models/ContentPage';

type CrisisResource = {
  name: LocalizedText;
  description?: LocalizedText;
  phone?: string | null;
  url?: string | null;
  text?: string | null;
  tty?: string | null;
  videoPhone?: string | null;
  instantMessenger?: string | null;
  email?: string | null;
  hours?: LocalizedText;
  address?: LocalizedText;
};

type CrisisSubcategory = {
  title: LocalizedText;
  resources?: CrisisResource[];
};

type CrisisCategory = {
  title: LocalizedText;
  subcategories?: CrisisSubcategory[];
};

interface CrisisResourcesContentFromApiProps {
  lang: 'en' | 'es';
  initialData: ContentPage | null;
}

const REFETCH_INTERVAL_MS = 60_000;

function formatUrl(url?: string | null): string | null {
  if (!url) return null;
  return url.startsWith('http') ? url : `https://${url}`;
}

export default function CrisisResourcesContentFromApi({ lang, initialData }: CrisisResourcesContentFromApiProps) {
  const [content, setContent] = useState<ContentPage | null>(initialData);
  const [error, setError] = useState<string | null>(null);

  const fetchContent = useCallback(() => {
    getPageContent('crisis-resources')
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

  const categories = (data.content.categories || []) as CrisisCategory[];
  const heroTitle = getLocalizedText(data.content.hero?.title, lang);
  const pageDescription = data.seo?.description ? getLocalizedText(data.seo.description, lang) : '';

  const labels = {
    phone: lang === 'es' ? 'Teléfono' : 'Phone',
    text: lang === 'es' ? 'Texto' : 'Text',
    tty: lang === 'es' ? 'TTY' : 'TTY',
    videoPhone: lang === 'es' ? 'Videoteléfono' : 'Video Phone',
    instantMessenger: lang === 'es' ? 'Mensajería instantánea' : 'Instant Messenger',
    email: lang === 'es' ? 'Correo electrónico' : 'Email',
    hours: lang === 'es' ? 'Horario' : 'Hours',
    address: lang === 'es' ? 'Dirección' : 'Address',
    website: lang === 'es' ? 'Sitio web' : 'Website',
  };

  return (
    <>
      <section id="crisis-resources-hero" className="py-16 px-4 bg-gray-50">
        <div className="max-w-5xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900">
            {heroTitle}
          </h1>
          {pageDescription && (
            <p className="mt-4 text-lg text-gray-700">
              {pageDescription}
            </p>
          )}
        </div>
      </section>

      <section id="crisis-resources-content" className="py-12 px-4 bg-white">
        <div className="max-w-5xl mx-auto space-y-12">
          {categories.map((category, catIndex) => (
            <div key={catIndex} className="space-y-8">
              <h2 className="text-2xl md:text-3xl font-semibold text-navy-900">
                {getLocalizedText(category.title, lang)}
              </h2>

              {category.subcategories?.map((subcategory, subIndex) => (
                <div key={subIndex} className="space-y-4">
                  <h3 className="text-xl font-semibold text-navy-800">
                    {getLocalizedText(subcategory.title, lang)}
                  </h3>

                  <div className="grid grid-cols-1 gap-4">
                    {subcategory.resources?.map((resource, resIndex) => (
                      <article
                        key={resIndex}
                        className="border border-gray-200 rounded-lg p-5 bg-gray-50"
                      >
                        <div className="space-y-2">
                          <h4 className="text-lg font-semibold text-gray-900">
                            {getLocalizedText(resource.name, lang)}
                          </h4>
                          {resource.description && (
                            <p className="text-sm text-gray-700">
                              {getLocalizedText(resource.description, lang)}
                            </p>
                          )}
                        </div>

                        <div className="mt-4 space-y-1 text-sm text-gray-700">
                          {resource.phone && (
                            <div>
                              <span className="font-medium">{labels.phone}:</span>{' '}
                              <a
                                href={`tel:${resource.phone.replace(/[^\d+]/g, '')}`}
                                className="text-tealBlue-700 hover:text-tealBlue-800"
                              >
                                {resource.phone}
                              </a>
                            </div>
                          )}
                          {resource.text && (
                            <div>
                              <span className="font-medium">{labels.text}:</span> {resource.text}
                            </div>
                          )}
                          {resource.tty && (
                            <div>
                              <span className="font-medium">{labels.tty}:</span> {resource.tty}
                            </div>
                          )}
                          {resource.videoPhone && (
                            <div>
                              <span className="font-medium">{labels.videoPhone}:</span> {resource.videoPhone}
                            </div>
                          )}
                          {resource.instantMessenger && (
                            <div>
                              <span className="font-medium">{labels.instantMessenger}:</span> {resource.instantMessenger}
                            </div>
                          )}
                          {resource.email && (
                            <div>
                              <span className="font-medium">{labels.email}:</span>{' '}
                              <a
                                href={`mailto:${resource.email}`}
                                className="text-tealBlue-700 hover:text-tealBlue-800"
                              >
                                {resource.email}
                              </a>
                            </div>
                          )}
                          {resource.hours && (
                            <div>
                              <span className="font-medium">{labels.hours}:</span>{' '}
                              {getLocalizedText(resource.hours, lang)}
                            </div>
                          )}
                          {resource.address && (
                            <div>
                              <span className="font-medium">{labels.address}:</span>{' '}
                              {getLocalizedText(resource.address, lang)}
                            </div>
                          )}
                          {resource.url && (
                            <div>
                              <span className="font-medium">{labels.website}:</span>{' '}
                              <a
                                href={formatUrl(resource.url) ?? '#'}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-tealBlue-700 hover:text-tealBlue-800 break-words"
                              >
                                {resource.url}
                              </a>
                            </div>
                          )}
                        </div>
                      </article>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
