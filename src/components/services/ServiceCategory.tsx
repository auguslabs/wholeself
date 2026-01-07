/**
 * Service Category Component
 * 
 * Renderiza una categoría de servicios con su título y grid de servicios
 */

import ServiceCard from './ServiceCard';
import type { LocalizedText } from '@/data/models/ContentPage';

interface Service {
  id: string;
  name: LocalizedText;
  description: LocalizedText;
  icon: string;
}

interface ServiceCategoryProps {
  id: string;
  title: LocalizedText;
  services: Service[];
  language: 'en' | 'es';
  categoryIndex: number;
}

// Colores para cada categoría (100%, 80%, 60%, 40%)
// Usamos los mismos colores exactos que en ServiceCard para que coincidan
const categoryColors = [
  { 
    titleColor: '#3e9791', // blueGreen-500 (100%) - Grupo 1
    border: 'border-blueGreen-500' 
  },
  { 
    titleColor: '#4da59f', // blueGreen-400 (80%) - Grupo 2
    border: 'border-blueGreen-400' 
  },
  { 
    titleColor: '#6db3ad', // blueGreen-300 (60%) - Grupo 3
    border: 'border-blueGreen-300' 
  },
  { 
    titleColor: '#8dc1bb', // blueGreen-200 (40%) - Grupo 4
    border: 'border-blueGreen-200' 
  },
];

export default function ServiceCategory({ title, services, language, categoryIndex }: ServiceCategoryProps) {
  const colors = categoryColors[categoryIndex] || categoryColors[0];

  return (
    <section className="mb-16">
      {/* Título de categoría con color exacto */}
      <h2 
        className="text-3xl font-bold mb-8 text-center"
        style={{ color: colors.titleColor }}
      >
        {language === 'en' ? title.en : title.es}
      </h2>
      
      {/* Grid de servicios - más compacto */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {services.map((service) => (
          <ServiceCard
            key={service.id}
            name={service.name}
            description={service.description}
            icon={service.icon}
            language={language}
            borderColorClass={colors.border}
          />
        ))}
      </div>
    </section>
  );
}
