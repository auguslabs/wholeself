/**
 * Pricing Table Component
 * 
 * Tabla responsive que muestra precios de servicios de terapia.
 * Se convierte en cards en móvil para mejor UX.
 */

import type { LocalizedText } from '@/data/models/ContentPage';

interface PricingSession {
  type: LocalizedText;
  rate: LocalizedText;
  duration: LocalizedText;
  frequency?: LocalizedText;
}

interface PricingTableProps {
  sessions: PricingSession[];
  language: 'en' | 'es';
  title?: LocalizedText;
}

function getLocalizedText(text: LocalizedText, lang: 'en' | 'es'): string {
  return text[lang] || text.en || '';
}

export default function PricingTable({ sessions, language, title }: PricingTableProps) {
  if (!sessions || sessions.length === 0) {
    return null;
  }

  return (
    <section id="pricing-table" className="py-12 px-4 bg-white">
      <div className="container mx-auto max-w-5xl">
        {title && (
          <h2 className="text-3xl font-bold text-navy-900 mb-8 text-center">
            {getLocalizedText(title, language)}
          </h2>
        )}
        
        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-blueGreen-50 border-b-2 border-blueGreen-500">
                <th className="px-6 py-4 text-left text-sm font-semibold text-navy-900">
                  {language === 'en' ? 'Service Type' : 'Tipo de Servicio'}
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-navy-900">
                  {language === 'en' ? 'Rate per Session' : 'Precio por Sesión'}
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-navy-900">
                  {language === 'en' ? 'Duration' : 'Duración'}
                </th>
                {sessions.some(s => s.frequency) && (
                  <th className="px-6 py-4 text-left text-sm font-semibold text-navy-900">
                    {language === 'en' ? 'Frequency' : 'Frecuencia'}
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              {sessions.map((session, index) => (
                <tr
                  key={index}
                  className={`border-b border-gray-200 hover:bg-gray-50 transition-colors ${
                    index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                  }`}
                >
                  <td className="px-6 py-4 text-gray-900 font-medium">
                    {getLocalizedText(session.type, language)}
                  </td>
                  <td className="px-6 py-4 text-blueGreen-600 font-bold text-lg">
                    {getLocalizedText(session.rate, language)}
                  </td>
                  <td className="px-6 py-4 text-gray-700">
                    {getLocalizedText(session.duration, language)}
                  </td>
                  {sessions.some(s => s.frequency) && (
                    <td className="px-6 py-4 text-gray-700">
                      {session.frequency ? getLocalizedText(session.frequency, language) : '-'}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="md:hidden space-y-4">
          {sessions.map((session, index) => (
            <div
              key={index}
              className="bg-white border-2 border-blueGreen-200 rounded-lg p-6 shadow-sm"
            >
              <h3 className="text-xl font-bold text-navy-900 mb-3">
                {getLocalizedText(session.type, language)}
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 font-medium">
                    {language === 'en' ? 'Rate:' : 'Precio:'}
                  </span>
                  <span className="text-blueGreen-600 font-bold text-xl">
                    {getLocalizedText(session.rate, language)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 font-medium">
                    {language === 'en' ? 'Duration:' : 'Duración:'}
                  </span>
                  <span className="text-gray-700">
                    {getLocalizedText(session.duration, language)}
                  </span>
                </div>
                {session.frequency && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 font-medium">
                      {language === 'en' ? 'Frequency:' : 'Frecuencia:'}
                    </span>
                    <span className="text-gray-700">
                      {getLocalizedText(session.frequency, language)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
