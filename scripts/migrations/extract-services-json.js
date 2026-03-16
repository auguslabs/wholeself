/**
 * Extrae contenido services del export de page_content (phpMyAdmin)
 * y genera el SQL INSERT para page_services con datos reales (en y es).
 * Uso: node scripts/migrations/extract-services-json.js [ruta-al-export.json]
 * Por defecto: %USERPROFILE%\Downloads\page_content-last-downloaded.json
 *
 * En phpMyAdmin: exportar la tabla page_content (JSON). Luego:
 *   node scripts/migrations/extract-services-json.js "ruta/al/export.json"
 * Genera: 018_seed_services_from_export.sql (ejecutar después de 018_create_page_services.sql)
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
  if (Array.isArray(data)) row = data.find((r) => r.page_id === 'services');
} catch (e) {
  console.error('Error parseando export:', e.message);
  process.exit(1);
}
if (!row || !row.content) {
  console.error('Fila services no encontrada o sin content en el export');
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
const metaTs = (typeof row.meta === 'string' ? (() => { try { const m = JSON.parse(row.meta); return m.lastUpdated || new Date().toISOString().replace(/\.\d{3}Z$/, 'Z'); } catch (_) { return new Date().toISOString().replace(/\.\d{3}Z$/, 'Z'); } })() : row.meta?.lastUpdated) || new Date().toISOString().replace(/\.\d{3}Z$/, 'Z');

const loc = (v, lang) => {
  if (v == null) return '';
  if (typeof v === 'string') return v;
  return (v[lang] ?? v.en ?? v.es ?? '') || '';
};

const hero = content.hero || {};
const heroBg = hero.backgroundImage;
const heroBgStr = (lang) => (typeof heroBg === 'object' ? (heroBg[lang] ?? heroBg?.en ?? heroBg?.es ?? '') : (heroBg || ''));

function slugFromTitle(t) {
  if (!t || typeof t !== 'string') return '';
  return t.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
}

function categoriesForLocale(lang) {
  const cats = content.categories || [];
  return cats.map((cat, idx) => {
    const services = cat.services || cat.subcategories || cat.items || [];
    const titleStr = loc(cat.title, lang);
    const catId = typeof cat.id === 'object' ? (cat.id[lang] ?? cat.id?.en ?? cat.id?.es ?? '') : (cat.id || slugFromTitle(titleStr) || `cat-${idx}`);
    return {
      id: catId,
      title: titleStr,
      services: services.map((s) => ({
        id: typeof s.id === 'object' ? (s.id[lang] ?? s.id?.en ?? '') : (s.id || ''),
        name: loc(s.name, lang),
        description: loc(s.description, lang),
        icon: typeof s.icon === 'object' ? loc(s.icon, lang) : (s.icon || 'document'),
      })),
    };
  });
}

function conditionsSectionForLocale(lang) {
  const sec = content.conditionsSection || {};
  const conditions = (sec.conditions || []).map((c) => {
    const base = {
      id: typeof c.id === 'object' ? (c.id[lang] ?? c.id?.en ?? '') : (c.id || ''),
      name: loc(c.name, lang),
      description: loc(c.description, lang),
      icon: typeof c.icon === 'object' ? loc(c.icon, lang) : (c.icon || ''),
      link: typeof c.link === 'object' ? loc(c.link, lang) : (c.link || ''),
    };
    if (c.imageUrl != null && (typeof c.imageUrl === 'string' ? c.imageUrl : (c.imageUrl[lang] ?? c.imageUrl?.en ?? c.imageUrl?.es))) base.imageUrl = typeof c.imageUrl === 'object' ? loc(c.imageUrl, lang) : c.imageUrl;
    if (c.image != null && (typeof c.image === 'string' ? c.image : (c.image[lang] ?? c.image?.en ?? c.image?.es))) base.imageUrl = typeof c.image === 'object' ? loc(c.image, lang) : c.image;
    if (c.detailTitle != null && (typeof c.detailTitle === 'string' ? c.detailTitle : (c.detailTitle[lang] ?? c.detailTitle?.en ?? c.detailTitle?.es))) base.detailTitle = typeof c.detailTitle === 'object' ? loc(c.detailTitle, lang) : c.detailTitle;
    if (c.detailContent != null && (typeof c.detailContent === 'string' ? c.detailContent : (c.detailContent[lang] ?? c.detailContent?.en ?? c.detailContent?.es))) base.detailContent = typeof c.detailContent === 'object' ? loc(c.detailContent, lang) : c.detailContent;
    return base;
  });
  return { title: loc(sec.title, lang), subtitle: loc(sec.subtitle, lang), conditions };
}

function ctaSectionForLocale(lang) {
  const sec = content.ctaSection || {};
  const title = loc(sec.title, lang);
  const subtitle = loc(sec.subtitle, lang);
  if (Array.isArray(sec.primaryCTAs) && sec.primaryCTAs.length > 0) {
    const primaryCTAs = sec.primaryCTAs.map((c) => ({
      id: c.id || '',
      title: loc(c.title, lang),
      link: typeof c.link === 'object' ? loc(c.link, lang) : (c.link || ''),
      color: c.color || 'blueGreen',
    }));
    const secCta = sec.secondaryCTA;
    const secondaryCTA = secCta ? {
      id: secCta.id || '',
      title: loc(secCta.title, lang),
      link: typeof secCta.link === 'object' ? loc(secCta.link, lang) : (secCta.link || ''),
      text: loc(secCta.text, lang),
    } : null;
    return { title, subtitle, primaryCTAs, secondaryCTA };
  }
  const ctas = sec.ctas || [];
  const primaryCTAs = ctas.slice(0, 2).map((c, i) => ({
    id: c.id || `primary-${i}`,
    title: loc(c.title || c.text, lang),
    link: typeof c.link === 'object' ? loc(c.link, lang) : (c.link || '#'),
    color: c.color || (i === 0 ? 'blueGreen' : 'navy'),
  }));
  const third = ctas[2];
  const secondaryCTA = third ? {
    id: third.id || 'secondary',
    title: loc(third.title || third.text, lang),
    link: typeof third.link === 'object' ? loc(third.link, lang) : (third.link || '#'),
    text: loc(third.text || third.description, lang),
  } : null;
  return { title, subtitle, primaryCTAs, secondaryCTA };
}

const quickJump = content.quickJump || {};
const immigrationEval = content.immigrationEvaluation || {};
const intro = content.intro || {};

const en = {
  meta_last_updated: metaTs,
  meta_version: 1,
  seo_title: loc(seoFromRow.title, 'en') || 'Services - WholeSelf Counseling',
  seo_description: loc(seoFromRow.description, 'en') || 'Therapy and support services we offer.',
  hero_title: loc(hero.title, 'en') || 'Services',
  hero_subtitle: loc(hero.subtitle, 'en') || '',
  hero_background_image: heroBgStr('en'),
  hero_background_image_alt: loc(hero.backgroundImageAlt, 'en') || 'Services - WholeSelf Counseling',
  quick_jump_text: loc(quickJump.text, 'en'),
  immigration_evaluation_text: loc(immigrationEval.text, 'en'),
  intro_text: loc(intro.text, 'en'),
  categories_json: JSON.stringify(categoriesForLocale('en')),
  conditions_section_json: JSON.stringify(conditionsSectionForLocale('en')),
  cta_section_json: JSON.stringify(ctaSectionForLocale('en')),
};

const es = {
  meta_last_updated: metaTs,
  meta_version: 1,
  seo_title: loc(seoFromRow.title, 'es') || 'Servicios - WholeSelf Counseling',
  seo_description: loc(seoFromRow.description, 'es') || 'Servicios de terapia y apoyo que ofrecemos.',
  hero_title: loc(hero.title, 'es') || 'Servicios',
  hero_subtitle: loc(hero.subtitle, 'es') || '',
  hero_background_image: heroBgStr('es'),
  hero_background_image_alt: loc(hero.backgroundImageAlt, 'es') || 'Servicios - WholeSelf Counseling',
  quick_jump_text: loc(quickJump.text, 'es'),
  immigration_evaluation_text: loc(immigrationEval.text, 'es'),
  intro_text: loc(intro.text, 'es'),
  categories_json: JSON.stringify(categoriesForLocale('es')),
  conditions_section_json: JSON.stringify(conditionsSectionForLocale('es')),
  cta_section_json: JSON.stringify(ctaSectionForLocale('es')),
};

function sqlEscape(s) {
  if (s == null) return 'NULL';
  return "'" + String(s).replace(/\\/g, '\\\\').replace(/'/g, "''").replace(/\r/g, '\\r').replace(/\n/g, '\\n') + "'";
}

const cols = 'locale, meta_last_updated, meta_version, seo_title, seo_description, hero_title, hero_subtitle, hero_background_image, hero_background_image_alt, quick_jump_text, immigration_evaluation_text, intro_text, categories_json, conditions_section_json, cta_section_json';
const sql = [
  '-- INSERT services con contenido real desde export page_content. Generado por extract-services-json.js',
  '-- Ejecutar después de 018_create_page_services.sql',
  `INSERT INTO page_services (${cols}) VALUES`,
  `('en', ${sqlEscape(en.meta_last_updated)}, ${en.meta_version}, ${sqlEscape(en.seo_title)}, ${sqlEscape(en.seo_description)}, ${sqlEscape(en.hero_title)}, ${sqlEscape(en.hero_subtitle)}, ${sqlEscape(en.hero_background_image)}, ${sqlEscape(en.hero_background_image_alt)}, ${sqlEscape(en.quick_jump_text)}, ${sqlEscape(en.immigration_evaluation_text)}, ${sqlEscape(en.intro_text)}, ${sqlEscape(en.categories_json)}, ${sqlEscape(en.conditions_section_json)}, ${sqlEscape(en.cta_section_json)}),`,
  `('es', ${sqlEscape(es.meta_last_updated)}, ${es.meta_version}, ${sqlEscape(es.seo_title)}, ${sqlEscape(es.seo_description)}, ${sqlEscape(es.hero_title)}, ${sqlEscape(es.hero_subtitle)}, ${sqlEscape(es.hero_background_image)}, ${sqlEscape(es.hero_background_image_alt)}, ${sqlEscape(es.quick_jump_text)}, ${sqlEscape(es.immigration_evaluation_text)}, ${sqlEscape(es.intro_text)}, ${sqlEscape(es.categories_json)}, ${sqlEscape(es.conditions_section_json)}, ${sqlEscape(es.cta_section_json)})`,
  `ON DUPLICATE KEY UPDATE meta_last_updated=VALUES(meta_last_updated), meta_version=VALUES(meta_version), seo_title=VALUES(seo_title), seo_description=VALUES(seo_description), hero_title=VALUES(hero_title), hero_subtitle=VALUES(hero_subtitle), hero_background_image=VALUES(hero_background_image), hero_background_image_alt=VALUES(hero_background_image_alt), quick_jump_text=VALUES(quick_jump_text), immigration_evaluation_text=VALUES(immigration_evaluation_text), intro_text=VALUES(intro_text), categories_json=VALUES(categories_json), conditions_section_json=VALUES(conditions_section_json), cta_section_json=VALUES(cta_section_json), updated_at=NOW();`,
].join('\n');

const outPath = path.join(__dirname, '018_seed_services_from_export.sql');
fs.writeFileSync(outPath, sql, 'utf8');
console.log('Generado:', outPath);
console.log('Categorías:', (content.categories || []).length, '| Conditions:', (content.conditionsSection?.conditions || []).length);
