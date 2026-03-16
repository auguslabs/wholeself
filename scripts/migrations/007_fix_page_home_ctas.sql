-- Migración 007: Corregir CTAs en page_home
-- Los campos id, link, icon se guardaron como la cadena "Array" por un PUT anterior.
-- Este script pone los valores correctos para que la API devuelva títulos, descripciones e iconos.
-- Ejecutar contra la misma BD que usa public/api/content.php (p. ej. wholeself_forms).

-- Locale EN
UPDATE page_home SET
  cta1_id = 'i-need-help',
  cta1_title = 'I need help',
  cta1_description = 'Take the first step at your own pace.',
  cta1_link = '/contact/i-need-help',
  cta1_icon = 'HandRaisedIcon',
  cta2_id = 'loved-one',
  cta2_title = 'A loved one needs help',
  cta2_description = 'Resources and guidance for family and friends.',
  cta2_link = '/contact/loved-one-needs-help',
  cta2_icon = 'UserGroupIcon',
  cta3_id = 'referral',
  cta3_title = 'Professional referral',
  cta3_description = 'For clinicians and providers.',
  cta3_link = '/contact/referral',
  cta3_icon = 'ClipboardDocumentCheckIcon'
WHERE locale = 'en';

-- Locale ES
UPDATE page_home SET
  cta1_id = 'i-need-help',
  cta1_title = 'Necesito ayuda',
  cta1_description = 'Da el primer paso a tu propio ritmo.',
  cta1_link = '/contact/i-need-help',
  cta1_icon = 'HandRaisedIcon',
  cta2_id = 'loved-one',
  cta2_title = 'Un ser querido necesita ayuda',
  cta2_description = 'Recursos y orientación para familiares y amigos.',
  cta2_link = '/contact/loved-one-needs-help',
  cta2_icon = 'UserGroupIcon',
  cta3_id = 'referral',
  cta3_title = 'Referido profesional',
  cta3_description = 'Para clínicos y proveedores.',
  cta3_link = '/contact/referral',
  cta3_icon = 'ClipboardDocumentCheckIcon'
WHERE locale = 'es';
