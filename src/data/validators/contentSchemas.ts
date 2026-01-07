/**
 * Esquemas de Validación - Content Schemas
 * 
 * Validación de estructura de datos usando Zod.
 * Detecta errores antes de guardar y proporciona autocompletado.
 */

import { z } from 'zod';

/**
 * Esquema para texto localizado (en/es)
 */
export const LocalizedTextSchema = z.object({
  en: z.string(),
  es: z.string(),
});

/**
 * Esquema para array localizado (en/es)
 */
export const LocalizedArraySchema = z.object({
  en: z.array(z.string()),
  es: z.array(z.string()),
}).optional();

/**
 * Esquema para metadatos de página
 */
export const ContentMetaSchema = z.object({
  pageId: z.string(),
  lastUpdated: z.string().datetime(), // ISO 8601
  version: z.number().int().positive(),
});

/**
 * Esquema para contenido SEO
 */
export const SEOContentSchema = z.object({
  title: LocalizedTextSchema,
  description: LocalizedTextSchema,
  keywords: LocalizedArraySchema,
});

/**
 * Esquema base para ContentPage
 * El campo 'content' es flexible ya que cada página tiene estructura diferente
 */
export const ContentPageSchema = z.object({
  meta: ContentMetaSchema,
  seo: SEOContentSchema,
  content: z.record(z.any()), // Estructura específica por página
});

/**
 * Esquema para TeamMember
 */
export const TeamMemberSchema = z.object({
  id: z.string(),
  photoFilename: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  credentials: z.string(),
  pronouns: z.string(),
  role: z.string(),
  language: z.enum(['english', 'spanish', 'bilingual']),
  descriptionEn: z.string(),
  descriptionEs: z.string(),
  displayOrder: z.number().int().positive(),
});

/**
 * Esquema para datos de equipo (estructura completa)
 */
export const TeamDataSchema = ContentPageSchema.extend({
  content: z.object({
    team_members: z.array(TeamMemberSchema),
  }),
});

/**
 * Valida un ContentPage
 * @param data Datos a validar
 * @returns Datos validados o lanza error
 */
export function validateContentPage(data: unknown) {
  return ContentPageSchema.parse(data);
}

/**
 * Valida datos de equipo
 * @param data Datos a validar
 * @returns Datos validados o lanza error
 */
export function validateTeamData(data: unknown) {
  return TeamDataSchema.parse(data);
}

/**
 * Valida de forma segura (no lanza error, retorna resultado)
 * @param data Datos a validar
 * @returns Objeto con success y data/error
 */
export function safeValidateContentPage(data: unknown) {
  const result = ContentPageSchema.safeParse(data);
  return result;
}

/**
 * Valida de forma segura datos de equipo
 * @param data Datos a validar
 * @returns Objeto con success y data/error
 */
export function safeValidateTeamData(data: unknown) {
  const result = TeamDataSchema.safeParse(data);
  return result;
}
