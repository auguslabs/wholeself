/**
 * Servicio de contenido desde BD (solo servidor).
 * Lee page_content y team_members. Usado cuando PUBLIC_USE_CONTENT_FROM_BD está activo.
 */

import type { ContentPage } from '../models/ContentPage';
import type { TeamMember, LanguageType } from '../models/TeamMember';
import { getDbConnection } from '@/lib/db.server';

const pageCache = new Map<string, ContentPage>();
let teamCache: TeamMember[] | null = null;

/** Lee What to Expect desde la tabla plana page_what_to_expect (2 filas en/es). Mismo formato que GET /api/content/what-to-expect. */
async function getWhatToExpectContentFromDb(): Promise<ContentPage> {
  const cacheKey = 'what-to-expect';
  if (pageCache.has(cacheKey)) {
    return pageCache.get(cacheKey)!;
  }
  const conn = await getDbConnection();
  try {
    const [rows] = await conn.execute<
      { locale: string; meta_last_updated: string; meta_version: number; seo_title: string; seo_description: string; hero_title: string; hero_subtitle: string; intro_text: string; sections_json: string; cta_section_json: string; updated_at: string }[]
    >(
      'SELECT locale, meta_last_updated, meta_version, seo_title, seo_description, hero_title, hero_subtitle, intro_text, sections_json, cta_section_json, updated_at FROM page_what_to_expect WHERE locale IN (\'en\', \'es\')'
    );
    const list = Array.isArray(rows) ? rows : (rows as any) ?? [];
    const byLocale = Object.fromEntries(list.map((r) => [String(r.locale), r]));
    const en = byLocale.en;
    const es = byLocale.es;
    if (!en || !es) {
      throw new Error('what-to-expect: missing en or es row in page_what_to_expect');
    }
    const s = (v: unknown) => (v != null ? String(v) : '');
    let lastUpdatedRaw = en.meta_last_updated ?? en.updated_at ?? null;
    let lastUpdated = '';
    if (lastUpdatedRaw && !Number.isNaN(Date.parse(String(lastUpdatedRaw)))) {
      lastUpdated = new Date(String(lastUpdatedRaw)).toISOString();
    }
    if (!lastUpdated) lastUpdated = new Date().toISOString();
    const meta = { pageId: 'what-to-expect' as const, lastUpdated, version: Number(en.meta_version) || 1 };
    const seo = {
      title: { en: s(en.seo_title), es: s(es.seo_title) },
      description: { en: s(en.seo_description), es: s(es.seo_description) },
    };
    const enSections: Array<{ id?: string; title?: string; icon?: string; content?: { intro?: string; items?: Array<{ title?: string; description?: string }>; paragraphs?: unknown[] } }> = typeof en.sections_json === 'string' ? JSON.parse(en.sections_json) : en.sections_json ?? [];
    const esSections: Array<{ id?: string; title?: string; icon?: string; content?: { intro?: string; items?: Array<{ title?: string; description?: string }>; paragraphs?: unknown[] } }> = typeof es.sections_json === 'string' ? JSON.parse(es.sections_json) : es.sections_json ?? [];
    const maxSections = Math.max(enSections.length, esSections.length);
    const sections: Array<{ id: string; title: { en: string; es: string }; icon: string; content: { intro: { en: string; es: string }; items: Array<{ title: { en: string; es: string }; description: { en: string; es: string } }>; paragraphs: Array<{ en: string; es: string }> } }> = [];
    for (let i = 0; i < maxSections; i++) {
      const e = enSections[i] ?? {};
      const secEs = esSections[i] ?? {};
      const id = e.id ?? secEs.id ?? `section-${i}`;
      const contentEn = e.content ?? {};
      const contentEs = secEs.content ?? {};
      const itemsEn = contentEn.items ?? [];
      const itemsEs = contentEs.items ?? [];
      const maxItems = Math.max(itemsEn.length, itemsEs.length);
      const items: Array<{ title: { en: string; es: string }; description: { en: string; es: string } }> = [];
      for (let j = 0; j < maxItems; j++) {
        const ie = itemsEn[j] ?? {};
        const is = itemsEs[j] ?? {};
        items.push({
          title: { en: s(ie.title), es: s(is.title) },
          description: { en: s(ie.description), es: s(is.description) },
        });
      }
      const parEn = (contentEn.paragraphs ?? []) as (string | { en?: string; es?: string })[];
      const parEs = (contentEs.paragraphs ?? []) as (string | { en?: string; es?: string })[];
      const maxPar = Math.max(parEn.length, parEs.length);
      const paragraphs: Array<{ en: string; es: string }> = [];
      for (let k = 0; k < maxPar; k++) {
        const pe = parEn[k];
        const ps = parEs[k];
        paragraphs.push({
          en: typeof pe === 'object' && pe && 'en' in pe ? s(pe.en) : s(pe),
          es: typeof ps === 'object' && ps && 'es' in ps ? s(ps.es) : s(ps),
        });
      }
      sections.push({
        id: String(id),
        title: { en: s(e.title), es: s(secEs.title) },
        icon: s(e.icon ?? secEs.icon),
        content: {
          intro: {
            en: typeof contentEn.intro === 'object' && contentEn.intro && 'en' in contentEn.intro ? s((contentEn.intro as { en?: string }).en) : s(contentEn.intro),
            es: typeof contentEs.intro === 'object' && contentEs.intro && 'es' in contentEs.intro ? s((contentEs.intro as { es?: string }).es) : s(contentEs.intro),
          },
          items,
          paragraphs,
        },
      });
    }
    const enCta: { title?: string; subtitle?: string; ctas?: Array<{ id?: string; title?: string; description?: string; link?: string; variant?: string }> } = typeof en.cta_section_json === 'string' ? JSON.parse(en.cta_section_json) : en.cta_section_json ?? { title: '', subtitle: '', ctas: [] };
    const esCta: { title?: string; subtitle?: string; ctas?: Array<{ id?: string; title?: string; description?: string; link?: string; variant?: string }> } = typeof es.cta_section_json === 'string' ? JSON.parse(es.cta_section_json) : es.cta_section_json ?? { title: '', subtitle: '', ctas: [] };
    const ctasEn = enCta.ctas ?? [];
    const ctasEs = esCta.ctas ?? [];
    const maxCtas = Math.max(ctasEn.length, ctasEs.length);
    const ctas: Array<{ id: string; title: { en: string; es: string }; description: { en: string; es: string }; link: string; variant: string }> = [];
    for (let i = 0; i < maxCtas; i++) {
      const ce = ctasEn[i] ?? {};
      const cs = ctasEs[i] ?? {};
      ctas.push({
        id: s(ce.id ?? cs.id ?? `cta-${i}`),
        title: { en: s(ce.title), es: s(cs.title) },
        description: { en: s(ce.description), es: s(cs.description) },
        link: s(ce.link ?? cs.link),
        variant: s(ce.variant ?? cs.variant ?? 'primary'),
      });
    }
    const content = {
      hero: {
        title: { en: s(en.hero_title), es: s(es.hero_title) },
        subtitle: { en: s(en.hero_subtitle), es: s(es.hero_subtitle) },
      },
      intro: { text: { en: s(en.intro_text), es: s(es.intro_text) } },
      sections,
      ctaSection: {
        title: { en: s(enCta.title), es: s(esCta.title) },
        subtitle: { en: s(enCta.subtitle), es: s(esCta.subtitle) },
        ctas,
      },
    };
    const page: ContentPage = { meta, seo, content };
    pageCache.set(cacheKey, page);
    return page;
  } finally {
    await conn.end().catch(() => {});
  }
}

/** Lee Rates desde la tabla plana page_rates (2 filas en/es). Mismo formato que GET /api/content/rates. */
async function getRatesContentFromDb(): Promise<ContentPage> {
  const cacheKey = 'rates';
  if (pageCache.has(cacheKey)) {
    return pageCache.get(cacheKey)!;
  }
  const conn = await getDbConnection();
  try {
    const [rows] = await conn.execute<
      { locale: string; meta_last_updated: string; meta_version: number; seo_title: string; seo_description: string; hero_title: string; hero_subtitle: string; hero_background_image: string; hero_background_image_alt: string; pricing_json: string; insurance_json: string; payment_options_json: string; faq_json: string; cta_section_json: string; updated_at: string }[]
    >(
      'SELECT locale, meta_last_updated, meta_version, seo_title, seo_description, hero_title, hero_subtitle, hero_background_image, hero_background_image_alt, pricing_json, insurance_json, payment_options_json, faq_json, cta_section_json, updated_at FROM page_rates WHERE locale IN (\'en\', \'es\')'
    );
    const list = Array.isArray(rows) ? rows : (rows as any) ?? [];
    const byLocale = Object.fromEntries(list.map((r) => [String(r.locale), r]));
    const en = byLocale.en;
    const es = byLocale.es;
    if (!en || !es) {
      throw new Error('rates: missing en or es row in page_rates');
    }
    const s = (v: unknown) => (v != null ? String(v) : '');
    let lastUpdated = s(en.meta_last_updated ?? en.updated_at);
    if (lastUpdated && !Number.isNaN(Date.parse(lastUpdated))) {
      lastUpdated = new Date(lastUpdated).toISOString();
    } else {
      lastUpdated = new Date().toISOString();
    }
    const meta = { pageId: 'rates' as const, lastUpdated, version: Number(en.meta_version) || 1 };
    const seo = {
      title: { en: s(en.seo_title), es: s(es.seo_title) },
      description: { en: s(en.seo_description), es: s(es.seo_description) },
    };
    const pEn: { title?: string; sessions?: Array<{ type?: string; rate?: string; duration?: string }> } = typeof en.pricing_json === 'string' ? JSON.parse(en.pricing_json) : en.pricing_json ?? {};
    const pEs: { title?: string; sessions?: Array<{ type?: string; rate?: string; duration?: string }> } = typeof es.pricing_json === 'string' ? JSON.parse(es.pricing_json) : es.pricing_json ?? {};
    const sessions = [];
    const maxSessions = Math.max((pEn.sessions ?? []).length, (pEs.sessions ?? []).length);
    for (let i = 0; i < maxSessions; i++) {
      const se = (pEn.sessions ?? [])[i] ?? {};
      const ss = (pEs.sessions ?? [])[i] ?? {};
      sessions.push({
        type: { en: s(se.type), es: s(ss.type) },
        rate: { en: s(se.rate), es: s(ss.rate) },
        duration: { en: s(se.duration), es: s(ss.duration) },
      });
    }
    const insEn: Record<string, unknown> = typeof en.insurance_json === 'string' ? JSON.parse(en.insurance_json) : en.insurance_json ?? {};
    const insEs: Record<string, unknown> = typeof es.insurance_json === 'string' ? JSON.parse(es.insurance_json) : es.insurance_json ?? {};
    // providerList desde tabla dedicada insurance_provider (migración 025)
    const providerList: Array<{ name: { en: string; es: string }; logoUrl: string }> = [];
    const [providerRows] = await conn.execute<{ name_en: string; name_es: string; logo_url: string }[]>(
      'SELECT name_en, name_es, logo_url FROM insurance_provider ORDER BY display_order ASC, name_en ASC'
    );
    const providerListRows = Array.isArray(providerRows) ? providerRows : (providerRows as any) ?? [];
    for (const row of providerListRows) {
      providerList.push({
        name: { en: s(row.name_en), es: s(row.name_es) },
        logoUrl: s(row.logo_url ?? '').trim(),
      });
    }
    const providers: Array<{ label: { en: string; es: string }; text: { en: string; es: string } }> = [];
    const provEn = (insEn.providers as Record<string, unknown>[]) ?? [];
    const provEs = (insEs.providers as Record<string, unknown>[]) ?? [];
    for (let i = 0; i < Math.max(provEn.length, provEs.length); i++) {
      const pe = provEn[i] ?? {};
      const ps = provEs[i] ?? {};
      providers.push({
        label: { en: s(pe.label), es: s(ps.label) },
        text: { en: s(pe.text), es: s(ps.text) },
      });
    }
    const modalEn = (insEn.modal as Record<string, unknown>) ?? {};
    const modalEs = (insEs.modal as Record<string, unknown>) ?? {};
    const ctaEn = (modalEn.cta as Record<string, unknown>) ?? {};
    const ctaEs = (modalEs.cta as Record<string, unknown>) ?? {};
    const poEn: { title?: string; description?: string; options?: Array<{ label?: string; text?: string }> } = typeof en.payment_options_json === 'string' ? JSON.parse(en.payment_options_json) : en.payment_options_json ?? {};
    const poEs: { title?: string; description?: string; options?: Array<{ label?: string; text?: string }> } = typeof es.payment_options_json === 'string' ? JSON.parse(es.payment_options_json) : es.payment_options_json ?? {};
    const options: Array<{ label: { en: string; es: string }; text: { en: string; es: string } }> = [];
    const optEn = poEn.options ?? [];
    const optEs = poEs.options ?? [];
    for (let i = 0; i < Math.max(optEn.length, optEs.length); i++) {
      const oe = optEn[i] ?? {};
      const os = optEs[i] ?? {};
      options.push({ label: { en: s(oe.label), es: s(os.label) }, text: { en: s(oe.text), es: s(os.text) } });
    }
    const faqEn: { title?: string; questions?: Array<{ question?: string; answer?: string }> } = typeof en.faq_json === 'string' ? JSON.parse(en.faq_json) : en.faq_json ?? {};
    const faqEs: { title?: string; questions?: Array<{ question?: string; answer?: string }> } = typeof es.faq_json === 'string' ? JSON.parse(es.faq_json) : es.faq_json ?? {};
    const questions: Array<{ question: { en: string; es: string }; answer: { en: string; es: string } }> = [];
    const qEn = faqEn.questions ?? [];
    const qEs = faqEs.questions ?? [];
    for (let i = 0; i < Math.max(qEn.length, qEs.length); i++) {
      const qe = qEn[i] ?? {};
      const qs = qEs[i] ?? {};
      questions.push({
        question: { en: s(qe.question), es: s(qs.question) },
        answer: { en: s(qe.answer), es: s(qs.answer) },
      });
    }
    const ctaEnJ: Record<string, unknown> = typeof en.cta_section_json === 'string' ? JSON.parse(en.cta_section_json) : en.cta_section_json ?? {};
    const ctaEsJ: Record<string, unknown> = typeof es.cta_section_json === 'string' ? JSON.parse(es.cta_section_json) : es.cta_section_json ?? {};
    const primaryEn = (ctaEnJ.primaryCTA as Record<string, unknown>) ?? {};
    const primaryEs = (ctaEsJ.primaryCTA as Record<string, unknown>) ?? {};
    const secondaryEn = (ctaEnJ.secondaryCTA as Record<string, unknown>) ?? {};
    const secondaryEs = (ctaEsJ.secondaryCTA as Record<string, unknown>) ?? {};
    const content = {
      hero: {
        title: { en: s(en.hero_title), es: s(es.hero_title) },
        subtitle: { en: s(en.hero_subtitle), es: s(es.hero_subtitle) },
        backgroundImage: en.hero_background_image === es.hero_background_image ? s(en.hero_background_image) : { en: s(en.hero_background_image), es: s(es.hero_background_image) },
        backgroundImageAlt: { en: s(en.hero_background_image_alt), es: s(es.hero_background_image_alt) },
      },
      pricing: {
        title: { en: s(pEn.title), es: s(pEs.title) },
        sessions,
      },
      insurance: {
        title: { en: s(insEn.title), es: s(insEs.title) },
        description: { en: s(insEn.description), es: s(insEs.description) },
        providerList,
        providers,
        modal: {
          title: { en: s(modalEn.title), es: s(modalEs.title) },
          description: { en: s(modalEn.description), es: s(modalEs.description) },
          outOfNetworkInfo: { en: s(modalEn.outOfNetworkInfo), es: s(modalEs.outOfNetworkInfo) },
          note: { en: s(modalEn.note), es: s(modalEs.note) },
          cta: { text: { en: s(ctaEn.text), es: s(ctaEs.text) }, href: { en: s(ctaEn.href), es: s(ctaEs.href) } },
        },
      },
      paymentOptions: {
        title: { en: s(poEn.title), es: s(poEs.title) },
        description: { en: s(poEn.description), es: s(poEs.description) },
        options,
      },
      faq: {
        title: { en: s(faqEn.title), es: s(faqEs.title) },
        questions,
      },
      ctaSection: {
        title: { en: s(ctaEnJ.title), es: s(ctaEsJ.title) },
        subtitle: { en: s(ctaEnJ.subtitle), es: s(ctaEsJ.subtitle) },
        primaryCTA: { text: { en: s(primaryEn.text), es: s(primaryEs.text) }, href: { en: s(primaryEn.href), es: s(primaryEs.href) } },
        secondaryCTA: { text: { en: s(secondaryEn.text), es: s(secondaryEs.text) }, href: { en: s(secondaryEn.href), es: s(secondaryEs.href) } },
      },
    };
    const page: ContentPage = { meta, seo, content };
    pageCache.set(cacheKey, page);
    return page;
  } finally {
    await conn.end().catch(() => {});
  }
}

/** Lee Contact desde page_contact (campos editables) y form desde page_content. Mismo formato que GET /api/content/contact. */
async function getContactContentFromDb(): Promise<ContentPage> {
  const cacheKey = 'contact';
  if (pageCache.has(cacheKey)) {
    return pageCache.get(cacheKey)!;
  }
  const conn = await getDbConnection();
  try {
    const [rows] = await conn.execute<
      { locale: string; meta_last_updated: string; meta_version: number; seo_title: string; seo_description: string; hero_title: string; address_street: string; address_city: string; address_state: string; address_zip: string; phone: string; email: string; office_hours_title: string; office_hours_hours: string; office_hours_note: string; facebook_url: string; instagram_url: string; updated_at: string }[]
    >(
      'SELECT locale, meta_last_updated, meta_version, seo_title, seo_description, hero_title, address_street, address_city, address_state, address_zip, phone, email, office_hours_title, office_hours_hours, office_hours_note, facebook_url, instagram_url, updated_at FROM page_contact WHERE locale IN (\'en\', \'es\')'
    );
    const list = Array.isArray(rows) ? rows : (rows as any) ?? [];
    const byLocale = Object.fromEntries(list.map((r) => [String(r.locale), r]));
    const en = byLocale.en;
    const es = byLocale.es;
    if (!en || !es) {
      throw new Error('contact: missing en or es row in page_contact');
    }
    const s = (v: unknown) => (v != null ? String(v) : '');
    let lastUpdated = s(en.meta_last_updated ?? en.updated_at);
    if (lastUpdated && !Number.isNaN(Date.parse(lastUpdated))) {
      lastUpdated = new Date(lastUpdated).toISOString();
    } else {
      lastUpdated = new Date().toISOString();
    }
    const meta = { pageId: 'contact' as const, lastUpdated, version: Number(en.meta_version) || 1 };
    const seo = {
      title: { en: s(en.seo_title), es: s(es.seo_title) },
      description: { en: s(en.seo_description), es: s(es.seo_description) },
    };
    const content: Record<string, unknown> = {
      hero: {
        title: { en: s(en.hero_title), es: s(es.hero_title) },
      },
      contactInfo: {
        address: {
          street: { en: s(en.address_street), es: s(es.address_street) },
          city: { en: s(en.address_city), es: s(es.address_city) },
          state: { en: s(en.address_state), es: s(es.address_state) },
          zip: { en: s(en.address_zip), es: s(es.address_zip) },
        },
        phone: { en: s(en.phone), es: s(es.phone) },
        email: { en: s(en.email), es: s(es.email) },
        officeHours: {
          title: { en: s(en.office_hours_title), es: s(es.office_hours_title) },
          hours: { en: s(en.office_hours_hours), es: s(es.office_hours_hours) },
          note: { en: s(en.office_hours_note), es: s(es.office_hours_note) },
        },
        socialMedia: {
          facebook: { en: s(en.facebook_url), es: s(es.facebook_url) },
          instagram: { en: s(en.instagram_url), es: s(es.instagram_url) },
        },
      },
    };
    const [formRows] = await conn.execute<{ content: string }[]>(
      'SELECT content FROM page_content WHERE page_id = ? LIMIT 1',
      ['contact']
    );
    const formRow = Array.isArray(formRows) ? formRows[0] : (formRows as any)?.[0];
    if (formRow && formRow.content) {
      try {
        const blob = typeof formRow.content === 'string' ? JSON.parse(formRow.content) : formRow.content;
        if (blob && typeof blob === 'object' && blob.form) {
          content.form = blob.form;
        }
      } catch (_) {}
    }
    if (!content.form) {
      content.form = {
        introText: { en: "We'd love to hear from you! Fill out the form below.", es: '¡Nos encantaría saber de ti! Completa el formulario.' },
        fields: {
          name: { label: { en: 'Name', es: 'Nombre' }, placeholder: { en: 'Your name', es: 'Tu nombre' } },
          email: { label: { en: 'Email', es: 'Correo' }, placeholder: { en: 'your@email.com', es: 'tu@correo.com' } },
          comment: { label: { en: 'Comment', es: 'Comentario' }, placeholder: { en: 'Your message...', es: 'Tu mensaje...' } },
        },
        submitButton: { en: 'Send', es: 'Enviar' },
      };
    }
    const page: ContentPage = { meta, seo, content: content as ContentPage['content'] };
    pageCache.set(cacheKey, page);
    return page;
  } finally {
    await conn.end().catch(() => {});
  }
}

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

/** Lee Services desde page_services (2 filas en/es) + page_services_condition (7 filas). Mismo formato que GET /api/content/services. */
async function getServicesContentFromDb(): Promise<ContentPage> {
  const cacheKey = 'services';
  if (pageCache.has(cacheKey)) {
    return pageCache.get(cacheKey)!;
  }
  const conn = await getDbConnection();
  try {
    const [rows] = await conn.execute<
      { locale: string; meta_last_updated: string; meta_version: number; seo_title: string; seo_description: string; hero_title: string; hero_subtitle: string; hero_background_image: string; hero_background_image_alt: string; quick_jump_text: string; immigration_evaluation_text: string; intro_text: string; categories_json: string; conditions_section_title: string; conditions_section_subtitle: string; cta_section_json: string; updated_at: string }[]
    >(
      'SELECT locale, meta_last_updated, meta_version, seo_title, seo_description, hero_title, hero_subtitle, hero_background_image, hero_background_image_alt, quick_jump_text, immigration_evaluation_text, intro_text, categories_json, conditions_section_title, conditions_section_subtitle, cta_section_json, updated_at FROM page_services WHERE locale IN (\'en\', \'es\')'
    );
    const list = Array.isArray(rows) ? rows : (rows as any) ?? [];
    const byLocale = Object.fromEntries(list.map((r) => [String(r.locale), r]));
    const en = byLocale.en;
    const es = byLocale.es;
    if (!en || !es) {
      throw new Error('services: missing en or es row in page_services');
    }
    const s = (v: unknown) => (v != null ? String(v) : '');
    let lastUpdated = s(en.meta_last_updated ?? en.updated_at);
    if (lastUpdated && !Number.isNaN(Date.parse(lastUpdated))) {
      lastUpdated = new Date(lastUpdated).toISOString();
    } else {
      lastUpdated = new Date().toISOString();
    }
    const meta = { pageId: 'services' as const, lastUpdated, version: Number(en.meta_version) || 1 };
    const seo = {
      title: { en: s(en.seo_title), es: s(es.seo_title) },
      description: { en: s(en.seo_description), es: s(es.seo_description) },
    };
    const catEn: Array<{ id?: string; title?: string; services?: Array<{ id?: string; name?: string; description?: string; icon?: string }> }> = typeof en.categories_json === 'string' ? JSON.parse(en.categories_json) : en.categories_json ?? [];
    const catEs: Array<{ id?: string; title?: string; services?: Array<{ id?: string; name?: string; description?: string; icon?: string }> }> = typeof es.categories_json === 'string' ? JSON.parse(es.categories_json) : es.categories_json ?? [];
    const categories: Array<{ id: string; title: { en: string; es: string }; services: Array<{ id: string; name: { en: string; es: string }; description: { en: string; es: string }; icon: string }> }> = [];
    for (let i = 0; i < Math.max(catEn.length, catEs.length); i++) {
      const ce = catEn[i] ?? {};
      const cs = catEs[i] ?? {};
      const servEn = ce.services ?? [];
      const servEs = cs.services ?? [];
      const services: Array<{ id: string; name: { en: string; es: string }; description: { en: string; es: string }; icon: string }> = [];
      for (let j = 0; j < Math.max(servEn.length, servEs.length); j++) {
        const se_ = servEn[j] ?? {};
        const ss = servEs[j] ?? {};
        services.push({
          id: s(se_.id ?? ss.id ?? `svc-${i}-${j}`),
          name: { en: s(se_.name), es: s(ss.name) },
          description: { en: s(se_.description), es: s(ss.description) },
          icon: s(se_.icon ?? ss.icon ?? 'document'),
        });
      }
      categories.push({
        id: s(ce.id ?? cs.id ?? `cat-${i}`),
        title: { en: s(ce.title), es: s(cs.title) },
        services,
      });
    }
    const [condRows] = await conn.execute<
      { slug: string; icon: string; title_en: string; title_es: string; short_description_en: string; short_description_es: string; detail_title_en: string; detail_title_es: string; detail_content_en: string; detail_content_es: string }[]
    >('SELECT slug, icon, title_en, title_es, short_description_en, short_description_es, detail_title_en, detail_title_es, detail_content_en, detail_content_es FROM page_services_condition ORDER BY display_order ASC');
    const condList = Array.isArray(condRows) ? condRows : (condRows as any) ?? [];
    const conditions: Array<{ id: string; name: { en: string; es: string }; description: { en: string; es: string }; icon: string; link: string; detailTitle?: { en: string; es: string }; detailContent?: { en: string; es: string } }> = condList.map((row: any) => ({
      id: s(row.slug),
      name: { en: s(row.title_en), es: s(row.title_es) },
      description: { en: s(row.short_description_en), es: s(row.short_description_es) },
      icon: s(row.icon),
      link: '/services/' + s(row.slug),
      detailTitle: { en: s(row.detail_title_en), es: s(row.detail_title_es) },
      detailContent: { en: s(row.detail_content_en), es: s(row.detail_content_es) },
    }));
    const ctaEn: Record<string, unknown> = typeof en.cta_section_json === 'string' ? JSON.parse(en.cta_section_json) : en.cta_section_json ?? {};
    const ctaEs: Record<string, unknown> = typeof es.cta_section_json === 'string' ? JSON.parse(es.cta_section_json) : es.cta_section_json ?? {};
    const primaryEn = (ctaEn.primaryCTAs as Array<Record<string, unknown>>) ?? [];
    const primaryEs = (ctaEs.primaryCTAs as Array<Record<string, unknown>>) ?? [];
    const primaryCTAs: Array<{ id: string; title: { en: string; es: string }; link: string; color: string }> = [];
    for (let i = 0; i < Math.max(primaryEn.length, primaryEs.length); i++) {
      const pe = primaryEn[i] ?? {};
      const ps = primaryEs[i] ?? {};
      primaryCTAs.push({
        id: s(pe.id ?? ps.id ?? `primary-${i}`),
        title: { en: s(pe.title), es: s(ps.title) },
        link: s(pe.link ?? ps.link),
        color: s(pe.color ?? ps.color ?? 'blueGreen'),
      });
    }
    const secEn = (ctaEn.secondaryCTA as Record<string, unknown>) ?? {};
    const secEs = (ctaEs.secondaryCTA as Record<string, unknown>) ?? {};
    const secondaryCTA =
      Object.keys(secEn).length > 0 || Object.keys(secEs).length > 0
        ? {
            id: s(secEn.id ?? secEs.id),
            title: { en: s(secEn.title), es: s(secEs.title) },
            link: s(secEn.link ?? secEs.link),
            text: { en: s(secEn.text), es: s(secEs.text) },
          }
        : null;
    const content = {
      hero: {
        title: { en: s(en.hero_title), es: s(es.hero_title) },
        subtitle: { en: s(en.hero_subtitle), es: s(es.hero_subtitle) },
        backgroundImage: en.hero_background_image === es.hero_background_image ? s(en.hero_background_image) : { en: s(en.hero_background_image), es: s(es.hero_background_image) },
        backgroundImageAlt: { en: s(en.hero_background_image_alt), es: s(es.hero_background_image_alt) },
      },
      quickJump: { text: { en: s(en.quick_jump_text), es: s(es.quick_jump_text) } },
      immigrationEvaluation: { text: { en: s(en.immigration_evaluation_text), es: s(es.immigration_evaluation_text) } },
      intro: { text: { en: s(en.intro_text), es: s(es.intro_text) } },
      categories,
      conditionsSection: {
        title: { en: s(en.conditions_section_title), es: s(es.conditions_section_title) },
        subtitle: { en: s(en.conditions_section_subtitle), es: s(es.conditions_section_subtitle) },
        conditions,
      },
      ctaSection: {
        title: { en: s(ctaEn.title), es: s(ctaEs.title) },
        subtitle: { en: s(ctaEn.subtitle), es: s(ctaEs.subtitle) },
        primaryCTAs,
        secondaryCTA,
      },
    };
    const page: ContentPage = { meta, seo, content };
    pageCache.set(cacheKey, page);
    return page;
  } finally {
    await conn.end().catch(() => {});
  }
}

/** Lee Fellowship desde la tabla plana page_fellowship (2 filas en/es). Formato esperado por FellowshipContentFromApi. */
async function getFellowshipContentFromDb(): Promise<ContentPage> {
  const cacheKey = 'fellowship';
  if (pageCache.has(cacheKey)) {
    return pageCache.get(cacheKey)!;
  }
  const conn = await getDbConnection();
  try {
    const [rows] = await conn.execute<
      { locale: string; meta_last_updated: string; meta_version: number; seo_title: string; seo_description: string; hero_title: string; hero_subtitle: string; hero_description: string; hero_icon: string; hero_announcement: string; mission_title: string; mission_content: string; benefits_json: string; program_details_json: string; how_to_apply_json: string; updated_at: string }[]
    >(
      'SELECT locale, meta_last_updated, meta_version, seo_title, seo_description, hero_title, hero_subtitle, hero_description, hero_icon, hero_announcement, mission_title, mission_content, benefits_json, program_details_json, how_to_apply_json, updated_at FROM page_fellowship WHERE locale IN (\'en\', \'es\')'
    );
    const list = Array.isArray(rows) ? rows : (rows as any) ?? [];
    const byLocale = Object.fromEntries(list.map((r) => [String(r.locale), r]));
    const en = byLocale.en;
    const es = byLocale.es;
    if (!en || !es) {
      throw new Error('fellowship: missing en or es row in page_fellowship');
    }
    const s = (v: unknown) => (v != null ? String(v) : '');
    let lastUpdated = s(en.meta_last_updated ?? en.updated_at);
    if (lastUpdated && !Number.isNaN(Date.parse(lastUpdated))) {
      lastUpdated = new Date(lastUpdated).toISOString();
    } else {
      lastUpdated = new Date().toISOString();
    }
    const meta = { pageId: 'fellowship' as const, lastUpdated, version: Number(en.meta_version) || 1 };
    const seo = {
      title: { en: s(en.seo_title), es: s(es.seo_title) },
      description: { en: s(en.seo_description), es: s(es.seo_description) },
    };
    const benefitsEn: Array<{ id?: string; text?: string }> = typeof en.benefits_json === 'string' ? JSON.parse(en.benefits_json) : en.benefits_json ?? [];
    const benefitsEs: Array<{ id?: string; text?: string }> = typeof es.benefits_json === 'string' ? JSON.parse(es.benefits_json) : es.benefits_json ?? [];
    const benefitsItems: Array<{ id: string; text: { en: string; es: string } }> = [];
    for (let i = 0; i < Math.max(benefitsEn.length, benefitsEs.length); i++) {
      const be = benefitsEn[i] ?? {};
      const bs = benefitsEs[i] ?? {};
      benefitsItems.push({
        id: s(be.id ?? bs.id ?? `benefit-${i}`),
        text: { en: s(be.text), es: s(bs.text) },
      });
    }
    const progEn: { commitment?: string; duration?: { label?: string; value?: string }; deadline?: { label?: string; value?: string } } = typeof en.program_details_json === 'string' ? JSON.parse(en.program_details_json) : en.program_details_json ?? {};
    const progEs: { commitment?: string; duration?: { label?: string; value?: string }; deadline?: { label?: string; value?: string } } = typeof es.program_details_json === 'string' ? JSON.parse(es.program_details_json) : es.program_details_json ?? {};
    const howEn: { title?: string; description?: string; contactEmail?: string; email?: string; applyLink?: { text?: string; url?: string; enabled?: boolean }; footnote?: string } = typeof en.how_to_apply_json === 'string' ? JSON.parse(en.how_to_apply_json) : en.how_to_apply_json ?? {};
    const howEs: { title?: string; description?: string; contactEmail?: string; email?: string; applyLink?: { text?: string; url?: string; enabled?: boolean }; footnote?: string } = typeof es.how_to_apply_json === 'string' ? JSON.parse(es.how_to_apply_json) : es.how_to_apply_json ?? {};
    const content = {
      hero: {
        title: { en: s(en.hero_title), es: s(es.hero_title) },
        subtitle: { en: s(en.hero_subtitle), es: s(es.hero_subtitle) },
        description: { en: s(en.hero_description), es: s(es.hero_description) },
        icon: s(en.hero_icon ?? es.hero_icon ?? 'AcademicCapIcon'),
        announcement: { en: s(en.hero_announcement), es: s(es.hero_announcement) },
      },
      mission: {
        title: { en: s(en.mission_title), es: s(es.mission_title) },
        content: { en: s(en.mission_content), es: s(es.mission_content) },
      },
      benefits: { title: { en: '', es: '' }, items: benefitsItems },
      programDetails: {
        title: { en: '', es: '' },
        commitment: { en: s(progEn.commitment), es: s(progEs.commitment) },
        duration: {
          label: { en: s(progEn.duration?.label), es: s(progEs.duration?.label) },
          value: { en: s(progEn.duration?.value), es: s(progEs.duration?.value) },
        },
        deadline: {
          label: { en: s(progEn.deadline?.label), es: s(progEs.deadline?.label) },
          value: { en: s(progEn.deadline?.value), es: s(progEs.deadline?.value) },
        },
      },
      howToApply: {
        title: { en: s(howEn.title), es: s(howEs.title) },
        description: { en: s(howEn.description), es: s(howEs.description) },
        contactEmail: { en: s(howEn.contactEmail), es: s(howEs.contactEmail) },
        email: s(howEn.email ?? howEs.email ?? ''),
        applyLink: {
          text: { en: s(howEn.applyLink?.text), es: s(howEs.applyLink?.text) },
          url: s(howEn.applyLink?.url ?? howEs.applyLink?.url ?? ''),
          enabled: Boolean(howEn.applyLink?.enabled ?? howEs.applyLink?.enabled),
        },
        footnote: { en: s(howEn.footnote), es: s(howEs.footnote) },
      },
      footnote: { en: s(howEn.footnote), es: s(howEs.footnote) },
    };
    const page: ContentPage = { meta, seo, content };
    pageCache.set(cacheKey, page);
    return page;
  } finally {
    await conn.end().catch(() => {});
  }
}

/** Lee Immigration Evaluations desde la tabla plana page_immigration_evaluations (2 filas en/es). */
async function getImmigrationEvaluationsContentFromDb(): Promise<ContentPage> {
  const cacheKey = 'immigration-evaluations';
  if (pageCache.has(cacheKey)) {
    return pageCache.get(cacheKey)!;
  }
  const conn = await getDbConnection();
  try {
    const [rows] = await conn.execute<
      { locale: string; meta_last_updated: string; meta_version: number; seo_title: string; seo_description: string; hero_title: string; hero_description: string; intro_text: string; specializations_json: string; faq_json: string; cta_title: string; cta_subtitle: string; cta_button_text: string; updated_at: string }[]
    >(
      'SELECT locale, meta_last_updated, meta_version, seo_title, seo_description, hero_title, hero_description, intro_text, specializations_json, faq_json, cta_title, cta_subtitle, cta_button_text, updated_at FROM page_immigration_evaluations WHERE locale IN (\'en\', \'es\')'
    );
    const list = Array.isArray(rows) ? rows : (rows as any) ?? [];
    const byLocale = Object.fromEntries(list.map((r) => [String(r.locale), r]));
    const en = byLocale.en;
    const es = byLocale.es;
    if (!en || !es) {
      throw new Error('immigration-evaluations: missing en or es row in page_immigration_evaluations');
    }
    const s = (v: unknown) => (v != null ? String(v) : '');
    let lastUpdated = s(en.meta_last_updated ?? en.updated_at);
    if (lastUpdated && !Number.isNaN(Date.parse(lastUpdated))) {
      lastUpdated = new Date(lastUpdated).toISOString();
    } else {
      lastUpdated = new Date().toISOString();
    }
    const meta = { pageId: 'immigration-evaluations' as const, lastUpdated, version: Number(en.meta_version) || 1 };
    const seo = {
      title: { en: s(en.seo_title), es: s(es.seo_title) },
      description: { en: s(en.seo_description), es: s(es.seo_description) },
    };
    const specEn: Array<{ id?: string; title?: string; description?: string }> = typeof en.specializations_json === 'string' ? JSON.parse(en.specializations_json) : en.specializations_json ?? [];
    const specEs: Array<{ id?: string; title?: string; description?: string }> = typeof es.specializations_json === 'string' ? JSON.parse(es.specializations_json) : es.specializations_json ?? [];
    const specializations: Array<{ id: string; title: { en: string; es: string }; description: { en: string; es: string } }> = [];
    for (let i = 0; i < Math.max(specEn.length, specEs.length); i++) {
      const se_ = specEn[i] ?? {};
      const ss = specEs[i] ?? {};
      specializations.push({
        id: s(se_.id ?? ss.id ?? `spec-${i}`),
        title: { en: s(se_.title), es: s(ss.title) },
        description: { en: s(se_.description), es: s(ss.description) },
      });
    }
    const faqEn: Array<{ question?: string; answer?: string; paragraphs?: string[]; isSource?: boolean }> = typeof en.faq_json === 'string' ? JSON.parse(en.faq_json) : en.faq_json ?? [];
    const faqEs: Array<{ question?: string; answer?: string; paragraphs?: string[]; isSource?: boolean }> = typeof es.faq_json === 'string' ? JSON.parse(es.faq_json) : es.faq_json ?? [];
    const faq: Array<{ question: { en: string; es: string }; answer?: { en: string; es: string }; paragraphs?: Array<{ en: string; es: string }>; isSource?: boolean }> = [];
    for (let i = 0; i < Math.max(faqEn.length, faqEs.length); i++) {
      const fe = faqEn[i] ?? {};
      const fs = faqEs[i] ?? {};
      const parsEn = fe.paragraphs ?? [];
      const parsEs = fs.paragraphs ?? [];
      const paragraphs: Array<{ en: string; es: string }> = [];
      for (let j = 0; j < Math.max(parsEn.length, parsEs.length); j++) {
        paragraphs.push({ en: s(parsEn[j]), es: s(parsEs[j]) });
      }
      faq.push({
        question: { en: s(fe.question), es: s(fs.question) },
        ...(fe.answer != null || fs.answer != null ? { answer: { en: s(fe.answer), es: s(fs.answer) } } : {}),
        ...(paragraphs.length > 0 ? { paragraphs } : {}),
        ...(fe.isSource === true || fs.isSource === true ? { isSource: true } : {}),
      });
    }
    const content = {
      hero: {
        title: { en: s(en.hero_title), es: s(es.hero_title) },
        description: { en: s(en.hero_description), es: s(es.hero_description) },
      },
      intro: { text: { en: s(en.intro_text), es: s(es.intro_text) } },
      specializations,
      faq,
      cta: {
        title: { en: s(en.cta_title), es: s(es.cta_title) },
        subtitle: { en: s(en.cta_subtitle), es: s(es.cta_subtitle) },
        buttonText: { en: s(en.cta_button_text), es: s(es.cta_button_text) },
      },
    };
    const page: ContentPage = { meta, seo, content };
    pageCache.set(cacheKey, page);
    return page;
  } finally {
    await conn.end().catch(() => {});
  }
}

export async function getPageContentFromDb(
  pageId: string,
  _locale?: 'en' | 'es'
): Promise<ContentPage> {
  if (pageId === 'what-to-expect') {
    return getWhatToExpectContentFromDb();
  }
  if (pageId === 'rates') {
    return getRatesContentFromDb();
  }
  if (pageId === 'contact') {
    return getContactContentFromDb();
  }
  if (pageId === 'services') {
    return getServicesContentFromDb();
  }
  if (pageId === 'fellowship') {
    return getFellowshipContentFromDb();
  }
  if (pageId === 'immigration-evaluations') {
    return getImmigrationEvaluationsContentFromDb();
  }
  const cacheKey = pageId;
  if (pageCache.has(cacheKey)) {
    return pageCache.get(cacheKey)!;
  }
  const conn = await getDbConnection();
  try {
    const [rows] = await conn.execute<{ meta: string; seo: string; content: string; updated_at: string }[]>(
      'SELECT meta, seo, content, updated_at FROM page_content WHERE page_id = ? LIMIT 1',
      [pageId]
    );
    const row = Array.isArray(rows) ? rows[0] : (rows as any)?.[0];
    if (!row) {
      throw new Error(`Page not found in DB: ${pageId}`);
    }
    const meta = typeof row.meta === 'string' ? JSON.parse(row.meta) : row.meta;
    if (row.updated_at && meta && typeof meta === 'object') {
      meta.lastUpdated = row.updated_at;
    }
    const page: ContentPage = {
      meta: meta ?? {},
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
  if (type === 'footer') {
    return getFooterContentFromDb();
  }
  return getHeaderContentFromDb();
}

/** Lee el header desde la tabla plana page_shared_header (migración 028/029: menu + navigation.items). Ya no usa page_content. */
async function getHeaderContentFromDb(): Promise<ContentPage> {
  const cacheKey = 'shared-header';
  if (pageCache.has(cacheKey)) {
    return pageCache.get(cacheKey)!;
  }
  const conn = await getDbConnection();
  try {
    const [rows] = await conn.execute<Record<string, unknown>[]>(
      'SELECT locale, meta_last_updated, meta_version, seo_title, seo_description, menu_label, menu_close_label, nav_link1_label, nav_link1_link, nav_link2_label, nav_link2_link, nav_link3_label, nav_link3_link, nav_link4_label, nav_link4_link, nav_link5_label, nav_link5_link, nav_link6_label, nav_link6_link FROM page_shared_header WHERE locale IN (\'en\', \'es\')'
    );
    const list = Array.isArray(rows) ? rows : (rows as any) ?? [];
    const byLocale = Object.fromEntries(list.map((r: Record<string, unknown>) => [String(r.locale), r]));
    const en = byLocale.en;
    const es = byLocale.es;
    if (!en || !es) {
      throw new Error('shared-header: missing en or es row in page_shared_header. Run migration 028.');
    }
    const str = (v: unknown) => (v != null ? String(v) : '');
    const content = {
      menu: {
        label: { en: str(en.menu_label), es: str(es.menu_label) },
        closeLabel: { en: str(en.menu_close_label), es: str(es.menu_close_label) },
      },
      navigation: {
        items: [
          { label: { en: str(en.nav_link1_label), es: str(es.nav_link1_label) }, link: str(en.nav_link1_link) },
          { label: { en: str(en.nav_link2_label), es: str(es.nav_link2_label) }, link: str(en.nav_link2_link) },
          { label: { en: str(en.nav_link3_label), es: str(es.nav_link3_label) }, link: str(en.nav_link3_link) },
          { label: { en: str(en.nav_link4_label), es: str(es.nav_link4_label) }, link: str(en.nav_link4_link) },
          { label: { en: str(en.nav_link5_label), es: str(es.nav_link5_label) }, link: str(en.nav_link5_link) },
          { label: { en: str(en.nav_link6_label), es: str(es.nav_link6_label) }, link: str(en.nav_link6_link) },
        ],
      },
    };
    const page: ContentPage = {
      meta: {
        pageId: 'shared-header',
        lastUpdated: str(en.meta_last_updated) || new Date().toISOString(),
        version: Number(en.meta_version) || 1,
      },
      seo: {
        title: { en: str(en.seo_title), es: str(es.seo_title) },
        description: { en: str(en.seo_description), es: str(es.seo_description) },
      },
      content,
    };
    pageCache.set(cacheKey, page);
    return page;
  } finally {
    await conn.end().catch(() => {});
  }
}

/** Lee el footer desde la tabla plana page_shared_footer (esquema augushub: nav_title, nav_link1..6, copyright, link1..6). */
async function getFooterContentFromDb(): Promise<ContentPage> {
  const cacheKey = 'shared-footer';
  if (pageCache.has(cacheKey)) {
    return pageCache.get(cacheKey)!;
  }
  const conn = await getDbConnection();
  try {
    const [rows] = await conn.execute<Record<string, unknown>[]>(
      'SELECT locale, meta_last_updated, meta_version, company_name, company_tagline, copyright, nav_title, nav_link1_label, nav_link1_link, nav_link2_label, nav_link2_link, nav_link3_label, nav_link3_link, nav_link4_label, nav_link4_link, nav_link5_label, nav_link5_link, nav_link6_label, nav_link6_link, resources_title, link1_label, link1_link, link1_is_modal, link2_label, link2_link, link2_is_modal, link3_label, link3_link, link3_is_modal, link4_label, link4_link, link4_is_modal, link5_label, link5_link, link5_is_modal, link6_label, link6_link, link6_is_modal FROM page_shared_footer WHERE locale IN (\'en\', \'es\')'
    );
    const list = Array.isArray(rows) ? rows : (rows as any) ?? [];
    const byLocale = Object.fromEntries(list.map((r: Record<string, unknown>) => [String(r.locale), r]));
    const en = byLocale.en;
    const es = byLocale.es;
    if (!en || !es) {
      throw new Error('shared-footer: missing en or es row in page_shared_footer');
    }
    const str = (v: unknown) => (v != null ? String(v) : '');
    const content = {
      companyInfo: {
        name: { en: str(en.company_name), es: str(es.company_name) },
        tagline: { en: str(en.company_tagline), es: str(es.company_tagline) },
      },
      navigation: {
        title: { en: str(en.nav_title), es: str(es.nav_title) },
        items: [
          { label: { en: str(en.nav_link1_label), es: str(es.nav_link1_label) }, link: str(en.nav_link1_link) },
          { label: { en: str(en.nav_link2_label), es: str(es.nav_link2_label) }, link: str(en.nav_link2_link) },
          { label: { en: str(en.nav_link3_label), es: str(es.nav_link3_label) }, link: str(en.nav_link3_link) },
          { label: { en: str(en.nav_link4_label), es: str(es.nav_link4_label) }, link: str(en.nav_link4_link) },
          { label: { en: str(en.nav_link5_label), es: str(es.nav_link5_label) }, link: str(en.nav_link5_link) },
          { label: { en: str(en.nav_link6_label), es: str(es.nav_link6_label) }, link: str(en.nav_link6_link) },
        ],
      },
      resources: {
        title: { en: str(en.resources_title), es: str(es.resources_title) },
        items: [
          { label: { en: str(en.link1_label), es: str(es.link1_label) }, link: str(en.link1_link), isModal: Boolean(en.link1_is_modal) },
          { label: { en: str(en.link2_label), es: str(es.link2_label) }, link: str(en.link2_link), isModal: Boolean(en.link2_is_modal) },
          { label: { en: str(en.link3_label), es: str(es.link3_label) }, link: str(en.link3_link), isModal: Boolean(en.link3_is_modal) },
          { label: { en: str(en.link4_label), es: str(es.link4_label) }, link: str(en.link4_link), isModal: Boolean(en.link4_is_modal) },
          { label: { en: str(en.link5_label), es: str(es.link5_label) }, link: str(en.link5_link), isModal: Boolean(en.link5_is_modal) },
          { label: { en: str(en.link6_label), es: str(es.link6_label) }, link: str(en.link6_link), isModal: Boolean(en.link6_is_modal) },
        ],
      },
      copyright: { en: str(en.copyright), es: str(es.copyright) },
    };
    const page: ContentPage = {
      meta: {
        pageId: 'shared-footer',
        lastUpdated: str(en.meta_last_updated) || new Date().toISOString(),
        version: Number(en.meta_version) || 1,
      },
      seo: {},
      content,
    };
    pageCache.set(cacheKey, page);
    return page;
  } finally {
    await conn.end().catch(() => {});
  }
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
