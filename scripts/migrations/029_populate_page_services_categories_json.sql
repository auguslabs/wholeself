-- Poblar page_services.categories_json con las 4 categorías y sus servicios
-- (Evaluation & Consultation, Individual Psychotherapy, Family & Group Therapy, Support & Community Services).
-- Ejecutar en la BD que usa content.php (ej. en phpMyAdmin en el servidor).

-- ========== LOCALE 'en' ==========
UPDATE page_services
SET categories_json = '[
  {
    "id": "evaluation-consultation",
    "title": "Evaluation & Consultation",
    "services": [
      {"id": "consultation", "name": "Consultation", "description": "Initial consultation to understand your needs.", "icon": "ChatBubbleLeftRightIcon"},
      {"id": "psychiatric-eval", "name": "Psychiatric Diagnostic Evaluation", "description": "Comprehensive evaluation of mental health needs.", "icon": "ClipboardDocumentCheckIcon"},
      {"id": "treatment-plan", "name": "Treatment Plan Development", "description": "Personalized plan aligned with your goals.", "icon": "ClipboardDocumentListIcon"}
    ]
  },
  {
    "id": "individual-psychotherapy",
    "title": "Individual Psychotherapy",
    "services": [
      {"id": "individual-therapy", "name": "Individual Psychotherapy", "description": "One-on-one therapy tailored to your needs.", "icon": "UserIcon"},
      {"id": "crisis-therapy", "name": "Psychotherapy for crisis", "description": "Immediate support during difficult times.", "icon": "ExclamationTriangleIcon"}
    ]
  },
  {
    "id": "family-group-therapy",
    "title": "Family & Group Therapy",
    "services": [
      {"id": "family-without-patient", "name": "Family Psychotherapy, without patient", "description": "Support for family members without the patient present.", "icon": "UsersIcon"},
      {"id": "family-conjoint", "name": "Family Psychotherapy, conjoint psychotherapy, with patient present", "description": "Family sessions with the patient present.", "icon": "UserGroupIcon"},
      {"id": "group-therapy", "name": "Group Psychotherapy, other than multiple-family group", "description": "Therapeutic groups for shared support and growth.", "icon": "RectangleGroupIcon"},
      {"id": "couples-therapy", "name": "Couples Therapy", "description": "Support to strengthen communication and connection.", "icon": "HeartIcon"}
    ]
  },
  {
    "id": "support-community",
    "title": "Support & Community Services",
    "services": [
      {"id": "eap-session", "name": "EAP Session", "description": "Workplace mental health support through EAP.", "icon": "BriefcaseIcon"},
      {"id": "peer-support", "name": "Peer support services", "description": "Support from people with lived experience.", "icon": "HandRaisedIcon"},
      {"id": "community-support", "name": "Comprehensive community support services", "description": "Community-based support for overall well-being.", "icon": "GlobeAmericasIcon"}
    ]
  }
]',
    meta_last_updated = NOW(),
    updated_at = NOW()
WHERE locale = 'en';

-- ========== LOCALE 'es' ==========
UPDATE page_services
SET categories_json = '[
  {
    "id": "evaluation-consultation",
    "title": "Evaluación y Consulta",
    "services": [
      {"id": "consultation", "name": "Consulta", "description": "Consulta inicial para entender tus necesidades.", "icon": "ChatBubbleLeftRightIcon"},
      {"id": "psychiatric-eval", "name": "Evaluación diagnóstica psiquiátrica", "description": "Evaluación integral de necesidades de salud mental.", "icon": "ClipboardDocumentCheckIcon"},
      {"id": "treatment-plan", "name": "Desarrollo del plan de tratamiento", "description": "Plan personalizado alineado con tus metas.", "icon": "ClipboardDocumentListIcon"}
    ]
  },
  {
    "id": "individual-psychotherapy",
    "title": "Psicoterapia Individual",
    "services": [
      {"id": "individual-therapy", "name": "Psicoterapia individual", "description": "Terapia uno a uno adaptada a tus necesidades.", "icon": "UserIcon"},
      {"id": "crisis-therapy", "name": "Psicoterapia para crisis", "description": "Apoyo inmediato en momentos difíciles.", "icon": "ExclamationTriangleIcon"}
    ]
  },
  {
    "id": "family-group-therapy",
    "title": "Terapia Familiar y Grupal",
    "services": [
      {"id": "family-without-patient", "name": "Psicoterapia familiar, sin el paciente", "description": "Apoyo a familiares sin el paciente presente.", "icon": "UsersIcon"},
      {"id": "family-conjoint", "name": "Psicoterapia familiar conjunta, con el paciente presente", "description": "Sesiones familiares con el paciente presente.", "icon": "UserGroupIcon"},
      {"id": "group-therapy", "name": "Psicoterapia grupal, distinta a grupo multifamiliar", "description": "Grupos terapéuticos para apoyo mutuo y crecimiento.", "icon": "RectangleGroupIcon"},
      {"id": "couples-therapy", "name": "Terapia de pareja", "description": "Apoyo para fortalecer la comunicación y la conexión.", "icon": "HeartIcon"}
    ]
  },
  {
    "id": "support-community",
    "title": "Servicios de Apoyo y Comunitarios",
    "services": [
      {"id": "eap-session", "name": "Sesión EAP", "description": "Apoyo de salud mental en el trabajo a través de EAP.", "icon": "BriefcaseIcon"},
      {"id": "peer-support", "name": "Servicios de apoyo entre pares", "description": "Apoyo de personas con experiencia vivida.", "icon": "HandRaisedIcon"},
      {"id": "community-support", "name": "Servicios comunitarios de apoyo integral", "description": "Apoyo comunitario para el bienestar general.", "icon": "GlobeAmericasIcon"}
    ]
  }
]',
    meta_last_updated = NOW(),
    updated_at = NOW()
WHERE locale = 'es';
