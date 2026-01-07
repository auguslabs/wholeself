/**
 * Condition Navigation Component
 * 
 * Navegación sutil entre todas las condiciones que soportamos
 */

import { renderIcon } from './iconHelper';
import type { LocalizedText } from '@/data/models/ContentPage';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

interface Condition {
  id: string;
  name: LocalizedText;
  icon: string;
  link: string;
}

interface ConditionNavigationProps {
  conditions: Condition[];
  currentConditionId: string;
  language: 'en' | 'es';
}

export default function ConditionNavigation({ conditions, currentConditionId, language }: ConditionNavigationProps) {
  const currentIndex = conditions.findIndex(c => c.id === currentConditionId);
  const prevCondition = currentIndex > 0 ? conditions[currentIndex - 1] : null;
  const nextCondition = currentIndex < conditions.length - 1 ? conditions[currentIndex + 1] : null;

  return (
    <div className="py-8 border-t border-b border-gray-200 my-8">
      {/* Navegación anterior/siguiente */}
      <div className="flex justify-between items-center mb-6">
        {prevCondition ? (
          <a
            href={prevCondition.link}
            className="group flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-blueGreen-600 transition-colors"
          >
            <ChevronLeftIcon className="w-4 h-4" />
            <span>{language === 'en' ? 'Previous' : 'Anterior'}</span>
            <span className="hidden sm:inline">
              {language === 'en' ? prevCondition.name.en : prevCondition.name.es}
            </span>
          </a>
        ) : (
          <div></div>
        )}
        
        {nextCondition ? (
          <a
            href={nextCondition.link}
            className="group flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-blueGreen-600 transition-colors"
          >
            <span className="hidden sm:inline">
              {language === 'en' ? nextCondition.name.en : nextCondition.name.es}
            </span>
            <span>{language === 'en' ? 'Next' : 'Siguiente'}</span>
            <ChevronRightIcon className="w-4 h-4" />
          </a>
        ) : (
          <div></div>
        )}
      </div>

      {/* Grid de todas las condiciones */}
      <div>
        <p className="text-sm font-medium text-gray-600 mb-4 text-center">
          {language === 'en' ? 'Explore other conditions we support:' : 'Explora otras condiciones que apoyamos:'}
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3">
          {conditions.map((condition) => {
            const isActive = condition.id === currentConditionId;
            return (
              <a
                key={condition.id}
                href={condition.link}
                className={`
                  group flex flex-col items-center gap-2 p-3 rounded-lg transition-all duration-200
                  ${isActive 
                    ? 'bg-blueGreen-100 border-2 border-blueGreen-500' 
                    : 'bg-gray-50 border-2 border-transparent hover:bg-blueGreen-50 hover:border-blueGreen-300'
                  }
                `}
              >
                <div 
                  className={`
                    w-10 h-10 rounded-lg flex items-center justify-center transition-all
                    ${isActive 
                      ? 'bg-blueGreen-500' 
                      : 'bg-white border-2 border-blueGreen-500 group-hover:bg-blueGreen-500'
                    }
                  `}
                >
                  <div className={isActive ? 'text-white' : 'text-blueGreen-500 group-hover:text-white'}>
                    {renderIcon(condition.icon, 'w-5 h-5')}
                  </div>
                </div>
                <span 
                  className={`
                    text-xs font-medium text-center leading-tight
                    ${isActive ? 'text-blueGreen-700' : 'text-gray-700 group-hover:text-blueGreen-600'}
                  `}
                >
                  {language === 'en' ? condition.name.en : condition.name.es}
                </span>
              </a>
            );
          })}
        </div>
      </div>
    </div>
  );
}
