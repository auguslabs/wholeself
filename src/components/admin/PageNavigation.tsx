import React from 'react';
import {
  HomeIcon,
  WrenchScrewdriverIcon,
  ClipboardDocumentListIcon,
  CurrencyDollarIcon,
  UsersIcon,
  EnvelopeIcon,
} from '@heroicons/react/24/outline';

/**
 * Interfaz para una página del proyecto
 */
export interface Page {
  id: string;
  name: string;
  icon?: string; // Nombre del icono de Hero Icons
  order: number;
}

// Mapa de nombres de iconos a componentes
const iconMap: Record<string, React.ComponentType<React.SVGProps<SVGSVGElement>>> = {
  HomeIcon,
  WrenchScrewdriverIcon,
  ClipboardDocumentListIcon,
  CurrencyDollarIcon,
  UsersIcon,
  EnvelopeIcon,
};

/**
 * Props del componente PageNavigation
 */
interface PageNavigationProps {
  pages: Page[];
  activePageId?: string;
  onPageSelect: (pageId: string) => void;
}

/**
 * Componente PageNavigation
 * 
 * Lista vertical de páginas editables del proyecto
 * Ocupa columna 1, fila 2 (1/5 del ancho)
 */
export function PageNavigation({ pages, activePageId, onPageSelect }: PageNavigationProps) {
  // Ordenar páginas por order
  const sortedPages = [...pages].sort((a, b) => a.order - b.order);

  return (
    <nav className="bg-white border-b md:border-b-0 md:border-r border-gray-200 md:h-full md:overflow-y-auto overflow-x-auto overflow-y-hidden scrollbar-hide">
      {/* Móvil: horizontal con scroll oculto */}
      <ul className="flex md:flex-col py-2 md:py-2">
        {sortedPages.map((page) => {
          const isActive = activePageId === page.id;
          
          return (
            <li key={page.id} className="flex-shrink-0 md:w-full">
              <button
                onClick={() => {
                  console.log('PageNavigation - Button clicked for page:', page.id);
                  onPageSelect(page.id);
                }}
                className={`
                  md:w-full text-left px-4 py-3 transition-colors whitespace-nowrap
                  ${isActive 
                    ? 'md:border-l-4 border-b-4 md:border-b-0 text-gray-900 font-medium' 
                    : 'text-gray-700 hover:bg-[#fbae17]/10'
                  }
                `}
                style={isActive ? {
                  backgroundColor: '#07549b',
                  color: '#ffffff',
                  borderColor: '#07549b'
                } : undefined}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = '#fbae17';
                    e.currentTarget.style.color = '#ffffff';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = '';
                    e.currentTarget.style.color = '';
                  }
                }}
              >
                <div className="flex items-center gap-3">
                  {page.icon && (() => {
                    const IconComponent = iconMap[page.icon];
                    if (IconComponent) {
                      return (
                        <IconComponent 
                          className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-white' : 'text-gray-500'}`}
                        />
                      );
                    }
                    return null;
                  })()}
                  <span>{page.name}</span>
                </div>
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
