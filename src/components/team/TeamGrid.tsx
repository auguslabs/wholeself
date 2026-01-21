import React from 'react';
import type { TeamMember, PhotoType, LanguageType } from '@/data/models/TeamMember';
import { TeamMemberCard } from './TeamMemberCard';

interface TeamGridProps {
  members: TeamMember[];
  photoType: PhotoType;
  variant?: 'v1' | 'v2' | 'v3';
  filteredLanguage?: LanguageType | null;
  pageLanguage?: 'en' | 'es';
  onMemberClick?: (member: TeamMember) => void;
}

/**
 * Grid responsive de miembros del equipo
 * 1 columna en móvil, 2 en tablet, 3 en desktop
 * (Ajustado para tarjetas horizontales)
 */
export function TeamGrid({
  members,
  photoType,
  variant = 'v1',
  filteredLanguage,
  pageLanguage = 'en',
  onMemberClick,
}: TeamGridProps) {
  // Filtrar miembros si hay un filtro de idioma
  let filteredMembers = members;
  
  if (filteredLanguage) {
    if (filteredLanguage === 'english') {
      // Para English: mostrar todos excepto Dulce
      filteredMembers = members.filter((m) => m.photoFilename !== 'Dulce-Medina');
    } else {
      // Para Español: mostrar solo los que tienen language === 'spanish'
      filteredMembers = members.filter((m) => m.language === filteredLanguage);
    }
  }

  if (filteredMembers.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-navy-600 text-lg">
          {pageLanguage === 'es'
            ? 'No se encontraron miembros con el filtro seleccionado.'
            : 'No team members found with the selected filter.'}
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 px-4 md:px-0">
      {filteredMembers.map((member) => (
        <TeamMemberCard
          key={member.id}
          member={member}
          photoType={photoType}
          variant={variant}
          language={pageLanguage}
          onClick={onMemberClick ? () => onMemberClick(member) : undefined}
        />
      ))}
    </div>
  );
}
