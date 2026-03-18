/**
 * ServicesContentFromApi - Contenido de la página Services cargado desde la API en el cliente.
 * Cuando PUBLIC_USE_CONTENT_FROM_BD está activo, hace fetch a GET /api/content/services
 * para que los cambios guardados en la BD (títulos, descripciones, categorías) se vean
 * en el sitio en vivo sin depender del build. Re-consulta la API al cargar, cada 60 s
 * y al volver a la pestaña.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { getPageContent } from '@/data/services/contentService';
import type { ContentPage } from '@/data/models/ContentPage';
import type { LocalizedText } from '@/data/models/ContentPage';
import { getLocaleFromPathname } from '@/utils/i18n';
import QuickJumpLink from './QuickJumpLink';
import ImmigrationEvaluationLink from './ImmigrationEvaluationLink';
import ServicesGrid from './ServicesGrid';
import ConditionsSection from './ConditionsSection';
import ServicesCTA from './ServicesCTA';

interface ServicesContentFromApiProps {
  lang: 'en' | 'es';
  /** Datos iniciales del build para primera pintada; luego se reemplazan por la API. */
  initialData: ContentPage | null;
}

const REFETCH_INTERVAL_MS = 60_000;

/** Convierte valor de API (string o { en, es }) a LocalizedText. */
function toLocalizedText(val: unknown): LocalizedText {
  if (val == null) return { en: '', es: '' };
  if (typeof val === 'string') return val;
  if (typeof val === 'object' && val !== null && 'en' in val && 'es' in val) {
    return { en: String((val as { en?: unknown }).en ?? ''), es: String((val as { es?: unknown }).es ?? '') };
  }
  if (typeof val === 'object' && val !== null && ('title_en' in val || 'title_es' in val)) {
    const o = val as Record<string, unknown>;
    return { en: String(o.title_en ?? o.en ?? ''), es: String(o.title_es ?? o.es ?? '') };
  }
  return { en: '', es: '' };
}

/** Normaliza una categoría desde la API al formato que esperan ServicesGrid/ServiceCategory. */
function normalizeCategory(raw: unknown, index: number): { id: string; title: LocalizedText; services: Array<{ id: string; name: LocalizedText; description: LocalizedText; icon: string }> } | null {
  if (raw == null || typeof raw !== 'object') return null;
  const o = raw as Record<string, unknown>;
  const id = String(o.id ?? o.categoryId ?? `cat-${index}`);
  let title: LocalizedText;
  if (o.title != null && typeof o.title === 'object' && o.title !== null && 'en' in o.title && 'es' in o.title) {
    title = o.title as LocalizedText;
  } else if (o.title_en != null || o.title_es != null) {
    title = { en: String(o.title_en ?? ''), es: String(o.title_es ?? '') };
  } else {
    title = toLocalizedText(o.title);
  }
  const rawServices = Array.isArray(o.services) ? o.services : [];
  const services = rawServices.map((s: unknown, i: number) => {
    const svc = (s != null && typeof s === 'object') ? (s as Record<string, unknown>) : {};
    let name: LocalizedText;
    let description: LocalizedText;
    if (svc.name != null && typeof svc.name === 'object' && svc.name !== null && 'en' in svc.name && 'es' in svc.name) {
      name = svc.name as LocalizedText;
    } else if (svc.name_en != null || svc.name_es != null) {
      name = { en: String(svc.name_en ?? ''), es: String(svc.name_es ?? '') };
    } else {
      name = toLocalizedText(svc.name);
    }
    if (svc.description != null && typeof svc.description === 'object' && svc.description !== null && 'en' in svc.description && 'es' in svc.description) {
      description = svc.description as LocalizedText;
    } else if (svc.description_en != null || svc.description_es != null) {
      description = { en: String(svc.description_en ?? ''), es: String(svc.description_es ?? '') };
    } else {
      description = toLocalizedText(svc.description);
    }
    return {
      id: String(svc.id ?? svc.serviceId ?? `svc-${index}-${i}`),
      name,
      description,
      icon: String(svc.icon ?? svc.iconName ?? 'document'),
    };
  });
  const hasTitle = (() => {
    if (typeof title === 'string') return title.trim().length > 0;
    if (title && typeof title === 'object') {
      const t = title as { en?: unknown; es?: unknown };
      return String(t.en ?? '').trim().length > 0 || String(t.es ?? '').trim().length > 0;
    }
    return false;
  })();
  if (!hasTitle && services.length === 0) return null;
  return { id, title, services };
}

/** CTAs por defecto cuando la BD devuelve ctas vacío (como en la referencia: "I need help", "My loved one needs help", "I need to make a referral"). */
const DEFAULT_PRIMARY_CTAS = [
  { id: 'default-help-me', title: { en: 'I need help', es: 'Necesito ayuda' } as LocalizedText, link: '/contact/i-need-help', color: 'blueGreen' },
  { id: 'default-help-other', title: { en: 'My loved one needs help', es: 'Mi ser querido necesita ayuda' } as LocalizedText, link: '/contact/loved-one-needs-help', color: 'navy' },
];
const DEFAULT_SECONDARY_CTA = {
  id: 'default-referral',
  title: { en: 'I need to make a referral', es: 'Necesito hacer una referencia' } as LocalizedText,
  link: '/contact/referral',
  text: { en: 'For healthcare providers and professionals', es: 'Para proveedores de salud y profesionales' } as LocalizedText,
};

export default function ServicesContentFromApi({ lang: langProp, initialData }: ServicesContentFromApiProps) {
  const [content, setContent] = useState<ContentPage | null>(initialData);
  const [error, setError] = useState<string | null>(null);
  const lang = typeof window !== 'undefined' ? getLocaleFromPathname(window.location.pathname) : langProp;

  const fetchContent = useCallback(() => {
    const currentLang = typeof window !== 'undefined' ? getLocaleFromPathname(window.location.pathname) : langProp;
    getPageContent('services', currentLang)
      .then((data) => {
        setContent(data);
        setError(null);
      })
      .catch((err) => {
        setError(err?.message ?? 'Failed to load content');
      });
  }, []);

  useEffect(() => {
    fetchContent();
    const interval = setInterval(fetchContent, REFETCH_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [fetchContent]);

  useEffect(() => {
    const onFocus = () => fetchContent();
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, [fetchContent]);

  if (error) {
    return (
      <div className="py-12 px-4 text-center text-gray-700 max-w-xl mx-auto">
        <p className="font-medium text-red-700 mb-2">No se pudo cargar el contenido.</p>
        <p className="text-sm text-gray-600">{error}</p>
      </div>
    );
  }

  const data = content ?? initialData;

  if (!data?.content) {
    return (
      <div className="py-12 px-4 text-center text-gray-500">
        <p>Cargando…</p>
      </div>
    );
  }

  const contentObj = data.content as Record<string, unknown>;
  const quickJump = contentObj.quickJump;
  const immigrationEvaluation = contentObj.immigrationEvaluation;
  const intro = contentObj.intro;
  const conditionsSection = contentObj.conditionsSection;
  const ctaSection = contentObj.ctaSection;

  const getLocalizedTextField = (section: unknown): LocalizedText | null => {
    if (section == null || typeof section !== 'object') return null;
    const o = section as Record<string, unknown>;
    return (o.text as LocalizedText) ?? null;
  };

  const quickJumpText = getLocalizedTextField(quickJump);
  const immigrationEvaluationText = getLocalizedTextField(immigrationEvaluation);
  const introText = getLocalizedTextField(intro);

  // Categorías: la API puede devolver content.categories o (en algunos formatos) content.services como array de categorías.
  const categoriesFromApi = Array.isArray(contentObj.categories) ? contentObj.categories : [];
  const servicesAsCategories = Array.isArray(contentObj.services) ? contentObj.services : [];
  const rawCategories = categoriesFromApi.length > 0 ? categoriesFromApi : servicesAsCategories;

  // Conditions We Support
  const conditionsSectionTyped = conditionsSection as { title?: unknown; subtitle?: unknown; conditions?: unknown[] } | null;
  const conditionsList = conditionsSectionTyped && Array.isArray(conditionsSectionTyped.conditions) ? conditionsSectionTyped.conditions : [];
  const hasConditionsContent = conditionsList.length > 0 || (conditionsSectionTyped?.title != null) || (conditionsSectionTyped?.subtitle != null);
  const showConditionsSection = conditionsSectionTyped != null && hasConditionsContent;

  // Normalizar categorías: la API/BD puede devolver title_en/title_es o title: { en, es }, y services con name_en/name_es.
  const normalizedCategories = rawCategories
    .map((cat: unknown, i: number) => normalizeCategory(cat, i))
    .filter((c): c is NonNullable<typeof c> => c != null);

  // Normalizar CTAs: la BD puede enviar ctaSection.ctas[] o primaryCTAs/secondaryCTA. Si ctas está vacío, usar valores por defecto para que la sección se vea completa.
  let primaryCTAs: any[] = [];
  let secondaryCTA: any = null;
  if (ctaSection) {
    const anySection = ctaSection as any;
    if (Array.isArray(anySection.primaryCTAs) && anySection.primaryCTAs.length > 0) {
      primaryCTAs = anySection.primaryCTAs;
      secondaryCTA = anySection.secondaryCTA ?? null;
    } else if (Array.isArray(anySection.ctas) && anySection.ctas.length > 0) {
      const list = anySection.ctas as any[];
      primaryCTAs = list.slice(0, 2).map((item: any, index: number) => ({
        id: String(item.id ?? `primary-${index}`),
        title: item.title ?? item.text ?? { en: '', es: '' },
        link: item.link ?? '#',
        color: item.color ?? (index === 0 ? 'blueGreen' : 'navy'),
      }));
      const third = list[2];
      if (third) {
        secondaryCTA = {
          id: String(third.id ?? 'secondary'),
          title: third.title ?? third.text ?? { en: '', es: '' },
          link: third.link ?? '#',
          text: third.text ?? third.description ?? { en: '', es: '' },
        };
      }
    } else {
      primaryCTAs = DEFAULT_PRIMARY_CTAS;
      secondaryCTA = DEFAULT_SECONDARY_CTA;
    }
  }

  return (
    <>
      {quickJumpText != null && <QuickJumpLink text={quickJumpText} language={lang} />}
      {immigrationEvaluationText != null && <ImmigrationEvaluationLink text={immigrationEvaluationText} language={lang} />}
      <ServicesGrid
        categories={normalizedCategories}
        language={lang}
        introText={introText ?? undefined}
      />
      {showConditionsSection && conditionsSectionTyped && (
        <ConditionsSection
          title={(conditionsSectionTyped.title as LocalizedText) ?? { en: '', es: '' }}
          subtitle={(conditionsSectionTyped.subtitle as LocalizedText) ?? { en: '', es: '' }}
          conditions={conditionsList as any}
          language={lang}
        />
      )}
      {ctaSection && (() => {
        const sec = ctaSection as { title?: LocalizedText; subtitle?: LocalizedText };
        const hasTitle = sec.title && (typeof sec.title === 'string' ? sec.title : (sec.title.en || sec.title.es));
        const hasSubtitle = sec.subtitle && (typeof sec.subtitle === 'string' ? sec.subtitle : (sec.subtitle.en || sec.subtitle.es));
        const ctaTitle = hasTitle ? sec.title! : { en: 'Ready to get started?', es: '¿Listo para comenzar?' } as LocalizedText;
        const ctaSubtitle = hasSubtitle ? sec.subtitle! : { en: "We're here to support you on your healing journey.", es: 'Estamos aquí para apoyarte en tu camino de sanación.' } as LocalizedText;
        return (
          <ServicesCTA
            title={ctaTitle}
            subtitle={ctaSubtitle}
            primaryCTAs={primaryCTAs}
            secondaryCTA={secondaryCTA}
            language={lang}
          />
        );
      })()}
    </>
  );
}
