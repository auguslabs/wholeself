/**
 * Extrae contenido fellowship del export de page_content (phpMyAdmin)
 * y genera el SQL INSERT para page_fellowship (2 filas en/es).
 * Uso: node scripts/migrations/extract-fellowship-json.js [ruta-al-export.json]
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
  if (Array.isArray(data)) row = data.find((r) => r.page_id === 'fellowship');
} catch (e) {
  console.error('Error parseando export:', e.message);
  process.exit(1);
}
if (!row || !row.content) {
  console.error('Fila fellowship no encontrada o sin content en el export');
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

const sqlEscape = (s) => {
  if (s == null) return "''";
  const str = String(s)
    .replace(/\\/g, '\\\\')
    .replace(/'/g, "''")
    .replace(/\u2019/g, "''"); // Unicode apostrophe
  return `'${str}'`;
};

const hero = content.hero || {};
const mission = content.mission || {};
const benefits = content.benefits || {};
const programDetails = content.programDetails || {};
const howToApply = content.howToApply || {};
const footnote = content.footnote != null ? content.footnote : {};

function benefitsForLocale(lang) {
  const items = benefits.items || [];
  return items.map((item) => ({
    id: item.id || '',
    text: loc(item.text, lang),
  }));
}

function programDetailsForLocale(lang) {
  return {
    commitment: loc(programDetails.commitment, lang),
    duration: {
      label: loc(programDetails.duration?.label, lang),
      value: loc(programDetails.duration?.value, lang),
    },
    deadline: {
      label: loc(programDetails.deadline?.label, lang),
      value: loc(programDetails.deadline?.value, lang),
    },
  };
}

function howToApplyForLocale(lang) {
  const link = howToApply.applyLink || {};
  return {
    title: loc(howToApply.title, lang),
    description: loc(howToApply.description, lang),
    contactEmail: loc(howToApply.contactEmail, lang),
    email: howToApply.email || '',
    applyLink: {
      text: loc(link.text, lang),
      url: link.url || '',
      enabled: !!link.enabled,
    },
    footnote: loc(footnote, lang),
  };
}

const en = {
  meta_last_updated: metaTs,
  meta_version: 1,
  seo_title: loc(seoFromRow.title, 'en'),
  seo_description: loc(seoFromRow.description, 'en'),
  hero_title: loc(hero.title, 'en'),
  hero_subtitle: loc(hero.subtitle, 'en'),
  hero_description: loc(hero.description, 'en'),
  hero_icon: hero.icon || 'AcademicCapIcon',
  hero_announcement: loc(hero.announcement, 'en'),
  mission_title: loc(mission.title, 'en'),
  mission_content: loc(mission.content, 'en'),
  benefits_json: JSON.stringify(benefitsForLocale('en')),
  program_details_json: JSON.stringify(programDetailsForLocale('en')),
  how_to_apply_json: JSON.stringify(howToApplyForLocale('en')),
};

const es = {
  meta_last_updated: metaTs,
  meta_version: 1,
  seo_title: loc(seoFromRow.title, 'es'),
  seo_description: loc(seoFromRow.description, 'es'),
  hero_title: loc(hero.title, 'es'),
  hero_subtitle: loc(hero.subtitle, 'es'),
  hero_description: loc(hero.description, 'es'),
  hero_icon: hero.icon || 'AcademicCapIcon',
  hero_announcement: loc(hero.announcement, 'es'),
  mission_title: loc(mission.title, 'es'),
  mission_content: loc(mission.content, 'es'),
  benefits_json: JSON.stringify(benefitsForLocale('es')),
  program_details_json: JSON.stringify(programDetailsForLocale('es')),
  how_to_apply_json: JSON.stringify(howToApplyForLocale('es')),
};

const outPath = path.join(__dirname, '021_seed_fellowship_from_export.sql');
const lines = [
  '-- Generado con: node scripts/migrations/extract-fellowship-json.js "' + exportPath.replace(/\\/g, '/') + '"',
  '-- Ejecutar después de 021_create_page_fellowship.sql en la misma BD.',
  '',
  'INSERT INTO page_fellowship (locale, meta_last_updated, meta_version, seo_title, seo_description, hero_title, hero_subtitle, hero_description, hero_icon, hero_announcement, mission_title, mission_content, benefits_json, program_details_json, how_to_apply_json) VALUES',
  `('en', ${sqlEscape(en.meta_last_updated)}, ${en.meta_version}, ${sqlEscape(en.seo_title)}, ${sqlEscape(en.seo_description)}, ${sqlEscape(en.hero_title)}, ${sqlEscape(en.hero_subtitle)}, ${sqlEscape(en.hero_description)}, ${sqlEscape(en.hero_icon)}, ${sqlEscape(en.hero_announcement)}, ${sqlEscape(en.mission_title)}, ${sqlEscape(en.mission_content)}, ${sqlEscape(en.benefits_json)}, ${sqlEscape(en.program_details_json)}, ${sqlEscape(en.how_to_apply_json)}),`,
  `('es', ${sqlEscape(es.meta_last_updated)}, ${es.meta_version}, ${sqlEscape(es.seo_title)}, ${sqlEscape(es.seo_description)}, ${sqlEscape(es.hero_title)}, ${sqlEscape(es.hero_subtitle)}, ${sqlEscape(es.hero_description)}, ${sqlEscape(es.hero_icon)}, ${sqlEscape(es.hero_announcement)}, ${sqlEscape(es.mission_title)}, ${sqlEscape(es.mission_content)}, ${sqlEscape(es.benefits_json)}, ${sqlEscape(es.program_details_json)}, ${sqlEscape(es.how_to_apply_json)})`,
  'ON DUPLICATE KEY UPDATE meta_last_updated=VALUES(meta_last_updated), meta_version=VALUES(meta_version), seo_title=VALUES(seo_title), seo_description=VALUES(seo_description), hero_title=VALUES(hero_title), hero_subtitle=VALUES(hero_subtitle), hero_description=VALUES(hero_description), hero_icon=VALUES(hero_icon), hero_announcement=VALUES(hero_announcement), mission_title=VALUES(mission_title), mission_content=VALUES(mission_content), benefits_json=VALUES(benefits_json), program_details_json=VALUES(program_details_json), how_to_apply_json=VALUES(how_to_apply_json), updated_at=NOW();',
];
fs.writeFileSync(outPath, lines.join('\n'), 'utf8');
console.log('Generado:', outPath);
