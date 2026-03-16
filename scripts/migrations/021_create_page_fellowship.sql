-- Migración 021: Tabla plana para la página Fellowship (pageId=fellowship).
-- 2 filas: locale 'en' y 'es'. API content.php GET/PUT pageId=fellowship.
--
-- ========== QUÉ HACER ANTES DE IMPLEMENTAR ==========
-- 1. Ejecutar este script en la misma BD que usa public/api/content.php.
-- 2. Los datos se extraen del export de page_content (filas fellowship). Para regenerar el seed:
--      node scripts/migrations/extract-fellowship-json.js "C:\Users\augus\Downloads\page_content-last-downloaded.json"
--    y opcionalmente ejecutar 021_seed_fellowship_from_export.sql.
--
-- ========== ESTRUCTURA ESPERADA POR EL FRONT ==========
-- FellowshipContentFromApi espera: hero (title, subtitle, description, icon, announcement),
-- mission (title, content), benefits (title, items), programDetails, howToApply, footnote.
-- benefits_json, program_details_json y how_to_apply_json guardan la estructura por idioma.
--
-- meta.lastUpdated: rellenar en ISO 8601 para evitar ZodError (ver PATRON-CONTENIDO-DESDE-BD).
-- Ejecutar en la misma BD que public/api/content.php (phpMyAdmin o CLI).

CREATE TABLE IF NOT EXISTS page_fellowship (
  id INT AUTO_INCREMENT PRIMARY KEY,
  locale VARCHAR(5) NOT NULL UNIQUE COMMENT 'en or es',
  meta_last_updated VARCHAR(32),
  meta_version INT DEFAULT 1,
  seo_title VARCHAR(255) DEFAULT '',
  seo_description TEXT,
  hero_title VARCHAR(255) NOT NULL DEFAULT 'Fellowship',
  hero_subtitle VARCHAR(500) DEFAULT '',
  hero_description TEXT,
  hero_icon VARCHAR(64) DEFAULT 'AcademicCapIcon',
  hero_announcement VARCHAR(255) DEFAULT '',
  mission_title VARCHAR(255) DEFAULT '',
  mission_content LONGTEXT,
  benefits_json LONGTEXT NOT NULL COMMENT 'JSON: { title?, items: [{ id, text }] } for this locale',
  program_details_json LONGTEXT NOT NULL COMMENT 'JSON: { commitment, duration: { label, value }, deadline: { label, value } } for this locale',
  how_to_apply_json LONGTEXT NOT NULL COMMENT 'JSON: { title, description, contactEmail, email, applyLink: { text, url, enabled }, footnote } for this locale',
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- INSERT con datos desde export page_content (extract-fellowship-json.js).
INSERT INTO page_fellowship (locale, meta_last_updated, meta_version, seo_title, seo_description, hero_title, hero_subtitle, hero_description, hero_icon, hero_announcement, mission_title, mission_content, benefits_json, program_details_json, how_to_apply_json) VALUES
('en', '2024-01-15T10:00:00Z', 1, 'The Uplifted and Thriving Therapists Fellowship - WholeSelf Counseling', 'A full-time, paid fellowship for early-career BIPOC therapists. Empowering clinicians through social justice-informed, relationship-centered, and skill-based clinical practice.', 'The Uplifted and Thriving Therapists Fellowship', 'A full-time, Paid Fellowship for Early-Career BIPOC Therapists', 'Empowering BIPOC* non-independently licensed Mental Health Clinicians to transform the mental health field through innovation, resilience, and community.', 'AcademicCapIcon', 'APPLICATIONS OPENING SOON', 'Mission & Vision', 'The Whole Self Fellowship Program exists to train and mentor early-career clinicians through a social justice–informed, relationship-centered, and skill-based approach to clinical practice. We strive to create a learning environment that values self-reflection, community care, and cultural humility, preparing fellows to serve diverse populations with integrity, competence, and compassion.', '[{"id":"living-wage","text":"Full-time, paid position with a living wage"},{"id":"client-load","text":"See 20 clients per week"},{"id":"supervision","text":"Weekly individual supervision + biweekly group supervision"},{"id":"trainings","text":"Monthly trainings on decolonizing and abolitionist therapeutic practices"},{"id":"community","text":"Monthly staff meetings to build community and support"},{"id":"networking","text":"Exclusive networking and mentorship opportunities with experienced BIPOC"}]', '{"commitment":"This is more than a fellowship—it is a full-time commitment to your growth and success as a therapist.","duration":{"label":"Program Duration","value":"18 months"},"deadline":{"label":"Application Deadline","value":"Mid-March"}}', '{"title":"How to Apply","description":"We''ll be ready to share details on how to apply when applications open.","contactEmail":"For more information, contact","email":"fellowship@wholeselfnm.com","applyLink":{"text":"APPLY HERE!","url":"https://docs.google.com/forms/d/e/1FAIpQLSdmKaf9HfBSL-x__HpmLfaXKnznBKOJ3cwbLcxylifVvR_2bg/viewform?pli=1","enabled":false},"footnote":"*BLACK, INDIGENOUS, PEOPLE OF COLOR"}'),
('es', '2024-01-15T10:00:00Z', 1, 'Fellowship de Terapeutas Elevados y en Plenitud - WholeSelf Counseling', 'Un programa de fellowship de tiempo completo y remunerado para terapeutas BIPOC en etapa temprana. Empoderando a clínicos a través de práctica clínica informada por justicia social, centrada en relaciones y basada en habilidades.', 'Fellowship de Terapeutas Elevados y en Plenitud', 'Un Programa de Fellowship de Tiempo Completo y Remunerado para Terapeutas BIPOC en Etapa Temprana', 'Empoderando a clínicos de salud mental BIPOC* sin licencia independiente para transformar el campo de la salud mental a través de innovación, resiliencia y comunidad.', 'AcademicCapIcon', 'LAS APLICACIONES ABRIRÁN PRONTO', 'Misión y Visión', 'El Programa de Fellowship de Whole Self existe para entrenar y mentorizar a clínicos en etapa temprana a través de un enfoque de práctica clínica informado por justicia social, centrado en relaciones y basado en habilidades. Nos esforzamos por crear un ambiente de aprendizaje que valore la autorreflexión, el cuidado comunitario y la humildad cultural, preparando a los fellows para servir a poblaciones diversas con integridad, competencia y compasión.', '[{"id":"living-wage","text":"Posición de tiempo completo y remunerada con salario digno"},{"id":"client-load","text":"Atender 20 clientes por semana"},{"id":"supervision","text":"Supervisión individual semanal + supervisión grupal quincenal"},{"id":"trainings","text":"Capacitaciones mensuales sobre prácticas terapéuticas descolonizadoras y abolicionistas"},{"id":"community","text":"Reuniones mensuales de personal para construir comunidad y apoyo"},{"id":"networking","text":"Oportunidades exclusivas de networking y mentoría con BIPOC experimentados"}]', '{"commitment":"Esto es más que un fellowship—es un compromiso de tiempo completo con tu crecimiento y éxito como terapeuta.","duration":{"label":"Duración del Programa","value":"18 meses"},"deadline":{"label":"Fecha Límite de Aplicación","value":"Mediados de Marzo"}}', '{"title":"Cómo Aplicar","description":"Estaremos listos para compartir los detalles de cómo aplicar a este programa cuando se abran las aplicaciones.","contactEmail":"Para más información, contacta","email":"fellowship@wholeselfnm.com","applyLink":{"text":"¡APLICA AQUÍ!","url":"https://docs.google.com/forms/d/e/1FAIpQLSdmKaf9HfBSL-x__HpmLfaXKnznBKOJ3cwbLcxylifVvR_2bg/viewform?pli=1","enabled":false},"footnote":"*NEGROS, INDÍGENAS, PERSONAS DE COLOR"}')
ON DUPLICATE KEY UPDATE meta_last_updated=VALUES(meta_last_updated), meta_version=VALUES(meta_version), seo_title=VALUES(seo_title), seo_description=VALUES(seo_description), hero_title=VALUES(hero_title), hero_subtitle=VALUES(hero_subtitle), hero_description=VALUES(hero_description), hero_icon=VALUES(hero_icon), hero_announcement=VALUES(hero_announcement), mission_title=VALUES(mission_title), mission_content=VALUES(mission_content), benefits_json=VALUES(benefits_json), program_details_json=VALUES(program_details_json), how_to_apply_json=VALUES(how_to_apply_json), updated_at=NOW();
