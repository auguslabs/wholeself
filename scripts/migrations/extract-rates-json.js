/**
 * Extrae contenido rates del export de page_content (phpMyAdmin)
 * y genera el SQL INSERT para page_rates con datos reales (en y es).
 * Uso: node scripts/migrations/extract-rates-json.js [ruta-al-export.json]
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
  if (Array.isArray(data)) row = data.find((r) => r.page_id === 'rates');
} catch (e) {
  console.error('Error parseando export:', e.message);
  process.exit(1);
}
if (!row || !row.content) {
  console.error('Fila rates no encontrada o sin content en el export');
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

function pricingForLocale(lang) {
  const p = content.pricing || {};
  const sessions = (p.sessions || []).map((s) => ({
    type: loc(s.type, lang),
    rate: loc(s.rate, lang),
    duration: loc(s.duration, lang),
  }));
  return { title: loc(p.title, lang), sessions };
}

function insuranceForLocale(lang) {
  const i = content.insurance || {};
  const providerList = (i.providerList || []).map((p) => ({
    name: typeof p === 'object' && p != null && !('name' in p) ? loc(p, lang) : typeof p === 'object' && p != null && 'name' in p ? loc(p.name, lang) : String(p),
    logoUrl: typeof p === 'object' && p != null && p.logoUrl ? String(p.logoUrl) : '',
  }));
  const providers = (i.providers || []).map((p) => ({
    label: loc(p.label, lang),
    text: loc(p.text, lang),
  }));
  const modal = i.modal || {};
  const cta = modal.cta || {};
  return {
    title: loc(i.title, lang),
    description: loc(i.description, lang),
    providerList,
    providers,
    modal: {
      title: loc(modal.title, lang),
      description: loc(modal.description, lang),
      outOfNetworkInfo: loc(modal.outOfNetworkInfo, lang),
      note: loc(modal.note, lang),
      cta: { text: loc(cta.text, lang), href: typeof cta.href === 'object' ? loc(cta.href, lang) : (cta.href || '') },
    },
  };
}

function paymentOptionsForLocale(lang) {
  const po = content.paymentOptions || {};
  const options = (po.options || []).map((o) => ({
    label: loc(o.label, lang),
    text: loc(o.text, lang),
  }));
  return {
    title: loc(po.title, lang),
    description: loc(po.description, lang),
    options,
  };
}

function faqForLocale(lang) {
  const faq = content.faq || {};
  const questions = (faq.questions || []).map((q) => ({
    question: loc(q.question, lang),
    answer: loc(q.answer, lang),
  }));
  return { title: loc(faq.title, lang), questions };
}

function ctaSectionForLocale(lang) {
  const c = content.ctaSection || {};
  const primary = c.primaryCTA || {};
  const secondary = c.secondaryCTA || {};
  return {
    title: loc(c.title, lang),
    subtitle: loc(c.subtitle, lang),
    primaryCTA: { text: loc(primary.text, lang), href: typeof primary.href === 'object' ? loc(primary.href, lang) : (primary.href || '') },
    secondaryCTA: { text: loc(secondary.text, lang), href: typeof secondary.href === 'object' ? loc(secondary.href, lang) : (secondary.href || '') },
  };
}

const hero = content.hero || {};
const heroBg = hero.backgroundImage;
const heroBgStr = (lang) => (typeof heroBg === 'object' ? (heroBg[lang] ?? heroBg.en ?? heroBg.es ?? '') : (heroBg || ''));

const en = {
  meta_last_updated: metaTs,
  meta_version: 1,
  seo_title: loc(seoFromRow.title, 'en') || 'Rates - WholeSelf Counseling',
  seo_description: loc(seoFromRow.description, 'en') || 'Pricing, insurance, and payment options',
  hero_title: loc(hero.title, 'en') || 'Rates',
  hero_subtitle: loc(hero.subtitle, 'en') || '',
  hero_background_image: heroBgStr('en'),
  hero_background_image_alt: loc(hero.backgroundImageAlt, 'en') || 'Rates - WholeSelf Counseling',
  pricing_json: JSON.stringify(pricingForLocale('en')),
  insurance_json: JSON.stringify(insuranceForLocale('en')),
  payment_options_json: JSON.stringify(paymentOptionsForLocale('en')),
  faq_json: JSON.stringify(faqForLocale('en')),
  cta_section_json: JSON.stringify(ctaSectionForLocale('en')),
};
const es = {
  ...en,
  seo_title: loc(seoFromRow.title, 'es') || 'Tarifas - WholeSelf Counseling',
  seo_description: loc(seoFromRow.description, 'es') || 'Precios, seguros y opciones de pago',
  hero_title: loc(hero.title, 'es') || 'Tarifas',
  hero_subtitle: loc(hero.subtitle, 'es') || '',
  hero_background_image: heroBgStr('es'),
  hero_background_image_alt: loc(hero.backgroundImageAlt, 'es') || 'Tarifas - WholeSelf Counseling',
  pricing_json: JSON.stringify(pricingForLocale('es')),
  insurance_json: JSON.stringify(insuranceForLocale('es')),
  payment_options_json: JSON.stringify(paymentOptionsForLocale('es')),
  faq_json: JSON.stringify(faqForLocale('es')),
  cta_section_json: JSON.stringify(ctaSectionForLocale('es')),
};

function sqlEscape(s) {
  if (s == null) return 'NULL';
  return "'" + String(s).replace(/\\/g, '\\\\').replace(/'/g, "''").replace(/\r/g, '\\r').replace(/\n/g, '\\n') + "'";
}

const sql = [
  '-- INSERT rates con contenido real desde export page_content. Generado por extract-rates-json.js',
  'INSERT INTO page_rates (locale, meta_last_updated, meta_version, seo_title, seo_description, hero_title, hero_subtitle, hero_background_image, hero_background_image_alt, pricing_json, insurance_json, payment_options_json, faq_json, cta_section_json) VALUES',
  `('en', ${sqlEscape(en.meta_last_updated)}, ${en.meta_version}, ${sqlEscape(en.seo_title)}, ${sqlEscape(en.seo_description)}, ${sqlEscape(en.hero_title)}, ${sqlEscape(en.hero_subtitle)}, ${sqlEscape(en.hero_background_image)}, ${sqlEscape(en.hero_background_image_alt)}, ${sqlEscape(en.pricing_json)}, ${sqlEscape(en.insurance_json)}, ${sqlEscape(en.payment_options_json)}, ${sqlEscape(en.faq_json)}, ${sqlEscape(en.cta_section_json)}),`,
  `('es', ${sqlEscape(es.meta_last_updated)}, ${es.meta_version}, ${sqlEscape(es.seo_title)}, ${sqlEscape(es.seo_description)}, ${sqlEscape(es.hero_title)}, ${sqlEscape(es.hero_subtitle)}, ${sqlEscape(es.hero_background_image)}, ${sqlEscape(es.hero_background_image_alt)}, ${sqlEscape(es.pricing_json)}, ${sqlEscape(es.insurance_json)}, ${sqlEscape(es.payment_options_json)}, ${sqlEscape(es.faq_json)}, ${sqlEscape(es.cta_section_json)})`,
  'ON DUPLICATE KEY UPDATE meta_last_updated=VALUES(meta_last_updated), meta_version=VALUES(meta_version), seo_title=VALUES(seo_title), seo_description=VALUES(seo_description), hero_title=VALUES(hero_title), hero_subtitle=VALUES(hero_subtitle), hero_background_image=VALUES(hero_background_image), hero_background_image_alt=VALUES(hero_background_image_alt), pricing_json=VALUES(pricing_json), insurance_json=VALUES(insurance_json), payment_options_json=VALUES(payment_options_json), faq_json=VALUES(faq_json), cta_section_json=VALUES(cta_section_json), updated_at=NOW();',
].join('\n');

const outPath = path.join(__dirname, '015_seed_rates_from_export.sql');
fs.writeFileSync(outPath, sql, 'utf8');
console.log('Generado:', outPath);
console.log('Pricing sessions:', (content.pricing?.sessions || []).length, '| FAQ:', (content.faq?.questions || []).length);
