/**
 * Service Card Component
 * 
 * Tarjeta individual que muestra un servicio con icono, título y descripción
 */

import { renderIcon } from './iconHelper';
import { getLocalizedText } from '@/data/models/ContentPage';
import type { LocalizedText } from '@/data/models/ContentPage';

interface ServiceCardProps {
  name: LocalizedText;
  description: LocalizedText;
  icon: string;
  language: 'en' | 'es';
  borderColorClass?: string;
}

// Colores para rotar entre los iconos y fondos
const iconColors = [
  { icon: 'text-tealBlue-500', bg: 'bg-tealBlue-50' },
  { icon: 'text-navy-500', bg: 'bg-navy-50' },
  { icon: 'text-blueGreen-500', bg: 'bg-blueGreen-50' },
  { icon: 'text-tealBlue-600', bg: 'bg-tealBlue-100' },
  { icon: 'text-navy-600', bg: 'bg-navy-100' },
];

export default function ServiceCard({ name, description, icon, language, borderColorClass = 'border-blueGreen-500' }: ServiceCardProps) {
  // Mapa de colores para estilos inline usando los colores del tema
  // Estos colores corresponden a blueGreen-500, 400, 300, 200
  const colorMap: Record<string, string> = {
    'border-blueGreen-500': '#3e9791', // blueGreen-500 (base)
    'border-blueGreen-400': '#4da59f', // blueGreen-400 (más claro)
    'border-blueGreen-300': '#6db3ad', // blueGreen-300 (aún más claro)
    'border-blueGreen-200': '#8dc1bb', // blueGreen-200 (muy claro)
  };

  const categoryColor = colorMap[borderColorClass] || '#3e9791';
  const borderColor = categoryColor;

  return (
    <div 
      className="group bg-white rounded-lg p-3 shadow-sm hover:shadow-md transition-all duration-300 border-l-4 border-t border-r border-b border-gray-100 flex flex-row gap-3 items-start"
      style={{ borderLeftColor: borderColor, borderLeftWidth: '4px' }}
    >
      {/* Icono con fondo del color de la categoría - Columna izquierda */}
      <div 
        className="flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center transition-all group-hover:scale-105 border-2"
        style={{ 
          backgroundColor: categoryColor,
          borderColor: categoryColor
        }}
      >
        <div className="text-white">
          {renderIcon(icon, 'w-5 h-5')}
        </div>
      </div>
      
      {/* Contenido - Columna derecha */}
      <div className="flex-1 min-w-0">
        {/* Título */}
        <h3 className="text-base font-bold text-navy-900 mb-0.5 leading-tight">
          {getLocalizedText(name, language)}
        </h3>
        
        {/* Descripción - más corta y compacta */}
        <p className="text-gray-600 text-xs leading-snug" style={{
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden'
        }}>
          {getLocalizedText(description, language)}
        </p>
      </div>
    </div>
  );
}
