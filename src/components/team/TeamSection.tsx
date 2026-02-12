'use client';

import React, { useState, useEffect } from 'react';
import type { TeamMember, PhotoType, LanguageType } from '@/data/models/TeamMember';
import { getTeamMembers } from '@/data/services/teamService';
import { TeamHeroCollage } from './TeamHeroCollage';
import { TeamHero } from './TeamHero';
import { LanguageFilter } from './LanguageFilter';
import { TeamGrid } from './TeamGrid';
import { TeamMemberModal } from './TeamMemberModal';

interface TeamSectionProps {
  photoType: PhotoType;
  variant?: 'v1' | 'v2' | 'v3';
  pageLanguage?: 'en' | 'es';
  /** Miembros precargados desde la página (p. ej. desde BD en servidor). Si se pasan, no se llama a getTeamMembers(). */
  initialMembers?: TeamMember[];
}

/**
 * Componente principal que orquesta toda la sección del equipo
 */
export function TeamSection({ photoType, variant = 'v1', pageLanguage = 'en', initialMembers }: TeamSectionProps) {
  const [members, setMembers] = useState<TeamMember[]>(initialMembers ?? []);
  const [filteredLanguage, setFilteredLanguage] = useState<LanguageType | null>(null);
  const [loading, setLoading] = useState(!(initialMembers && initialMembers.length > 0));
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);

  useEffect(() => {
    if (initialMembers && initialMembers.length > 0) return;
    async function loadMembers() {
      try {
        console.log('🔄 Loading team members...');
        const data = await getTeamMembers();
        console.log(`✅ Loaded ${data.length} members:`, data);
        setMembers(data);
        if (data.length === 0) {
          console.warn('⚠️ No team members loaded!');
        } else {
          console.log('✅ Team members loaded successfully:', data.length);
        }
      } catch (error) {
        console.error('❌ Error loading team members:', error);
        setMembers([]); // Asegurar que members esté vacío en caso de error
      } finally {
        setLoading(false);
      }
    }

    loadMembers();
  }, [initialMembers]);

  const handleFilterChange = (language: LanguageType | null) => {
    setFilteredLanguage(language);
  };

  // Obtener lista de miembros filtrados para navegación en el modal
  const getFilteredMembersForNavigation = (): TeamMember[] => {
    if (!filteredLanguage) {
      // Si no hay filtro, todos excepto Dulce para English
      return members.filter((m) => m.photoFilename !== 'Dulce-Medina');
    }
    
    if (filteredLanguage === 'english') {
      // Para English: todos excepto Dulce
      return members.filter((m) => m.photoFilename !== 'Dulce-Medina');
    }
    
    // Para Español: solo los que tienen language === 'spanish'
    return members.filter((m) => m.language === filteredLanguage);
  };

  const handleMemberClick = (member: TeamMember) => {
    console.log('👤 Member clicked:', member);
    setSelectedMember(member);
  };

  const handleCloseModal = () => {
    setSelectedMember(null);
  };

  const handleMemberChange = (newMember: TeamMember) => {
    setSelectedMember(newMember);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <p className="text-navy-600 text-lg">
          {pageLanguage === 'es' ? 'Cargando miembros del equipo...' : 'Loading team members...'}
        </p>
      </div>
    );
  }

  // Mostrar mensaje si no hay miembros
  if (members.length === 0) {
    return (
      <div className="min-h-screen bg-white">
        <TeamHero language={pageLanguage} />
        <section className="py-12 md:py-16">
          <div className="container mx-auto px-4">
            <div className="text-center py-12">
              <p className="text-navy-600 text-lg">
                {pageLanguage === 'es'
                  ? 'No se encontraron miembros del equipo. Revisa la fuente de datos.'
                  : 'No team members found. Please check the data source.'}
              </p>
            </div>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="bg-white w-full" style={{ minHeight: 'auto' }}>
      <TeamHeroCollage language={pageLanguage} initialMembers={initialMembers} />
      
      <section className="py-12 md:py-16 w-full">
        <div className="container mx-auto px-4 w-full">
          {/* Filtro de idiomas */}
          <div className="mb-8 md:mb-12">
            <LanguageFilter onFilterChange={handleFilterChange} language={pageLanguage} />
          </div>

          {/* Grid de miembros */}
          {members.length > 0 && (
            <TeamGrid
              members={members}
              photoType={photoType}
              variant={variant}
              filteredLanguage={filteredLanguage}
              pageLanguage={pageLanguage}
              onMemberClick={handleMemberClick}
            />
          )}
        </div>
      </section>

      {/* Modal de información del terapeuta */}
      <TeamMemberModal
        member={selectedMember}
        allMembers={getFilteredMembersForNavigation()}
        photoType={photoType}
        isOpen={!!selectedMember}
        onClose={handleCloseModal}
        onMemberChange={handleMemberChange}
        pageLanguage={pageLanguage}
      />
    </div>
  );
}
