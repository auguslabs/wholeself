/**
 * Servicio de contenido desde BD (solo servidor).
 * Lee page_content y team_members. Usado cuando PUBLIC_USE_CONTENT_FROM_BD está activo.
 */

import type { ContentPage } from '../models/ContentPage';
import type { TeamMember, LanguageType } from '../models/TeamMember';
import { getDbConnection } from '@/lib/db.server';

const pageCache = new Map<string, ContentPage>();
let teamCache: TeamMember[] | null = null;

function rowToTeamMember(row: Record<string, unknown>): TeamMember {
  return {
    id: String(row.id ?? ''),
    photoFilename: String(row.photo_filename ?? ''),
    firstName: String(row.first_name ?? ''),
    lastName: String(row.last_name ?? ''),
    credentials: String(row.credentials ?? ''),
    pronouns: String(row.pronouns ?? ''),
    role: String(row.role ?? ''),
    roleEs: row.role_es != null ? String(row.role_es) : undefined,
    language: (row.language as LanguageType) ?? 'english',
    descriptionEn: String(row.description_en ?? ''),
    descriptionEs: String(row.description_es ?? ''),
    displayOrder: Number(row.display_order) ?? 0,
  };
}

export async function getPageContentFromDb(
  pageId: string,
  _locale?: 'en' | 'es'
): Promise<ContentPage> {
  const cacheKey = pageId;
  if (pageCache.has(cacheKey)) {
    return pageCache.get(cacheKey)!;
  }
  const conn = await getDbConnection();
  try {
    const [rows] = await conn.execute<{ meta: string; seo: string; content: string }[]>(
      'SELECT meta, seo, content FROM page_content WHERE page_id = ? LIMIT 1',
      [pageId]
    );
    const row = Array.isArray(rows) ? rows[0] : (rows as any)?.[0];
    if (!row) {
      throw new Error(`Page not found in DB: ${pageId}`);
    }
    const page: ContentPage = {
      meta: typeof row.meta === 'string' ? JSON.parse(row.meta) : row.meta,
      seo: typeof row.seo === 'string' ? JSON.parse(row.seo) : row.seo,
      content: typeof row.content === 'string' ? JSON.parse(row.content) : row.content,
    };
    pageCache.set(cacheKey, page);
    return page;
  } finally {
    await conn.end().catch(() => {});
  }
}

export async function getSharedContentFromDb(type: 'header' | 'footer'): Promise<ContentPage> {
  const pageId = type === 'header' ? 'shared-header' : 'shared-footer';
  return getPageContentFromDb(pageId);
}

export async function getTeamMembersFromDb(): Promise<TeamMember[]> {
  if (teamCache) return teamCache;
  const conn = await getDbConnection();
  try {
    const [rows] = await conn.execute<Record<string, unknown>[]>(
      'SELECT id, photo_filename, first_name, last_name, credentials, pronouns, role, role_es, language, description_en, description_es, display_order FROM team_members ORDER BY display_order ASC'
    );
    const list = Array.isArray(rows) ? rows : (rows as any) ?? [];
    const members = list.map((r) => rowToTeamMember(r));
    teamCache = members;
    return members;
  } finally {
    await conn.end().catch(() => {});
  }
}
