/**
 * Condition Breadcrumb Component
 * 
 * Breadcrumb navigation con flecha hacia atrás para páginas de condiciones
 */

import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import type { LocalizedText } from '@/data/models/ContentPage';

interface ConditionBreadcrumbProps {
  conditionName: LocalizedText;
  language: 'en' | 'es';
}

export default function ConditionBreadcrumb({ conditionName, language }: ConditionBreadcrumbProps) {
  const servicesText = language === 'en' ? 'Services' : 'Servicios';
  const backText = language === 'en' ? 'Back to Services' : 'Volver a Servicios';
  const conditionNameText = language === 'en' ? conditionName.en : conditionName.es;

  return (
    <div className="bg-white border-b border-gray-200 py-4 px-4">
      <div className="container mx-auto max-w-4xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm" aria-label="Breadcrumb">
            <a
              href="/services"
              className="text-gray-600 hover:text-blueGreen-600 transition-colors font-medium"
            >
              {servicesText}
            </a>
            <span className="text-gray-400">/</span>
            <span className="text-navy-900 font-semibold">{conditionNameText}</span>
          </nav>

          {/* Botón de flecha hacia atrás */}
          <a
            href="/services"
            className="group flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-blueGreen-600 transition-colors"
            aria-label={backText}
          >
            <ArrowLeftIcon className="w-4 h-4 transition-transform duration-200 group-hover:-translate-x-1" />
            <span className="hidden sm:inline">{backText}</span>
            <span className="sm:hidden">{servicesText}</span>
          </a>
        </div>
      </div>
    </div>
  );
}
