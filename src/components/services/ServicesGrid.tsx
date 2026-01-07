/**
 * Services Grid Component
 * 
 * Componente principal que renderiza todas las categorías de servicios
 */

import ServiceCategory from './ServiceCategory';
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
  return (
    <div className="py-12 px-4 bg-white">
      <div className="container mx-auto max-w-7xl">
        {/* Texto introductorio */}
        {introText && (
          <p className="text-lg text-gray-700 text-center mb-12 max-w-3xl mx-auto">
            {language === 'en' ? introText.en : introText.es}
          </p>
        )}
        
        {/* Renderizar cada categoría */}
        {categories.map((category, index) => (
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
