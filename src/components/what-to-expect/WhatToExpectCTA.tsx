/**
 * What to Expect CTA Component
 * 
 * Sección de llamados a la acción para la página What to Expect
 */

import type { LocalizedText } from '@/data/models/ContentPage';
import { ArrowRightIcon } from '@heroicons/react/24/outline';

interface CTAItem {
  id: string;
  title: LocalizedText;
  description?: LocalizedText;
  link: string;
  variant?: 'primary' | 'secondary';
}

interface WhatToExpectCTAProps {
  title?: LocalizedText;
  subtitle?: LocalizedText;
  ctas: CTAItem[];
  language: 'en' | 'es';
}

function getLocalizedText(text: LocalizedText, lang: 'en' | 'es'): string {
  return text[lang] || text.en || '';
}

export default function WhatToExpectCTA({
  title,
  subtitle,
  ctas,
  language,
}: WhatToExpectCTAProps) {
  return (
    <section id="what-to-expect-cta" className="py-16 px-4 bg-blueGreen-50">
      <div className="container mx-auto max-w-4xl">
        {/* Título y subtítulo */}
        {(title || subtitle) && (
          <div className="text-center mb-12">
            {title && (
              <h2 className="text-3xl md:text-4xl font-bold text-navy-900 mb-4">
                {getLocalizedText(title, language)}
              </h2>
            )}
            {subtitle && (
              <p className="text-lg text-gray-700 max-w-2xl mx-auto">
                {getLocalizedText(subtitle, language)}
              </p>
            )}
          </div>
        )}

        {/* CTAs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {ctas.map((cta) => {
            const isPrimary = cta.variant === 'primary' || !cta.variant;
            return (
              <a
                key={cta.id}
                href={cta.link}
                className={`group relative overflow-hidden rounded-lg p-6 transition-all duration-300 ${
                  isPrimary
                    ? 'bg-blueGreen-500 hover:bg-blueGreen-600 text-white shadow-lg hover:shadow-xl'
                    : 'bg-white hover:bg-gray-50 text-navy-900 border-2 border-blueGreen-500 shadow-md hover:shadow-lg'
                }`}
              >
                <div className="relative z-10">
                  <h3 className="text-xl font-bold mb-2">
                    {getLocalizedText(cta.title, language)}
                  </h3>
                  {cta.description && (
                    <p className={`mb-4 ${isPrimary ? 'text-blueGreen-50' : 'text-gray-700'}`}>
                      {getLocalizedText(cta.description, language)}
                    </p>
                  )}
                  <div className={`inline-flex items-center gap-2 font-semibold ${
                    isPrimary ? 'text-white' : 'text-blueGreen-600'
                  }`}>
                    {language === 'en' ? 'Get Started' : 'Comenzar'}
                    <ArrowRightIcon className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                  </div>
                </div>
                {/* Efecto de hover */}
                <div className={`absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity ${
                  isPrimary ? 'bg-white' : 'bg-blueGreen-500'
                }`} />
              </a>
            );
          })}
        </div>
      </div>
    </section>
  );
}
