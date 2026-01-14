/**
 * Rates CTA Component
 * 
 * Sección de llamada a la acción para la página de Rates.
 */

import type { LocalizedText } from '@/data/models/ContentPage';
import { ArrowRightIcon } from '@heroicons/react/24/outline';

interface RatesCTAProps {
  title: LocalizedText;
  subtitle?: LocalizedText;
  primaryCTA: {
    text: LocalizedText;
    href?: string;
  };
  secondaryCTA?: {
    text: LocalizedText;
    href?: string;
    onClick?: () => void;
  };
  language: 'en' | 'es';
}

function getLocalizedText(text: LocalizedText, lang: 'en' | 'es'): string {
  return text[lang] || text.en || '';
}

export default function RatesCTA({
  title,
  subtitle,
  primaryCTA,
  secondaryCTA,
  language,
}: RatesCTAProps) {
  return (
    <section id="rates-cta" className="py-16 px-4 bg-blueGreen-50">
      <div className="container mx-auto max-w-4xl text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-navy-900 mb-4">
          {getLocalizedText(title, language)}
        </h2>
        {subtitle && (
          <p className="text-lg text-gray-700 mb-8 max-w-2xl mx-auto">
            {getLocalizedText(subtitle, language)}
          </p>
        )}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <a
            href={primaryCTA.href || '/contact'}
            className="inline-flex items-center gap-2 bg-blueGreen-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blueGreen-700 transition-colors shadow-md hover:shadow-lg"
          >
            {getLocalizedText(primaryCTA.text, language)}
            <ArrowRightIcon className="w-5 h-5" />
          </a>
          {secondaryCTA && (
            secondaryCTA.onClick ? (
              <button
                onClick={secondaryCTA.onClick}
                className="inline-flex items-center gap-2 bg-white text-blueGreen-600 px-8 py-3 rounded-lg font-semibold border-2 border-blueGreen-600 hover:bg-blueGreen-50 transition-colors"
              >
                {getLocalizedText(secondaryCTA.text, language)}
              </button>
            ) : (
              <a
                href={secondaryCTA.href || '/contact'}
                className="inline-flex items-center gap-2 bg-white text-blueGreen-600 px-8 py-3 rounded-lg font-semibold border-2 border-blueGreen-600 hover:bg-blueGreen-50 transition-colors"
              >
                {getLocalizedText(secondaryCTA.text, language)}
              </a>
            )
          )}
        </div>
      </div>
    </section>
  );
}
