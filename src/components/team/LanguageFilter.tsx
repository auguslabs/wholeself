import React, { useState } from 'react';
import type { LanguageType } from '@/data/models/TeamMember';

interface LanguageFilterProps {
  onFilterChange: (language: LanguageType | null) => void;
  className?: string;
}

const filterOptions: Array<{ label: string; value: LanguageType | null }> = [
  { label: 'All Team', value: null },
  { label: 'English', value: 'english' },
  { label: 'Español', value: 'spanish' },
];

/**
 * Componente de filtro de idioma elegante y sutil
 */
export function LanguageFilter({ onFilterChange, className = '' }: LanguageFilterProps) {
  const [activeFilter, setActiveFilter] = useState<LanguageType | null>(null);

  const handleFilterClick = (value: LanguageType | null) => {
    console.log('🔍 Filter clicked:', value);
    setActiveFilter(value);
    onFilterChange(value);
  };

  return (
    <div className={`flex flex-wrap justify-center gap-2 md:gap-3 ${className}`}>
      {filterOptions.map((option) => {
        const isActive = activeFilter === option.value;
        return (
          <button
            key={option.value || 'all'}
            onClick={() => handleFilterClick(option.value)}
            className={`
              px-4 py-2 rounded-full text-sm font-medium transition-all duration-300
              ${
                isActive
                  ? 'bg-tealBlue-500 text-white shadow-md'
                  : 'bg-softAquaGray-100 text-navy-700 hover:bg-softAquaGray-200'
              }
              hover:scale-105 active:scale-95
            `}
            aria-pressed={isActive}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
