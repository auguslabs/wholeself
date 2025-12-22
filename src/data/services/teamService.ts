/**
 * Servicio de Datos - Team Members
 * 
 * Lee los datos de los miembros del equipo desde JSON.
 * Preparado para migrar a API cuando esté lista la BD.
 */

import type { TeamMember, LanguageType } from '../models/TeamMember';

interface TeamData {
  team_members: TeamMember[];
}

let cachedData: TeamMember[] | null = null;

/**
 * Carga los datos del equipo desde JSON
 */
async function loadTeamData(): Promise<TeamMember[]> {
  if (cachedData) {
    return cachedData;
  }

  try {
    // Intentar cargar desde public usando fetch (para cliente)
    if (typeof window !== 'undefined') {
      try {
        const response = await fetch('/team_members_info.json');
        if (response.ok) {
          const data = await response.json();
          if (data && data.team_members && Array.isArray(data.team_members)) {
            cachedData = data.team_members;
            console.log(`✅ Loaded ${cachedData.length} team members from JSON`);
            return cachedData;
          }
        } else {
          console.warn('Failed to fetch team_members_info.json, trying fallback...');
        }
      } catch (fetchError) {
        console.warn('Fetch error, trying fallback:', fetchError);
      }
    }
    
    // Fallback: importación directa (para servidor o si fetch falla)
    try {
      const data = await import('../../../sectionsplan/team/data.json');
      if (data && data.default && data.default.team_members) {
        cachedData = data.default.team_members;
        console.log(`✅ Loaded ${cachedData.length} team members from sectionsplan`);
        return cachedData;
      }
    } catch (importError) {
      console.error('Import error:', importError);
    }
    
    console.error('No data could be loaded from any source');
    return [];
  } catch (error) {
    console.error('Error loading team data:', error);
    return [];
  }
}

/**
 * Obtiene todos los miembros del equipo
 * @param language Filtro opcional por idioma
 */
export async function getTeamMembers(language?: LanguageType): Promise<TeamMember[]> {
  const members = await loadTeamData();
  
  if (!language) {
    return members.sort((a, b) => a.displayOrder - b.displayOrder);
  }
  
  return members
    .filter(member => member.language === language)
    .sort((a, b) => a.displayOrder - b.displayOrder);
}

/**
 * Obtiene un miembro por ID
 */
export async function getTeamMemberById(id: string): Promise<TeamMember | null> {
  const members = await loadTeamData();
  return members.find(m => m.id === id) || null;
}

/**
 * Limpia el cache (útil para desarrollo)
 */
export function clearCache(): void {
  cachedData = null;
}
