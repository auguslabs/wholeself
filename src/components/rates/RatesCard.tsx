/**
 * Rates Card Component
 * 
 * Tarjeta informativa para seguros, opciones de pago y otra información de tarifas.
 */

import { renderIcon } from '@/components/services/iconHelper';
import type { LocalizedText } from '@/data/models/ContentPage';

interface RatesCardProps {
  title: LocalizedText;
  description?: LocalizedText;
  icon: string;
  language: 'en' | 'es';
  items?: Array<{
    label?: LocalizedText;
    text: LocalizedText;
  }>;
  cta?: {
    text: LocalizedText;
    href?: string;
    onClick?: () => void;
  };
  colorClass?: string;
}

function getLocalizedText(text: LocalizedText, lang: 'en' | 'es'): string {
  return text[lang] || text.en || '';
}

export default function RatesCard({
  title,
  description,
  icon,
  language,
  items,
  cta,
  colorClass = 'border-blueGreen-500',
}: RatesCardProps) {
  // Mapa de colores para estilos inline usando los colores del tema
  const colorMap: Record<string, string> = {
    'border-blueGreen-500': '#3e9791',
    'border-blueGreen-400': '#4da59f',
    'border-blueGreen-300': '#6db3ad',
    'border-navy-500': '#274776',
    'border-navy-400': '#3a5a8a',
  };

  const categoryColor = colorMap[colorClass] || '#3e9791';
  const borderColor = categoryColor;

  return (
    <div
      className="group bg-white rounded-lg p-6 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-l-4 border-t border-r border-b border-gray-100 h-full flex flex-col"
      style={{ borderLeftColor: borderColor, borderLeftWidth: '4px' }}
    >
      {/* Icono con fondo del color de la categoría */}
      <div
        className="mb-4 w-16 h-16 rounded-lg flex items-center justify-center transition-all group-hover:scale-110"
        style={{ backgroundColor: categoryColor }}
      >
        <div className="text-white">
          {renderIcon(icon, 'w-8 h-8')}
        </div>
      </div>

      {/* Título */}
      <h3 className="text-xl font-bold text-navy-900 mb-3">
        {getLocalizedText(title, language)}
      </h3>

      {/* Descripción */}
      {description && (
        <p className="text-gray-700 text-sm leading-relaxed mb-4 flex-grow">
          {getLocalizedText(description, language)}
        </p>
      )}

      {/* Items (lista) */}
      {items && items.length > 0 && (
        <ul className="space-y-2 mb-4 flex-grow">
          {items.map((item, index) => (
            <li key={index} className="flex items-start gap-2">
              <div className="flex-shrink-0 w-2 h-2 rounded-full mt-2" style={{ backgroundColor: categoryColor }} />
              <div className="flex-1">
                {item.label && (
                  <span className="font-semibold text-gray-900 mr-2">
                    {getLocalizedText(item.label, language)}:
                  </span>
                )}
                <span className="text-gray-700 text-sm">
                  {getLocalizedText(item.text, language)}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* CTA */}
      {cta && (
        <div className="mt-auto pt-4">
          {cta.href ? (
            <a
              href={cta.href}
              className="inline-flex items-center gap-2 text-blueGreen-600 font-semibold hover:text-blueGreen-700 transition-colors"
            >
              {getLocalizedText(cta.text, language)}
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </a>
          ) : (
            <button
              onClick={cta.onClick}
              className="inline-flex items-center gap-2 text-blueGreen-600 font-semibold hover:text-blueGreen-700 transition-colors"
            >
              {getLocalizedText(cta.text, language)}
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          )}
        </div>
      )}
    </div>
  );
}
