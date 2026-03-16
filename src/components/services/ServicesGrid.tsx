/**
 * Services Grid Component
 * 
 * Componente principal que renderiza todas las categorías de servicios
 */

import ServiceCategory from './ServiceCategory';
import { getLocalizedText } from '@/data/models/ContentPage';
import type { LocalizedText } from '@/data/models/ContentPage';

interface Service {
  id: string;
  name: LocalizedText;
  description: LocalizedText;
  icon: string;
}

interface Category {
  id: string;
  title: LocalizedText;
  services: Service[];
}

interface ServicesGridProps {
  categories: Category[];
  language: 'en' | 'es';
  introText?: LocalizedText;
}

export default function ServicesGrid({ categories, language, introText }: ServicesGridProps) {
  const safeCategories = Array.isArray(categories)
    ? categories.filter((c): c is Category => c != null && typeof c === 'object').map((c) => ({
        id: (c as Category).id ?? `cat-${Math.random()}`,
        title: (c as Category).title ?? { en: '', es: '' },
        services: Array.isArray((c as Category).services) ? (c as Category).services.filter((s): s is Service => s != null && typeof s === 'object') : [],
      }))
    : [];

  return (
    <div className="py-12 px-4 bg-white">
      <div className="container mx-auto max-w-7xl">
        {/* Texto introductorio */}
        {introText && (
          <p className="text-lg text-gray-700 text-center mb-12 max-w-3xl mx-auto">
            {getLocalizedText(introText, language)}
          </p>
        )}
        
        {/* Renderizar cada categoría (con services vacío no se rompe; solo no se muestran tarjetas) */}
        {safeCategories.map((category, index) => (
          <ServiceCategory
            key={category.id}
            id={category.id}
            title={category.title}
            services={category.services}
            language={language}
            categoryIndex={index}
          />
        ))}
      </div>
    </div>
  );
}
