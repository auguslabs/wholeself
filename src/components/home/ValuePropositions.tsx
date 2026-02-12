/**
 * Value Propositions Component
 * 
 * Muestra las propuestas de valor principales de forma escaneable
 * con iconos y texto breve.
 */

import React from 'react';
import { getIcon } from '@/components/services/iconHelper';
import { getLocalizedText } from '@/data/models/ContentPage';

interface ValuePropositionItem {
  icon: string;
  title: any;
  description: any;
}

interface ValuePropositionsProps {
  items: ValuePropositionItem[];
  language?: 'en' | 'es';
}

export default function ValuePropositions({ items, language = 'en' }: ValuePropositionsProps) {
  return (
    <section className="py-12 px-4 bg-white">
      <div className="container mx-auto max-w-7xl">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
          {items.map((item, index) => {
            const iconStr = typeof item.icon === 'string' ? item.icon : getLocalizedText(item.icon as any, language);
            const IconComponent = getIcon(iconStr);
            
            return (
              <div
                key={index}
                className="flex flex-col items-center text-center p-6 rounded-lg bg-blueGreen-50 hover:bg-blueGreen-100 transition-colors duration-300"
              >
                {/* Icono con fondo blanco circular */}
                {IconComponent && (
                  <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center mb-4 shadow-md">
                    <IconComponent className="w-8 h-8 text-blueGreen-600" />
                  </div>
                )}
                
                {/* Título */}
                <h3 className="text-lg font-semibold text-navy-900 mb-2">
                  {getLocalizedText(item.title, language)}
                </h3>
                
                {/* Descripción */}
                <p className="text-sm text-navy-700">
                  {getLocalizedText(item.description, language)}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
