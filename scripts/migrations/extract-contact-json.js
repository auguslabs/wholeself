/**
 * Extrae solo los campos editables de Contact del export page_content:
 * hero.title, contactInfo (address, phone, email, officeHours, socialMedia).
 * No incluye form (formularios no editables por ahora).
 * Genera INSERT para page_contact con datos reales (en y es).
 * Uso: node scripts/migrations/extract-contact-json.js [ruta-al-export.json]
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
  if (Array.isArray(data)) row = data.find((r) => r.page_id === 'contact');
} catch (e) {
  console.error('Error parseando export:', e.message);
  process.exit(1);
}
if (!row || !row.content) {
  console.error('Fila contact no encontrada o sin content en el export');
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
const ci = content.contactInfo || {};
const addr = ci.address || {};
const oh = ci.officeHours || {};
const sm = ci.socialMedia || {};

const en = {
  meta_last_updated: metaTs,
  meta_version: 1,
  seo_title: loc(seoFromRow.title, 'en') || 'Contact - WholeSelf Counseling',
  seo_description: loc(seoFromRow.description, 'en') || 'Get in touch with us',
  hero_title: loc(hero.title, 'en') || 'Contact Us',
  address_street: loc(addr.street, 'en'),
  address_city: loc(addr.city, 'en'),
  address_state: loc(addr.state, 'en'),
  address_zip: loc(addr.zip, 'en'),
  phone: loc(ci.phone, 'en'),
  email: loc(ci.email, 'en'),
  office_hours_title: loc(oh.title, 'en'),
  office_hours_hours: loc(oh.hours, 'en'),
  office_hours_note: loc(oh.note, 'en'),
  facebook_url: typeof sm.facebook === 'object' ? (sm.facebook.en ?? sm.facebook.es ?? '') : (sm.facebook || ''),
  instagram_url: typeof sm.instagram === 'object' ? (sm.instagram.en ?? sm.instagram.es ?? '') : (sm.instagram || ''),
};
const es = {
  ...en,
  seo_title: loc(seoFromRow.title, 'es') || 'Contacto - WholeSelf Counseling',
  seo_description: loc(seoFromRow.description, 'es') || 'Ponte en contacto con nosotros',
  hero_title: loc(hero.title, 'es') || 'Contáctanos',
  address_street: loc(addr.street, 'es'),
  address_city: loc(addr.city, 'es'),
  address_state: loc(addr.state, 'es'),
  address_zip: loc(addr.zip, 'es'),
  phone: loc(ci.phone, 'es'),
  email: loc(ci.email, 'es'),
  office_hours_title: loc(oh.title, 'es'),
  office_hours_hours: loc(oh.hours, 'es'),
  office_hours_note: loc(oh.note, 'es'),
  facebook_url: typeof sm.facebook === 'object' ? (sm.facebook.es ?? sm.facebook.en ?? '') : (sm.facebook || ''),
  instagram_url: typeof sm.instagram === 'object' ? (sm.instagram.es ?? sm.instagram.en ?? '') : (sm.instagram || ''),
};

function sqlEscape(s) {
  if (s == null) return 'NULL';
  return "'" + String(s).replace(/\\/g, '\\\\').replace(/'/g, "''").replace(/\r/g, '\\r').replace(/\n/g, '\\n') + "'";
}

const cols = 'locale, meta_last_updated, meta_version, seo_title, seo_description, hero_title, address_street, address_city, address_state, address_zip, phone, email, office_hours_title, office_hours_hours, office_hours_note, facebook_url, instagram_url';
const sql = [
  '-- INSERT contact (solo campos editables: dirección, teléfono, email, horario, redes). Generado por extract-contact-json.js. No incluye form.',
  `INSERT INTO page_contact (${cols}) VALUES`,
  `('en', ${sqlEscape(en.meta_last_updated)}, ${en.meta_version}, ${sqlEscape(en.seo_title)}, ${sqlEscape(en.seo_description)}, ${sqlEscape(en.hero_title)}, ${sqlEscape(en.address_street)}, ${sqlEscape(en.address_city)}, ${sqlEscape(en.address_state)}, ${sqlEscape(en.address_zip)}, ${sqlEscape(en.phone)}, ${sqlEscape(en.email)}, ${sqlEscape(en.office_hours_title)}, ${sqlEscape(en.office_hours_hours)}, ${sqlEscape(en.office_hours_note)}, ${sqlEscape(en.facebook_url)}, ${sqlEscape(en.instagram_url)}),`,
  `('es', ${sqlEscape(es.meta_last_updated)}, ${es.meta_version}, ${sqlEscape(es.seo_title)}, ${sqlEscape(es.seo_description)}, ${sqlEscape(es.hero_title)}, ${sqlEscape(es.address_street)}, ${sqlEscape(es.address_city)}, ${sqlEscape(es.address_state)}, ${sqlEscape(es.address_zip)}, ${sqlEscape(es.phone)}, ${sqlEscape(es.email)}, ${sqlEscape(es.office_hours_title)}, ${sqlEscape(es.office_hours_hours)}, ${sqlEscape(es.office_hours_note)}, ${sqlEscape(es.facebook_url)}, ${sqlEscape(es.instagram_url)})`,
  'ON DUPLICATE KEY UPDATE meta_last_updated=VALUES(meta_last_updated), meta_version=VALUES(meta_version), seo_title=VALUES(seo_title), seo_description=VALUES(seo_description), hero_title=VALUES(hero_title), address_street=VALUES(address_street), address_city=VALUES(address_city), address_state=VALUES(address_state), address_zip=VALUES(address_zip), phone=VALUES(phone), email=VALUES(email), office_hours_title=VALUES(office_hours_title), office_hours_hours=VALUES(office_hours_hours), office_hours_note=VALUES(office_hours_note), facebook_url=VALUES(facebook_url), instagram_url=VALUES(instagram_url), updated_at=NOW();',
].join('\n');

const outPath = path.join(__dirname, '016_seed_contact_from_export.sql');
fs.writeFileSync(outPath, sql, 'utf8');
console.log('Generado:', outPath);
