/**
 * Breadcrumb Component
 * 
 * Componente genérico de breadcrumb para navegación
 */

import { ArrowLeftIcon } from '@heroicons/react/24/outline';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  language?: 'en' | 'es';
  showBackButton?: boolean;
  backHref?: string;
  backText?: string;
}

export default function Breadcrumb({ 
  items, 
  language = 'en',
  showBackButton = true,
  backHref,
  backText
}: BreadcrumbProps) {
  const defaultBackText = language === 'en' ? 'Back' : 'Volver';
  const backButtonText = backText || defaultBackText;
  const backLink = backHref || (items.length > 1 ? items[items.length - 2].href : items[0].href) || '/';

  return (
    <div className="bg-white border-b border-gray-200 py-4 px-4">
      <div className="container mx-auto max-w-7xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm flex-wrap" aria-label="Breadcrumb">
            {items.map((item, index) => (
              <span key={index} className="flex items-center gap-2">
                {index > 0 && <span className="text-gray-400">/</span>}
                {item.href && index < items.length - 1 ? (
                  <a
                    href={item.href}
                    className="text-gray-600 hover:text-blueGreen-600 transition-colors font-medium"
                  >
                    {item.label}
                  </a>
                ) : (
                  <span className={index === items.length - 1 ? 'text-navy-900 font-semibold' : 'text-gray-600'}>
                    {item.label}
                  </span>
                )}
              </span>
            ))}
          </nav>

          {/* Botón de flecha hacia atrás */}
          {showBackButton && (
            <a
              href={backLink}
              className="group flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-blueGreen-600 transition-colors"
              aria-label={backButtonText}
            >
              <ArrowLeftIcon className="w-4 h-4 transition-transform duration-200 group-hover:-translate-x-1" />
              <span className="hidden sm:inline">{backButtonText}</span>
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
