/**
 * What to Expect Timeline Component
 * 
 * Componente que muestra el proceso de terapia en formato timeline con accordion
 */

import { Accordion } from '@/components/ui/Accordion';
import { getIcon } from '@/components/services/iconHelper';
import type { LocalizedText } from '@/data/models/ContentPage';

interface TimelineSection {
  id: string;
  title: LocalizedText;
  icon: string;
  content: {
    intro?: LocalizedText;
    items?: Array<{
      title?: LocalizedText;
      description: LocalizedText;
    }>;
    paragraphs?: LocalizedText[];
  };
  colorClass?: string;
}

interface WhatToExpectTimelineProps {
  sections: TimelineSection[];
  language: 'en' | 'es';
}

// Colores progresivos para cada sección (de más intenso a más suave)
const sectionColors = [
  { bg: 'bg-blueGreen-500', text: 'text-blueGreen-500', border: 'border-blueGreen-500', light: 'bg-blueGreen-50' },
  { bg: 'bg-blueGreen-400', text: 'text-blueGreen-400', border: 'border-blueGreen-400', light: 'bg-blueGreen-50' },
  { bg: 'bg-blueGreen-300', text: 'text-blueGreen-300', border: 'border-blueGreen-300', light: 'bg-blueGreen-50' },
  { bg: 'bg-tealBlue-500', text: 'text-tealBlue-500', border: 'border-tealBlue-500', light: 'bg-tealBlue-50' },
  { bg: 'bg-tealBlue-400', text: 'text-tealBlue-400', border: 'border-tealBlue-400', light: 'bg-tealBlue-50' },
  { bg: 'bg-navy-500', text: 'text-navy-500', border: 'border-navy-500', light: 'bg-navy-50' },
];

function getLocalizedText(text: LocalizedText, lang: 'en' | 'es'): string {
  return text[lang] || text.en || '';
}

export default function WhatToExpectTimeline({ sections, language }: WhatToExpectTimelineProps) {
  const accordionItems = sections.map((section, index) => {
    const IconComponent = getIcon(section.icon);
    const colors = sectionColors[index % sectionColors.length];
    
    const iconElement = IconComponent ? (
      <IconComponent className={`w-6 h-6 ${colors.text}`} />
    ) : null;

    // Renderizar contenido
    let contentElement: React.ReactNode = null;

    if (section.content.intro) {
      contentElement = (
        <div className="space-y-4">
          <p className="text-gray-700 leading-relaxed">
            {getLocalizedText(section.content.intro, language)}
          </p>
          
          {section.content.items && section.content.items.length > 0 && (
            <ul className="space-y-3 mt-4">
              {section.content.items.map((item, itemIndex) => (
                <li key={itemIndex} className="flex gap-3">
                  <div className={`flex-shrink-0 w-2 h-2 rounded-full ${colors.bg} mt-2`} />
                  <div className="flex-1">
                    {item.title && (
                      <h4 className="font-semibold text-gray-900 mb-1">
                        {getLocalizedText(item.title, language)}
                      </h4>
                    )}
                    <p className="text-gray-700">
                      {getLocalizedText(item.description, language)}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}

          {section.content.paragraphs && section.content.paragraphs.length > 0 && (
            <div className="space-y-3 mt-4">
              {section.content.paragraphs.map((paragraph, paraIndex) => (
                <p key={paraIndex} className="text-gray-700 leading-relaxed">
                  {getLocalizedText(paragraph, language)}
                </p>
              ))}
            </div>
          )}
        </div>
      );
    } else if (section.content.items && section.content.items.length > 0) {
      contentElement = (
        <ul className="space-y-3">
          {section.content.items.map((item, itemIndex) => (
            <li key={itemIndex} className="flex gap-3">
              <div className={`flex-shrink-0 w-2 h-2 rounded-full ${colors.bg} mt-2`} />
              <div className="flex-1">
                {item.title && (
                  <h4 className="font-semibold text-gray-900 mb-1">
                    {getLocalizedText(item.title, language)}
                  </h4>
                )}
                <p className="text-gray-700">
                  {getLocalizedText(item.description, language)}
                </p>
              </div>
            </li>
          ))}
        </ul>
      );
    } else if (section.content.paragraphs && section.content.paragraphs.length > 0) {
      contentElement = (
        <div className="space-y-3">
          {section.content.paragraphs.map((paragraph, paraIndex) => (
            <p key={paraIndex} className="text-gray-700 leading-relaxed">
              {getLocalizedText(paragraph, language)}
            </p>
          ))}
        </div>
      );
    }

    return {
      id: section.id,
      title: getLocalizedText(section.title, language),
      icon: iconElement,
      content: contentElement,
      defaultOpen: index === 0, // Primera sección abierta por defecto
    };
  });

  return (
    <section id="what-to-expect-timeline" className="py-12 px-4 bg-white">
      <div className="container mx-auto max-w-4xl">
        {/* Timeline visual con accordion */}
        <Accordion items={accordionItems} allowMultiple={false} />
      </div>
    </section>
  );
}
