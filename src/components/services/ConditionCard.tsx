/**
 * Condition Card Component
 * 
 * Tarjeta individual que muestra una condición con icono, título, descripción y enlace
 */

import { renderIcon } from './iconHelper';
import { getLocalizedText } from '@/data/models/ContentPage';
import type { LocalizedText } from '@/data/models/ContentPage';
import { ArrowRightIcon } from '@heroicons/react/24/outline';
import { withLocalePath } from '@/utils/i18n';

interface ConditionCardProps {
  name: LocalizedText;
  description: LocalizedText;
  icon: string | LocalizedText;
  link: string;
  language: 'en' | 'es';
}

export default function ConditionCard({ name, description, icon, link, language }: ConditionCardProps) {
  const iconStr = typeof icon === 'string' ? icon : getLocalizedText(icon, language);
  const conditionColor = '#3e9791'; // blueGreen-500
  
  return (
    <a
      href={withLocalePath(link, language)}
      className="group bg-white rounded-lg p-3 shadow-sm hover:shadow-md transition-all duration-300 border-2 flex flex-row gap-3 items-start hover:-translate-y-0.5"
      style={{ borderColor: conditionColor }}
    >
      {/* Icono con fondo blanco y borde verde - Columna izquierda */}
      <div 
        className="flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center transition-all group-hover:scale-105 border-2 bg-white"
        style={{ 
          borderColor: conditionColor
        }}
      >
        <div style={{ color: conditionColor }}>
          {renderIcon(iconStr, 'w-5 h-5')}
        </div>
      </div>
      
      {/* Contenido - Columna derecha */}
      <div className="flex-1 min-w-0">
        {/* Título */}
        <h3 className="text-base font-bold text-navy-900 mb-0.5 leading-tight">
          {getLocalizedText(name, language)}
        </h3>
        
        {/* Descripción - más corta y compacta */}
        <p className="text-gray-600 text-xs leading-snug mb-1" style={{
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden'
        }}>
          {getLocalizedText(description, language)}
        </p>
        
        {/* Enlace "Learn More" */}
        <div className="flex items-center text-xs font-medium" style={{ color: conditionColor }}>
          <span>{language === 'en' ? 'Learn More' : 'Saber Más'}</span>
          <ArrowRightIcon className="w-3 h-3 ml-1 group-hover:translate-x-1 transition-transform" />
        </div>
      </div>
    </a>
  );
}
