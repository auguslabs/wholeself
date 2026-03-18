/**
 * Accordion Component - UI Base
 * 
 * Componente reutilizable para secciones expandibles/colapsables
 */

import { useRef, useState } from 'react';
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline';

interface AccordionItem {
  id: string;
  title: string;
  content: React.ReactNode;
  icon?: React.ReactNode;
  defaultOpen?: boolean;
}

interface AccordionProps {
  items: AccordionItem[];
  allowMultiple?: boolean;
  className?: string;
}

export function Accordion({ items, allowMultiple = false, className = '' }: AccordionProps) {
  const [openItems, setOpenItems] = useState<Set<string>>(
    new Set(items.filter(item => item.defaultOpen).map(item => item.id))
  );

  const headerRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  const toggleItem = (id: string) => {
    setOpenItems((prev) => {
      const newSet = new Set(prev);
      const wasOpen = newSet.has(id);
      if (wasOpen) {
        newSet.delete(id);
      } else {
        if (!allowMultiple) {
          newSet.clear();
        }
        newSet.add(id);
        // Solo al abrir: alinear el header del item al top del viewport.
        // Usamos scrollTo con coordenadas exactas (más consistente que scrollIntoView).
        const scrollHeaderToTop = () => {
          const el = headerRefs.current[id];
          if (!el) return;
          const rect = el.getBoundingClientRect();
          const isMobile = window.innerWidth < 768; // md breakpoint
          const headerHeight = !isMobile
            ? (document.querySelector('header') as HTMLElement | null)?.getBoundingClientRect().height ?? 0
            : 0;
          const top = rect.top + window.scrollY - headerHeight;
          window.scrollTo({ top, behavior: 'smooth' });
        };
        // Hacerlo varias veces para cubrir animación/relayout del acordeón.
        requestAnimationFrame(() => {
          scrollHeaderToTop();
          setTimeout(scrollHeaderToTop, 50);
          setTimeout(scrollHeaderToTop, 320); // coincide con duration-300
        });
      }
      return newSet;
    });
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {items.map((item) => {
        const isOpen = openItems.has(item.id);
        return (
          <div
            key={item.id}
            className="border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
          >
            <button
              onClick={() => toggleItem(item.id)}
              ref={(el) => {
                headerRefs.current[item.id] = el;
              }}
              className="w-full px-6 py-4 flex items-center justify-between bg-white hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-blueGreen-500 focus:ring-offset-2"
              aria-expanded={isOpen}
              aria-controls={`accordion-content-${item.id}`}
            >
              <div className="flex items-center gap-4 flex-1 text-left">
                {item.icon && (
                  <div className="flex-shrink-0">
                    {item.icon}
                  </div>
                )}
                <h3 className="text-lg font-semibold text-gray-900">
                  {item.title}
                </h3>
              </div>
              <div className="flex-shrink-0 ml-4">
                {isOpen ? (
                  <ChevronUpIcon className="w-5 h-5 text-gray-600" />
                ) : (
                  <ChevronDownIcon className="w-5 h-5 text-gray-600" />
                )}
              </div>
            </button>
            <div
              id={`accordion-content-${item.id}`}
              className={`overflow-hidden transition-all duration-300 ease-in-out ${
                isOpen ? 'max-h-[5000px] opacity-100' : 'max-h-0 opacity-0'
              }`}
            >
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                {item.content}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
