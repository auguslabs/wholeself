/**
 * Servicio de Contenido - Content Service
 *
 * Fuente única: API/BD. Con PUBLIC_USE_CONTENT_FROM_BD=true el contenido se lee
 * desde la API (GET /api/content/{pageId}). No hay fallback a JSON estático:
 * si la API falla, se propaga el error para que se vea en la interfaz.
 */

import type { ContentPage } from '../models/ContentPage';
import { getLocalizedText } from '../models/ContentPage';
import { safeValidateContentPage } from '../validators/contentSchemas';
import { updateMetadata, updateLastUpdated } from '../utils/metadataUtils';
import { validateLinks } from '../utils/linkValidator';

function useContentFromDb(): boolean {
  const v = import.meta.env.PUBLIC_USE_CONTENT_FROM_BD;
  return v === 'true' || v === true;
}

/** Stub mínimo para SSR cuando la BD no está disponible en build (el cliente fetchea la API). */
function minimalPageStub(pageId: string): ContentPage {
  const now = new Date().toISOString();
  const empty = { en: '', es: '' };
  if (pageId === 'services') {
    return {
      meta: { pageId, lastUpdated: now, version: 1 },
      seo: { title: empty, description: empty },
      content: {
        quickJump: { text: empty },
        immigrationEvaluation: { text: empty },
        intro: { text: empty },
        categories: [],
        conditionsSection: null,
        ctaSection: {
          title: empty,
          subtitle: empty,
          primaryCTAs: [],
          secondaryCTA: null,
        },
      },
    };
  }
  return {
    meta: { pageId, lastUpdated: now, version: 1 },
    seo: {},
    content: {},
  };
}

/** Contenido por defecto del footer cuando la API no está o falla. Mantiene visibles todos los textos y el botón flotante de Crisis Resources (data-float-stop). */
const DEFAULT_FOOTER_CONTENT = {
  companyInfo: {
    name: { en: 'Whole Self Counseling', es: 'Whole Self Counseling' },
    tagline: { en: 'A safe space for your healing journey', es: 'Un espacio seguro para tu viaje de sanación' },
  },
  navigation: { title: { en: 'Navigation', es: 'Navegación' } },
  resources: {
    title: { en: 'Resources', es: 'Recursos' },
    items: [
      { label: { en: 'Crisis Resources', es: 'Recursos de crisis' }, link: '#', isModal: true },
      { label: { en: 'Client Portal', es: 'Portal del cliente' }, link: 'https://alvordbaker.sessionshealth.com/clients/sign_in' },
      { label: { en: 'Immigration Evaluations', es: 'Evaluaciones de inmigración' }, link: '/services/immigration-evaluations' },
      { label: { en: 'Fellowship Program', es: 'Programa Fellowship' }, link: '/fellowship', isModal: false },
    ],
  },
  copyright: { en: 'All rights reserved', es: 'Todos los derechos reservados' },
};

/** Stub para shared cuando la BD no está en build (o API falla). Footer con contenido por defecto para que se vean textos y funcione el botón flotante. */
function minimalSharedStub(type: 'footer' | 'header'): ContentPage {
  const pageId = type === 'header' ? 'shared-header' : 'shared-footer';
  const now = new Date().toISOString();
  if (type === 'footer') {
    return {
      meta: { pageId, lastUpdated: now, version: 1 },
      seo: {},
      content: DEFAULT_FOOTER_CONTENT,
    };
  }
  return {
    meta: { pageId, lastUpdated: now, version: 1 },
    seo: {},
    content: {
      companyInfo: { name: '', tagline: '' },
      navigation: { title: '' },
      resources: { title: '', items: [] },
      copyright: '',
    },
  };
}

export async function getPageContent(
  pageId: string,
  locale?: 'en' | 'es'
): Promise<ContentPage> {
  if (import.meta.env.SSR && !useContentFromDb()) {
    // Build sin PUBLIC_USE_CONTENT_FROM_BD=true: usar stub para que el build complete y se genere dist/index.html (evita 403).
    return minimalPageStub(pageId);
  }
  if (!import.meta.env.SSR && !useContentFromDb()) {
    // En el cliente, aunque la variable no esté en el build, intentar fetch al mismo origen para que la página de servicios cargue desde la API (ajamoment.com, etc.).
    // Solo en SSR (build) exigimos la variable para no fallar; en el navegador siempre intentamos la API.
  }

  if (import.meta.env.SSR) {
    try {
      const { getPageContentFromDb } = await import('./contentDbService.server');
      const dbResult = await getPageContentFromDb(pageId, locale);
      return dbResult;
    } catch (err) {
      // Sin BD en build: usar stub para que el build complete y exista dist/index.html (evita 403).
      // En producción el cliente sigue fetcheando la API/BD; las páginas /services/anxiety etc. harán redirect hasta que hagas un build con DATABASE_URL.
      if (pageId === 'services') {
        console.warn('[contentService] SSR: "services" BD no disponible en build, usando stub. Para contenido real y sin redirects: build con DATABASE_URL.');
      }
      console.warn(`[contentService] SSR: "${pageId}" BD no disponible en build, usando stub; el cliente fetchea la API.`);
      return minimalPageStub(pageId);
    }
  }

  // En el cliente usar siempre el origen actual para que el fetch vaya al mismo dominio (misma API que lee page_home). Evita que PUBLIC_API_BASE apunte a otro sitio o que una URL relativa resuelva distinto.
  const apiBase =
    typeof window !== 'undefined'
      ? window.location.origin
      : (import.meta.env.PUBLIC_API_BASE || import.meta.env.BASE_URL || '/').toString().replace(/\/$/, '') || '';
  const url = `${apiBase}/api/content/${encodeURIComponent(pageId)}?locale=${locale || 'en'}&_t=${Date.now()}`;

  let res: Response;
  let text: string;
  try {
    res = await fetch(url, { cache: 'no-store', headers: { Pragma: 'no-cache', 'Cache-Control': 'no-cache' } });
    text = await res.text();
  } catch (err) {
    console.error(`[contentService] API request failed for "${pageId}".`, err);
    throw new Error(`Failed to load content for page: ${pageId}. Network error.`);
  }

  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch {
    console.error(`[contentService] API response was not valid JSON for "${pageId}".`);
    throw new Error(`Failed to load content for page: ${pageId}. Invalid response.`);
  }

  if (typeof data === 'object' && data !== null && (data as { ok?: boolean }).ok === false) {
    const errMsg = (data as { error?: string }).error ?? 'Unknown error';
    throw new Error(`Failed to load content for page: ${pageId}. ${errMsg}`);
  }

  if (!res.ok) {
    throw new Error(`Failed to load content for page: ${pageId}. Server returned ${res.status}.`);
  }

  const validation = safeValidateContentPage(data);
  if (!validation.success) {
    console.error(`[contentService] Invalid content structure for "${pageId}".`, validation.error);
    throw new Error(`Failed to load content for page: ${pageId}. Invalid structure.`);
  }
  return validation.data;
}

/** Footer: SSR lee de page_shared_footer (getSharedContentFromDb). Cliente hace GET /api/content/shared-footer (content.php lee page_shared_footer). Editor: mismo GET para leer y PUT para escribir. */
export async function getSharedContent(type: 'footer' | 'header'): Promise<ContentPage> {
  if (import.meta.env.SSR && !useContentFromDb()) {
    // Build sin PUBLIC_USE_CONTENT_FROM_BD: stub para que el build complete y se genere dist/index.html.
    return minimalSharedStub(type);
  }
  if (!import.meta.env.SSR && !useContentFromDb()) {
    // En el cliente, intentar fetch al mismo origen (igual que getPageContent).
  }

  if (import.meta.env.SSR) {
    try {
      const { getSharedContentFromDb } = await import('./contentDbService.server');
      return await getSharedContentFromDb(type);
    } catch {
      console.warn(`[contentService] SSR: shared "${type}" BD no disponible en build, usando stub.`);
      return minimalSharedStub(type);
    }
  }

  // Cliente: siempre mismo origen que la página para evitar CORS (ajamoment.com → ajamoment.com, wholeselfnm.com → wholeselfnm.com).
  const apiBase =
    typeof window !== 'undefined'
      ? window.location.origin
      : (import.meta.env.PUBLIC_API_BASE || import.meta.env.BASE_URL || '/').toString().replace(/\/$/, '') || '';
  const pageId = type === 'header' ? 'shared-header' : 'shared-footer';
  const url = `${apiBase}/api/content/${encodeURIComponent(pageId)}?_t=${Date.now()}`;

  let res: Response;
  let text: string;
  try {
    res = await fetch(url, { cache: 'no-store', headers: { Pragma: 'no-cache', 'Cache-Control': 'no-cache' } });
    text = await res.text();
  } catch (err) {
    console.error(`[contentService] API request failed for shared "${type}".`, err);
    throw new Error(`Failed to load shared content: ${type}. Network error.`);
  }

  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch {
    console.error(`[contentService] API response was not valid JSON for shared "${type}".`);
    throw new Error(`Failed to load shared content: ${type}. Invalid response.`);
  }

  if (typeof data === 'object' && data !== null && (data as { ok?: boolean }).ok === false) {
    const errMsg = (data as { error?: string }).error ?? 'Unknown error';
    throw new Error(`Failed to load shared content: ${type}. ${errMsg}`);
  }

  if (!res.ok) {
    throw new Error(`Failed to load shared content: ${type}. Server returned ${res.status}.`);
  }

  const validation = safeValidateContentPage(data);
  if (!validation.success) {
    console.error(`[contentService] Invalid shared content structure: ${type}.`, validation.error);
    throw new Error(`Failed to load shared content: ${type}. Invalid structure.`);
  }
  return validation.data;
}

export { getLocalizedText } from '../models/ContentPage';

const contentCache = new Map<string, ContentPage>();

export function clearContentCache(): void {
  contentCache.clear();
}

export function clearPageCache(pageId: string): void {
  contentCache.delete(pageId);
}

export function updateContentMetadata(content: ContentPage): ContentPage {
  return updateMetadata(content);
}

export function updateContentLastUpdated(content: ContentPage): ContentPage {
  return updateLastUpdated(content);
}

export function validateContentLinks(content: ContentPage) {
  return validateLinks(content);
}
