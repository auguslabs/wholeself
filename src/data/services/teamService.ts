/**
 * Servicio de Datos - Team Members
 * 
 * Lee los datos de los miembros del equipo desde JSON.
 * Preparado para migrar a API cuando esté lista la BD.
 */

import type { TeamMember, LanguageType } from '../models/TeamMember';
import { normalizeLanguage } from '../models/TeamMember';

interface TeamData {
  team_members: TeamMember[];
}

let cachedData: TeamMember[] | null = null;

/**
 * Normaliza caracteres especiales que pueden estar mal codificados
 * Corrige apóstrofes, comillas y caracteres especiales comunes
 * Maneja diferentes codificaciones incorrectas (Windows-1252, ISO-8859-1, etc.)
 * 
 * El carácter de reemplazo Unicode () aparece cuando hay problemas de codificación UTF-8
 */
function normalizeSpecialCharacters(text: string): string {
  if (!text) return text;
  
  let normalized = text;
  
  // Lista de nombres del equipo para correcciones precisas de posesivos
  const teamNames = [
    'Allie', 'Andrea', 'Chavonne', 'Clare', 'Jade', 'Katherine', 
    'Esperanza', 'Sonia', 'Dulce', 'Paola', 'Ayanna', 'Amy', 
    'Diana', 'Itzel', 'Lucia', 'Luis', 'Mikaylah', 'Sean', 'Scarlett'
  ];
  
  // Primero: Corregir posesivos de nombres del equipo
  // Patrón: "Nombre +  + s" -> "Nombre's"
  teamNames.forEach(name => {
    const regex = new RegExp(`\\b${name}s\\b`, 'gi');
    normalized = normalized.replace(regex, `${name}'s`);
  });
  
  // Segundo: Corregir caracteres de reemplazo Unicode () directamente
  // Estos aparecen cuando un carácter especial no se pudo decodificar
  // El carácter de reemplazo Unicode es \uFFFD (65533 en decimal)
  normalized = normalized
    // Detectar y corregir apóstrofes mal codificados
    // Patrón: carácter de reemplazo Unicode + letra -> apóstrofe + letra
    // Usar código Unicode del carácter de reemplazo: \uFFFD
    .replace(/\uFFFD(?=s\b)/g, "'")  //  + s -> 's (solo cuando hay  antes de s)
    .replace(/\uFFFD(?=t\b)/g, "'")  //  + t -> 't
    .replace(/\uFFFD(?=re\b)/g, "'") //  + re -> 're
    .replace(/\uFFFD(?=ve\b)/g, "'") //  + ve -> 've
    .replace(/\uFFFD(?=ll\b)/g, "'") //  + ll -> 'll
    .replace(/\uFFFD(?=d\b)/g, "'")  //  + d -> 'd
    .replace(/\uFFFD(?=m\b)/g, "'")  //  + m -> 'm
    // Apóstrofes directos mal codificados (diferentes variantes)
    // Reemplazar cualquier carácter de reemplazo Unicode restante por apóstrofe
    .replace(/\uFFFD/g, "'")  // Carácter de reemplazo Unicode estándar
    // También puede aparecer como símbolo visible (carácter de reemplazo)
    .replace(/[\uFFFD]/g, "'")  // Cualquier variante del carácter de reemplazo
    // Apóstrofes en diferentes codificaciones incorrectas (usando códigos Unicode)
    .replace(/\u2018/g, "'")  // Left single quotation mark
    .replace(/\u2019/g, "'")  // Right single quotation mark
    .replace(/\u201A/g, "'")  // Single low-9 quotation mark
    .replace(/\u201B/g, "'")  // Single high-reversed-9 quotation mark
    // Comillas mal codificadas (usando códigos Unicode)
    .replace(/\u201C/g, '"')  // Left double quotation mark
    .replace(/\u201D/g, '"')  // Right double quotation mark
    .replace(/\u201E/g, '"')  // Double low-9 quotation mark
    .replace(/\u201F/g, '"')  // Double high-reversed-9 quotation mark
    .replace(/\u2033/g, '"')  // Double prime
    .replace(/\u2036/g, '"')  // Reversed double prime
    // Vocales acentuadas en español (usando códigos Unicode para caracteres mal codificados)
    .replace(/\u00E1/g, 'á')  // á
    .replace(/\u00E9/g, 'é')  // é
    .replace(/\u00ED/g, 'í')  // í
    .replace(/\u00F3/g, 'ó')  // ó
    .replace(/\u00FA/g, 'ú')  // ú
    .replace(/\u00C1/g, 'Á')  // Á
    .replace(/\u00C9/g, 'É')  // É
    .replace(/\u00CD/g, 'Í')  // Í
    .replace(/\u00D3/g, 'Ó')  // Ó
    .replace(/\u00DA/g, 'Ú')  // Ú
    // Ñ
    .replace(/\u00F1/g, 'ñ')  // ñ
    .replace(/\u00D1/g, 'Ñ')  // Ñ
    // Signos de interrogación y exclamación
    .replace(/\u00A1/g, '¡')  // ¡
    .replace(/\u00BF/g, '¿')  // ¿
    // Otros caracteres comunes
    .replace(/\u2013/g, '–')  // en dash
    .replace(/\u2014/g, '—')  // em dash
    .replace(/\u2026/g, '…')  // ellipsis
    .replace(/\u00B0/g, '°')  // degree
    .replace(/\u20AC/g, '€')  // euro
    .replace(/\u00A3/g, '£')  // pound
    .replace(/\u00A9/g, '©')  // copyright
    .replace(/\u00AE/g, '®')  // registered
    .replace(/\u2122/g, '™'); // trademark
  
  // Tercero: Correcciones específicas para casos conocidos
  const specificFixes: Array<[RegExp, string]> = [
    // Contracciones comunes
    [/\bcant\b/gi, "can't"],
    [/\bdont\b/gi, "don't"],
    [/\bwont\b/gi, "won't"],
    [/\bits\b/gi, "it's"],
    [/\bthats\b/gi, "that's"],
    [/\bwhats\b/gi, "what's"],
    [/\btheres\b/gi, "there's"],
    [/\bheres\b/gi, "here's"],
    [/\bwheres\b/gi, "where's"],
    [/\bwhos\b/gi, "who's"],
    [/\byoure\b/gi, "you're"],
    [/\btheyre\b/gi, "they're"],
    [/\bwere\b/gi, "we're"],
    [/\bshes\b/gi, "she's"],
    [/\bhes\b/gi, "he's"],
    // Inicios de oraciones en español
    [/\bHola!/g, "¡Hola!"],
    [/\bConozcan\b/g, "¡Conozcan"],
    [/\bBienvenidos!/g, "¡Bienvenidos!"],
  ];
  
  specificFixes.forEach(([pattern, replacement]) => {
    normalized = normalized.replace(pattern, replacement);
  });
  
  return normalized;
}

/**
 * Normaliza todos los campos de texto de un miembro del equipo
 */
function normalizeMemberText(member: any): TeamMember {
  return {
    ...member,
    language: normalizeLanguage(member.language),
    descriptionEn: normalizeSpecialCharacters(member.descriptionEn || ''),
    descriptionEs: normalizeSpecialCharacters(member.descriptionEs || ''),
    firstName: normalizeSpecialCharacters(member.firstName || ''),
    lastName: normalizeSpecialCharacters(member.lastName || ''),
    role: normalizeSpecialCharacters(member.role || ''),
  };
}

/**
 * Carga los datos del equipo desde JSON
 */
async function loadTeamData(): Promise<TeamMember[]> {
  if (cachedData) {
    return cachedData;
  }

  try {
    // Cargar desde el nuevo path normalizado en src/data/content/pages/team.json
    try {
      const data = await import('../content/pages/team.json');
      const teamData = data.default;
      
      // Validar estructura (debe tener meta, seo, content con team_members)
      if (teamData && teamData.meta && teamData.content && teamData.content.team_members) {
        const members: TeamMember[] = teamData.content.team_members.map((member: any) => 
          normalizeMemberText(member)
        );
        cachedData = members;
        console.log(`✅ Loaded ${members.length} team members from content/pages/team.json (normalized structure)`);
        return members;
      } else {
        console.warn('Team data structure incomplete, trying fallback...');
      }
    } catch (importError) {
      console.warn('Import error from content/pages/team.json, trying fallback...', importError);
    }
    
    // Fallback 1: Intentar desde public (para compatibilidad durante migración)
    if (typeof window !== 'undefined') {
      try {
        const response = await fetch('/team_members_info.json');
        if (response.ok) {
          const data = await response.json();
          if (data && data.team_members && Array.isArray(data.team_members)) {
            const members: TeamMember[] = data.team_members.map((member: any) => 
              normalizeMemberText(member)
            );
            cachedData = members;
            console.log(`✅ Loaded ${members.length} team members from public/team_members_info.json (fallback)`);
            return members;
          }
        }
      } catch (fetchError) {
        console.warn('Fetch error from public, trying last fallback...', fetchError);
      }
    }
    
    // Fallback 2: sectionsplan (último recurso)
    try {
      const data = await import('../../../sectionsplan/team/data.json');
      if (data && data.default && data.default.team_members) {
        const members: TeamMember[] = data.default.team_members.map((member: any) => 
          normalizeMemberText(member)
        );
        cachedData = members;
        console.log(`✅ Loaded ${members.length} team members from sectionsplan (fallback)`);
        return members;
      }
    } catch (importError) {
      console.error('Import error from sectionsplan:', importError);
    }
    
    console.error('No data could be loaded from any source');
    return [];
  } catch (error) {
    console.error('Error loading team data:', error);
    return [];
  }
}

/**
 * Función para ordenar miembros del equipo con orden personalizado
 * Los primeros 6 miembros tienen un orden específico, luego alfabético
 */
function sortTeamMembers(members: TeamMember[]): TeamMember[] {
  // Orden específico para los primeros 6 miembros
  const priorityOrder = [
    'Chavonne-McClay',    // Primera fila, primera columna
    'Andrea-Lucero',       // Primera fila, segunda columna
    'Katherine-Catanach', // Primera fila, tercera columna
    'Jade-Sanchez',       // Segunda fila, primera columna
    'Charlycia-Strain',   // Segunda fila, segunda columna
    'Dulce-Medina'        // Segunda fila, tercera columna
  ];

  // Separar miembros prioritarios y el resto
  const priorityMembers: TeamMember[] = [];
  const otherMembers: TeamMember[] = [];

  members.forEach(member => {
    const index = priorityOrder.indexOf(member.photoFilename);
    if (index !== -1) {
      priorityMembers[index] = member;
    } else {
      otherMembers.push(member);
    }
  });

  // Filtrar undefined de priorityMembers (por si falta algún miembro)
  const validPriorityMembers = priorityMembers.filter(m => m !== undefined);

  // Ordenar otros miembros alfabéticamente por nombre completo
  const sortedOtherMembers = otherMembers.sort((a, b) => {
    const nameA = `${a.firstName} ${a.lastName || ''}`.trim().toLowerCase();
    const nameB = `${b.firstName} ${b.lastName || ''}`.trim().toLowerCase();
    return nameA.localeCompare(nameB);
  });

  // Combinar: primero los prioritarios en orden, luego los demás alfabéticamente
  return [...validPriorityMembers, ...sortedOtherMembers];
}

/**
 * Obtiene todos los miembros del equipo
 * @param language Filtro opcional por idioma
 */
export async function getTeamMembers(language?: LanguageType): Promise<TeamMember[]> {
  const members = await loadTeamData();
  
  let filteredMembers = members;
  
  if (language) {
    filteredMembers = members.filter(member => member.language === language);
  }
  
  return sortTeamMembers(filteredMembers);
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
