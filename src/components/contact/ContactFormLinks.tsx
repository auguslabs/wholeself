'use client';

import React from 'react';
import { getIcon } from '@/components/services/iconHelper';
import { withLocalePath } from '@/utils/i18n';

interface FormLink {
  id: string;
  title: {
    en: string;
    es: string;
  };
  link: string;
  color: 'blueGreen' | 'navy' | 'lightbrown';
  icon: string;
}

interface ContactFormLinksProps {
  language?: 'en' | 'es';
}

/**
 * Componente ContactFormLinks - Enlaces a formularios especializados
 * 
 * Muestra enlaces sutiles a los tres formularios de contacto especializados.
 * Diseño minimalista que no compite con el formulario principal.
 */
export default function ContactFormLinks({ language = 'en' }: ContactFormLinksProps) {
  const formLinks: FormLink[] = [
    {
      id: 'i-need-help',
      title: {
        en: 'I need help',
        es: 'Necesito ayuda'
      },
      link: '/contact/i-need-help',
      color: 'blueGreen',
      icon: 'HandRaisedIcon'
    },
    {
      id: 'loved-one',
      title: {
        en: 'My loved one needs help',
        es: 'Mi ser querido necesita ayuda'
      },
      link: '/contact/loved-one-needs-help',
      color: 'navy',
      icon: 'UserGroupIcon'
    },
    {
      id: 'referral',
      title: {
        en: 'I need to make a referral',
        es: 'Necesito hacer una referencia'
      },
      link: '/contact/referral',
      color: 'lightbrown',
      icon: 'ClipboardDocumentCheckIcon'
    }
  ];

  const getColorClasses = (color: string) => {
    const colorMap: Record<string, { bg: string; hover: string; text: string }> = {
      blueGreen: {
        bg: 'bg-blueGreen-500',
        hover: 'hover:bg-blueGreen-600',
        text: 'text-white'
      },
      navy: {
        bg: 'bg-navy-500',
        hover: 'hover:bg-navy-600',
        text: 'text-white'
      },
      lightbrown: {
        bg: 'bg-lightbrown-500',
        hover: 'hover:bg-lightbrown-600',
        text: 'text-white'
      }
    };
    return colorMap[color] || colorMap.blueGreen;
  };

  return (
    <div className="mt-8 pt-6 border-t border-gray-200">
      <p className="text-sm text-gray-600 mb-4 text-center">
        {language === 'en' 
          ? 'Or use a specialized form:' 
          : 'O usa un formulario especializado:'}
      </p>
      {/* Grid: 3 columnas en desktop, 1 columna en móvil */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        {formLinks.map((formLink) => {
          const colors = getColorClasses(formLink.color);
          const IconComponent = getIcon(formLink.icon);
          
          return (
            <a
              key={formLink.id}
              href={withLocalePath(formLink.link, language)}
              className={`
                ${colors.bg} ${colors.hover} ${colors.text}
                text-sm font-medium py-2.5 px-4 rounded-lg
                transition-colors duration-200
                shadow-sm hover:shadow-md
                flex items-center justify-center gap-2
              `}
            >
              {IconComponent && (
                <IconComponent className="w-4 h-4 flex-shrink-0" />
              )}
              <span className="text-center">{formLink.title[language]}</span>
            </a>
          );
        })}
      </div>
    </div>
  );
}
