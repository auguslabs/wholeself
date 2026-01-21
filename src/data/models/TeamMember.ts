/**
 * Modelo de Datos - Team Member
 * 
 * Define la estructura de datos para los miembros del equipo.
 */

export type LanguageType = 'english' | 'spanish' | 'bilingual';
export type PhotoType = 'rounded-decorative';

export interface TeamMember {
  id: string;
  photoFilename: string;
  firstName: string;
  lastName: string;
  credentials: string;
  pronouns: string;
  role: string;
  roleEs?: string;
  language: LanguageType;
  descriptionEn: string;
  descriptionEs: string;
  displayOrder: number;
}

/**
 * Normaliza el valor de idioma del CSV a nuestro tipo
 * Nota: "English/ Spanish" o "English/Spanish" se categoriza como "spanish"
 */
export function normalizeLanguage(lang: string): LanguageType {
  const normalized = lang.toLowerCase().trim();
  // Si contiene "spanish" (incluso si también tiene "english"), categorizar como "spanish"
  if (normalized.includes('spanish')) {
    return 'spanish';
  }
  // Si solo tiene "english" o está vacío, categorizar como "english"
  if (normalized.includes('english') || normalized === '') {
    return 'english';
  }
  // Por defecto, inglés
  return 'english';
}

/**
 * Construye el nombre completo del miembro
 */
export function getFullName(member: TeamMember): string {
  return `${member.firstName} ${member.lastName}`.trim();
}

/**
 * Obtiene la ruta de la foto según el tipo
 */
export function getPhotoPath(member: TeamMember, photoType: PhotoType): string {
  return `/${photoType}/${member.photoFilename}.webp`;
}

/**
 * Obtiene la descripción según el idioma
 */
export function getDescription(member: TeamMember, lang: 'en' | 'es'): string {
  return lang === 'es' ? member.descriptionEs : member.descriptionEn;
}

/**
 * Obtiene el rol según el idioma
 */
export function getRole(member: TeamMember, lang: 'en' | 'es'): string {
  return lang === 'es' && member.roleEs ? member.roleEs : member.role;
}
