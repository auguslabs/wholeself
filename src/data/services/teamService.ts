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
 * 
 * NOTA: La mejor práctica es editar el JSON directamente con los caracteres correctos (UTF-8).
 * Esta función corrige casos donde los caracteres ya están mal codificados en el archivo.
 */
function normalizeSpecialCharacters(text: string): string {
  if (!text) return text;
  
  let normalized = text;
  
  // Lista de nombres del equipo para correcciones precisas de posesivos
  const teamNames = [
    'Allie', 'Andrea', 'Chavonne', 'Clare', 'Jade', 'Katherine', 
    'Esperanza', 'Sonia', 'Dulce', 'Paola', 'Ayanna', 'Amy', 
    'Diana', 'Itzel', 'Lucia', 'Luis', 'Mikaylah', 'Sean', 'Scarlett',
    'Alexandria', 'Charlycia', 'Darbus', 'Jane', 'Mikaylah'
  ];
  
  // Primero: Corregir posesivos de nombres del equipo
  // Patrón: "Nombre +  + s" -> "Nombre's"
  // También detecta casos donde falta el apóstrofe completamente
  teamNames.forEach(name => {
    // Caso 1: "Nombre + carácter mal codificado + s" -> "Nombre's"
    const regex1 = new RegExp(`\\b${name}[^a-zA-Z]s\\b`, 'gi');
    normalized = normalized.replace(regex1, `${name}'s`);
    
    // Caso 2: "Nombres" (sin apóstrofe) -> "Nombre's" (solo si es posesivo, no plural)
    // Esto es más conservador para evitar falsos positivos
    const regex2 = new RegExp(`\\b${name}s\\b(?=\\s+(?:clinical|practice|work|degree|experience|approach))`, 'gi');
    normalized = normalized.replace(regex2, `${name}'s`);
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
    // Nota: Estos códigos Unicode son para cuando los caracteres están mal codificados.
    // Si editas el JSON directamente con los caracteres correctos (á, é, í, ó, ú), no necesitas estos códigos.
    .replace(/\u00E1/g, 'á')  // á (a con acento agudo)
    .replace(/\u00E9/g, 'é')  // é (e con acento agudo)
    .replace(/\u00ED/g, 'í')  // í (i con acento agudo)
    .replace(/\u00F3/g, 'ó')  // ó (o con acento agudo)
    .replace(/\u00FA/g, 'ú')  // ú (u con acento agudo)
    .replace(/\u00C1/g, 'Á')  // Á (A mayúscula con acento agudo)
    .replace(/\u00C9/g, 'É')  // É (E mayúscula con acento agudo)
    .replace(/\u00CD/g, 'Í')  // Í (I mayúscula con acento agudo)
    .replace(/\u00D3/g, 'Ó')  // Ó (O mayúscula con acento agudo)
    .replace(/\u00DA/g, 'Ú')  // Ú (U mayúscula con acento agudo)
    // Ñ (eñe)
    .replace(/\u00F1/g, 'ñ')  // ñ (n con tilde minúscula)
    .replace(/\u00D1/g, 'Ñ')  // Ñ (N con tilde mayúscula)
    // Signos de interrogación y exclamación invertidos (español)
    .replace(/\u00A1/g, '¡')  // ¡ (signo de exclamación invertido)
    .replace(/\u00BF/g, '¿')  // ¿ (signo de interrogación invertido)
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
 * Orden específico según la lista proporcionada
 */
function sortTeamMembers(members: TeamMember[]): TeamMember[] {
  // Orden específico según la lista proporcionada
  const customOrder = [
    'Chavonne-McClay',      // 1. Chavonne
    'Andrea-Lucero',        // 2. Andrea
    'Jade-Sanchez',         // 3. Jade
    'Katherine-Catanach',   // 4. Katerine (Katherine)
    'Dulce-Medina',         // 5. Dulce
    'Scarlett-Cortez',      // 6. Scarlett
    'Diana-Hernandez',      // 7. Diana
    'Amy-Melendrez',        // 8. Lina (asumiendo que es Amy, si no existe Lina)
    'Charlycia-Strain',     // 9. Snoop (Charlycia "Snoop" Strain)
    'Sonia-Ramirez',        // 10. Sonia
    'Clare-Guerreiro',      // 11. Clare
    'Darbus',               // 12. Darbus
    'Lucia-Fraire',         // 13. Lucia
    'Jane-Brooks',          // 14. Jane
    'Esperanza-Flores',     // 15. Esperanza
    'Ayanna-Brown',         // 16. Ayanna
    'Luis-Alvarado',        // 17. Luis
    'Itzel-Gutierrez',      // 18. Itzel
    'Paola-Monarrez',       // 19. Paola
    'Mikaylah-Campbell',    // 20. Mikaylah
    'Sean-Cardinalli',      // 21. Sean
    'Alexandria-Rakes',     // Alexandria "Allie" (si no está en la lista, se agrega al final)
  ];

  // Crear un mapa para acceso rápido
  const memberMap = new Map<string, TeamMember>();
  members.forEach(member => {
    memberMap.set(member.photoFilename, member);
  });

  // Construir la lista ordenada
  const orderedMembers: TeamMember[] = [];
  const addedMembers = new Set<string>();

  // Agregar miembros en el orden especificado
  customOrder.forEach(photoFilename => {
    const member = memberMap.get(photoFilename);
    if (member) {
      orderedMembers.push(member);
      addedMembers.add(photoFilename);
    }
  });

  // Agregar cualquier miembro que no esté en la lista al final
  members.forEach(member => {
    if (!addedMembers.has(member.photoFilename)) {
      orderedMembers.push(member);
    }
  });

  return orderedMembers;
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
