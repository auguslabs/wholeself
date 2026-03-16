/**
 * Extrae contenido what-to-expect del export de page_content (phpMyAdmin)
 * y genera el SQL INSERT para page_what_to_expect con datos reales (en y es).
 * Uso: node scripts/migrations/extract-what-to-expect-json.js [ruta-al-export.json]
 * Por defecto: %USERPROFILE%\Downloads\page_content-last-downloaded.json
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const exportPath = process.argv[2] || path.join(process.env.USERPROFILE || '', 'Downloads', 'page_content-last-downloaded.json');
if (!fs.existsSync(exportPath)) {
  console.error('Archivo no encontrado:', exportPath);
  process.exit(1);
}

const raw = fs.readFileSync(exportPath, 'utf8');
let row;
try {
  const arr = JSON.parse(raw);
  const table = Array.isArray(arr) && arr.find((x) => x.type === 'table' && x.name === 'page_content');
  const data = table && table.data;
  if (Array.isArray(data)) {
    row = data.find((r) => r.page_id === 'what-to-expect');
  }
} catch (e) {
  console.error('Error parseando export:', e.message);
  process.exit(1);
}
if (!row || !row.content) {
  console.error('Fila what-to-expect no encontrada o sin content en el export');
  process.exit(1);
}

let content;
try {
  content = typeof row.content === 'string' ? JSON.parse(row.content) : row.content;
} catch (e) {
  console.error('Error parseando content:', e.message);
  process.exit(1);
}
const seoFromRow = (typeof row.seo === 'string' ? (() => { try { return JSON.parse(row.seo); } catch (_) { return {}; } })() : row.seo) || {};

const loc = (v, lang) => {
  if (v == null) return '';
  if (typeof v === 'string') return v;
  return (v[lang] ?? v.en ?? v.es ?? '') || '';
};

function sectionsForLocale(lang) {
  const sections = content.sections || [];
  return sections.map((sec) => {
    const id = typeof sec.id === 'object' ? (sec.id[lang] || sec.id.en || sec.id.es || '') : (sec.id || '');
    const title = loc(sec.title, lang);
    const icon = typeof sec.icon === 'object' ? (sec.icon[lang] || sec.icon.en || '') : (sec.icon || '');
    const c = sec.content || {};
    const intro = loc(c.intro, lang);
    const items = (c.items || []).map((it) => ({
      title: loc(it.title, lang),
      description: loc(it.description, lang),
    }));
    const paragraphs = (c.paragraphs || []).map((p) => (typeof p === 'object' ? loc(p, lang) : p));
    return { id, title, icon, content: { intro, items, paragraphs } };
  });
}

function ctaSectionForLocale(lang) {
  const cta = content.ctaSection || {};
  return {
    title: loc(cta.title, lang),
    subtitle: loc(cta.subtitle, lang),
    ctas: (cta.ctas || []).map((c) => ({
      id: typeof c.id === 'object' ? (c.id[lang] || c.id.en || '') : (c.id || ''),
      title: loc(c.title, lang),
      description: loc(c.description, lang),
      link: typeof c.link === 'object' ? (c.link[lang] || c.link.en || '') : (c.link || ''),
      variant: typeof c.variant === 'object' ? (c.variant[lang] || 'primary') : (c.variant || 'primary'),
    })),
  };
}

const hero = content.hero || {};
const intro = content.intro || {};
const metaTs = (typeof row.meta === 'string' ? (() => { try { const m = JSON.parse(row.meta); return m.lastUpdated || new Date().toISOString().replace(/\.\d{3}Z$/, 'Z'); } catch (_) { return new Date().toISOString().replace(/\.\d{3}Z$/, 'Z'); } })() : row.meta?.lastUpdated) || new Date().toISOString().replace(/\.\d{3}Z$/, 'Z');
const metaVersion = 2;

const en = {
  meta_last_updated: metaTs,
  meta_version: metaVersion,
  seo_title: loc(seoFromRow.title, 'en') || 'What to Expect - WholeSelf Counseling',
  seo_description: loc(seoFromRow.description, 'en') || 'Learn what to expect during your therapy journey. From your first session to ongoing therapy, we guide you through every step.',
  hero_title: loc(hero.title, 'en') || 'What to Expect',
  hero_subtitle: loc(hero.subtitle, 'en') || 'Your journey to wellness',
  intro_text: loc(intro.text, 'en'),
  sections_json: JSON.stringify(sectionsForLocale('en')),
  cta_section_json: JSON.stringify(ctaSectionForLocale('en')),
};
const es = {
  meta_last_updated: metaTs,
  meta_version: metaVersion,
  seo_title: loc(seoFromRow.title, 'es') || 'Que Esperar - WholeSelf Counseling',
  seo_description: loc(seoFromRow.description, 'es') || 'Aprende que esperar durante tu viaje terapeutico. Desde tu primera sesion hasta la terapia continua, te guiamos en cada paso.',
  hero_title: loc(hero.title, 'es') || 'Que Esperar',
  hero_subtitle: loc(hero.subtitle, 'es') || 'Tu viaje hacia el bienestar',
  intro_text: loc(intro.text, 'es'),
  sections_json: JSON.stringify(sectionsForLocale('es')),
  cta_section_json: JSON.stringify(ctaSectionForLocale('es')),
};

function sqlEscape(s) {
  if (s == null) return 'NULL';
  return "'" + String(s).replace(/\\/g, '\\\\').replace(/'/g, "''").replace(/\r/g, '\\r').replace(/\n/g, '\\n') + "'";
}

const sql = [
  '-- INSERT con contenido real desde export page_content (what-to-expect). Generado por extract-what-to-expect-json.js',
  'INSERT INTO page_what_to_expect (locale, meta_last_updated, meta_version, seo_title, seo_description, hero_title, hero_subtitle, intro_text, sections_json, cta_section_json) VALUES',
  "('en', " + sqlEscape(en.meta_last_updated) + ', ' + en.meta_version + ', ' + sqlEscape(en.seo_title) + ', ' + sqlEscape(en.seo_description) + ', ' + sqlEscape(en.hero_title) + ', ' + sqlEscape(en.hero_subtitle) + ', ' + sqlEscape(en.intro_text) + ', ' + sqlEscape(en.sections_json) + ', ' + sqlEscape(en.cta_section_json) + '),',
  "('es', " + sqlEscape(es.meta_last_updated) + ', ' + es.meta_version + ', ' + sqlEscape(es.seo_title) + ', ' + sqlEscape(es.seo_description) + ', ' + sqlEscape(es.hero_title) + ', ' + sqlEscape(es.hero_subtitle) + ', ' + sqlEscape(es.intro_text) + ', ' + sqlEscape(es.sections_json) + ', ' + sqlEscape(es.cta_section_json) + ')',
  'ON DUPLICATE KEY UPDATE meta_last_updated = VALUES(meta_last_updated), meta_version = VALUES(meta_version), seo_title = VALUES(seo_title), seo_description = VALUES(seo_description), hero_title = VALUES(hero_title), hero_subtitle = VALUES(hero_subtitle), intro_text = VALUES(intro_text), sections_json = VALUES(sections_json), cta_section_json = VALUES(cta_section_json), updated_at = NOW();',
].join('\n');

// Escribir seed opcional (para re-export); la migración 014 ya incluye el INSERT real.
const outPath = path.join(__dirname, '015_seed_what_to_expect_from_export.sql');
fs.writeFileSync(outPath, sql, 'utf8');
console.log('Generado:', outPath, '(opcional; 014 ya tiene el INSERT real)');
console.log('Secciones:', (content.sections || []).length, '| CTAs:', (content.ctaSection?.ctas || []).length);
