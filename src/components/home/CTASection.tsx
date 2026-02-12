/**
 * CTA Section - React version for use with client-fetched content.
 * Same layout as CTASection.astro; accepts ctaSection + language.
 */

import React from 'react';
import { getLocalizedText } from '@/data/models/ContentPage';
import { withLocalePath } from '@/utils/i18n';
import CTACard from './CTACard';

const ctaColors: Record<string, { bg: string; bgHover: string; bgHoverDark: string; text: string; textDesc: string }> = {
  'i-need-help': {
    bg: 'bg-blueGreen-100',
    bgHover: 'bg-blueGreen-500',
    bgHoverDark: 'bg-blueGreen-600',
    text: 'text-blueGreen-500',
    textDesc: 'text-blueGreen-700',
  },
  'loved-one': {
    bg: 'bg-navy-100',
    bgHover: 'bg-navy-500',
    bgHoverDark: 'bg-navy-600',
    text: 'text-navy-500',
    textDesc: 'text-navy-700',
  },
  referral: {
    bg: 'bg-lightbrown-100',
    bgHover: 'bg-lightbrown-500',
    bgHoverDark: 'bg-lightbrown-600',
    text: 'text-lightbrown-500',
    textDesc: 'text-lightbrown-700',
  },
};

interface CTASectionProps {
  ctaSection: {
    title?: string | { en?: string; es?: string };
    ctas: Array<{
      id: string | { en?: string; es?: string };
      title: string | { en?: string; es?: string };
      description: string | { en?: string; es?: string };
      link: string | { en?: string; es?: string };
      icon: string | { en?: string; es?: string };
    }>;
  };
  lang: 'en' | 'es';
}

export default function CTASection({ ctaSection, lang }: CTASectionProps) {
  return (
    <section id="cta-section" className="py-16 px-4 bg-white">
      <div className="container mx-auto max-w-7xl">
        {ctaSection.title && (
          <h2 className="text-3xl font-bold text-center mb-8 text-navy-900">
            {getLocalizedText(ctaSection.title as any, lang)}
          </h2>
        )}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {ctaSection.ctas.map((cta: any, index: number) => {
            const idStr = typeof cta.id === 'string' ? cta.id : getLocalizedText(cta.id, lang);
            const colors = ctaColors[idStr] || ctaColors['i-need-help'];
            const linkStr = typeof cta.link === 'string' ? cta.link : getLocalizedText(cta.link, lang);
            const resolvedLink = linkStr && linkStr.startsWith('http') ? linkStr : withLocalePath(linkStr || '', lang);
            const iconStr = typeof cta.icon === 'string' ? cta.icon : getLocalizedText(cta.icon, lang);
            return (
              <CTACard
                key={idStr || index}
                id={idStr || 'i-need-help'}
                title={getLocalizedText(cta.title, lang)}
                description={getLocalizedText(cta.description, lang)}
                link={resolvedLink}
                iconName={iconStr}
                colors={colors}
              />
            );
          })}
        </div>
      </div>
    </section>
  );
}
