/**
 * Services CTA Component
 * 
 * Sección de llamados a la acción al final de la página de servicios
 */

import { getLocalizedText } from '@/data/models/ContentPage';
import type { LocalizedText } from '@/data/models/ContentPage';
import { withLocalePath } from '@/utils/i18n';

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
  primaryCTAs?: PrimaryCTA[] | null;
  secondaryCTA?: SecondaryCTA | null;
  language: 'en' | 'es';
}

const DEFAULT_TITLE: LocalizedText = { en: 'Ready to get started?', es: '¿Listo para comenzar?' };
const DEFAULT_SUBTITLE: LocalizedText = { en: "We're here to support you on your healing journey.", es: 'Estamos aquí para apoyarte en tu camino de sanación.' };
const DEFAULT_PRIMARY_CTAS: PrimaryCTA[] = [
  { id: 'default-help-me', title: { en: 'I need help', es: 'Necesito ayuda' }, link: '/contact/i-need-help', color: 'blueGreen' },
  { id: 'default-help-other', title: { en: 'My loved one needs help', es: 'Mi ser querido necesita ayuda' }, link: '/contact/loved-one-needs-help', color: 'navy' },
];
const DEFAULT_SECONDARY_CTA: SecondaryCTA = {
  id: 'default-referral',
  title: { en: 'I need to make a referral', es: 'Necesito hacer una referencia' },
  link: '/contact/referral',
  text: { en: 'For healthcare providers and professionals', es: 'Para proveedores de salud y profesionales' },
};

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
  primaryCTAs = [],
  secondaryCTA,
  language,
}: ServicesCTAProps) {
  const safePrimaryCTAs = Array.isArray(primaryCTAs)
    ? primaryCTAs.filter((cta): cta is PrimaryCTA => cta != null && typeof cta === 'object' && typeof (cta as PrimaryCTA).link !== 'undefined')
    : [];
  const hasSecondary =
    secondaryCTA != null && typeof secondaryCTA === 'object' && (typeof (secondaryCTA as SecondaryCTA).link === 'string' || typeof (secondaryCTA as { href?: string }).href === 'string');

  const effectivePrimary = safePrimaryCTAs.length > 0 ? safePrimaryCTAs : DEFAULT_PRIMARY_CTAS;
  const effectiveSecondary = hasSecondary ? secondaryCTA : DEFAULT_SECONDARY_CTA;
  const effectiveTitle = getLocalizedText(title, language).trim() ? title : DEFAULT_TITLE;
  const effectiveSubtitle = getLocalizedText(subtitle, language).trim() ? subtitle : DEFAULT_SUBTITLE;

  return (
    <section id="services-cta" className="scroll-mt-24 md:scroll-mt-28 py-16 px-4 bg-gray-50">
      <div className="container mx-auto max-w-4xl">
        {/* Título y subtítulo */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-navy-900 mb-4">
            {getLocalizedText(effectiveTitle, language)}
          </h2>
          <p className="text-lg text-gray-700">
            {getLocalizedText(effectiveSubtitle, language)}
          </p>
        </div>

        {/* CTAs principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {effectivePrimary.map((cta) => {
            const colors = buttonColors[cta.color] || buttonColors.blueGreen;
            const link = cta.link ?? (cta as { href?: string }).href ?? '#';
            return (
              <a
                key={cta.id ?? link}
                href={withLocalePath(link, language)}
                className={`${colors.bg} ${colors.hover} ${colors.text} font-semibold py-4 px-8 rounded-lg text-center transition-colors duration-300 shadow-md hover:shadow-lg`}
              >
                {getLocalizedText(cta.title, language)}
              </a>
            );
          })}
        </div>

        {/* CTA secundario: solo si la API devolvió datos (evita "Cannot read properties of null (reading 'link')") */}
        {effectiveSecondary && (
          <div className="text-center">
            <a
              href={withLocalePath((effectiveSecondary as SecondaryCTA).link ?? (effectiveSecondary as { href?: string }).href ?? '#', language)}
              className="text-tealBlue-600 hover:text-tealBlue-700 font-medium underline"
            >
              {getLocalizedText((effectiveSecondary as SecondaryCTA).title, language)}
            </a>
            <p className="text-sm text-gray-600 mt-2">
              {getLocalizedText((effectiveSecondary as SecondaryCTA).text, language)}
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
