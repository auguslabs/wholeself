'use client';

import React, { useState, useEffect } from 'react';
import type { TeamMember, PhotoType, LanguageType } from '@/data/models/TeamMember';
import { getTeamMembers } from '@/data/services/teamService';
import { TeamHero } from './TeamHero';
import { LanguageFilter } from './LanguageFilter';
import { TeamGrid } from './TeamGrid';
import { TeamMemberModal } from './TeamMemberModal';

interface TeamSectionProps {
  photoType: PhotoType;
  variant?: 'v1' | 'v2' | 'v3';
}

/**
 * Componente principal que orquesta toda la sección del equipo
 */
export function TeamSection({ photoType, variant = 'v1' }: TeamSectionProps) {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [filteredLanguage, setFilteredLanguage] = useState<LanguageType | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [pageLanguage, setPageLanguage] = useState<'en' | 'es'>('en');

  useEffect(() => {
    async function loadMembers() {
      try {
        console.log('🔄 Loading team members...');
        const data = await getTeamMembers();
        console.log(`✅ Loaded ${data.length} members:`, data);
        setMembers(data);
        if (data.length === 0) {
          console.warn('⚠️ No team members loaded!');
        }
      } catch (error) {
        console.error('❌ Error loading team members:', error);
      } finally {
        setLoading(false);
      }
    }

    loadMembers();
  }, []);

  // Detectar idioma de la página
  useEffect(() => {
    // Detectar desde el atributo lang del HTML
    const htmlLang = document.documentElement.lang || 'es';
    // Detectar desde el navegador como fallback
    const browserLang = navigator.language || navigator.languages?.[0] || 'en';
    
    // Si el HTML está en español o el navegador es español, usar español
    if (htmlLang.startsWith('es') || browserLang.startsWith('es')) {
      setPageLanguage('es');
    } else {
      setPageLanguage('en');
    }
  }, []);

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
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-navy-600">Loading team members...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <TeamHero />
      
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          {/* Filtro de idiomas */}
          <div className="mb-8 md:mb-12">
            <LanguageFilter onFilterChange={handleFilterChange} />
          </div>

          {/* Grid de miembros */}
          <TeamGrid
            members={members}
            photoType={photoType}
            variant={variant}
            filteredLanguage={filteredLanguage}
            onMemberClick={handleMemberClick}
          />
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
