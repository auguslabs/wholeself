/**
 * Services CTA Component
 * 
 * Sección de llamados a la acción al final de la página de servicios
 */

import type { LocalizedText } from '@/data/models/ContentPage';

interface PrimaryCTA {
  id: string;
  title: LocalizedText;
  link: string;
  color: string;
}

interface SecondaryCTA {
  id: string;
  title: LocalizedText;
  link: string;
  text: LocalizedText;
}

interface ServicesCTAProps {
  title: LocalizedText;
  subtitle: LocalizedText;
  primaryCTAs: PrimaryCTA[];
  secondaryCTA: SecondaryCTA;
  language: 'en' | 'es';
}

// Colores para los botones
const buttonColors: Record<string, { bg: string; hover: string; text: string }> = {
  blueGreen: {
    bg: 'bg-blueGreen-500',
    hover: 'hover:bg-blueGreen-600',
    text: 'text-white',
  },
  navy: {
    bg: 'bg-navy-500',
    hover: 'hover:bg-navy-600',
    text: 'text-white',
  },
};

export default function ServicesCTA({
  title,
  subtitle,
  primaryCTAs,
  secondaryCTA,
  language,
}: ServicesCTAProps) {
  return (
    <section id="services-cta" className="py-16 px-4 bg-gray-50">
      <div className="container mx-auto max-w-4xl">
        {/* Título y subtítulo */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-navy-900 mb-4">
            {language === 'en' ? title.en : title.es}
          </h2>
          <p className="text-lg text-gray-700">
            {language === 'en' ? subtitle.en : subtitle.es}
          </p>
        </div>

        {/* CTAs principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {primaryCTAs.map((cta) => {
            const colors = buttonColors[cta.color] || buttonColors.blueGreen;
            return (
              <a
                key={cta.id}
                href={cta.link}
                className={`${colors.bg} ${colors.hover} ${colors.text} font-semibold py-4 px-8 rounded-lg text-center transition-colors duration-300 shadow-md hover:shadow-lg`}
              >
                {language === 'en' ? cta.title.en : cta.title.es}
              </a>
            );
          })}
        </div>

        {/* CTA secundario */}
        <div className="text-center">
          <a
            href={secondaryCTA.link}
            className="text-tealBlue-600 hover:text-tealBlue-700 font-medium underline"
          >
            {language === 'en' ? secondaryCTA.title.en : secondaryCTA.title.es}
          </a>
          <p className="text-sm text-gray-600 mt-2">
            {language === 'en' ? secondaryCTA.text.en : secondaryCTA.text.es}
          </p>
        </div>
      </div>
    </section>
  );
}
