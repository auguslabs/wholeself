-- Migración 032: Añadir form_json a page_contact para guardar content.form (introText, fields, submitButton).
-- Deja de depender de page_content para la página contact. API content.php GET/PATCH contact usan esta columna.
-- Ejecutar en la misma BD que public/api/content.php.

ALTER TABLE page_contact
  ADD COLUMN form_json LONGTEXT NULL COMMENT 'JSON: content.form (introText, fields, submitButton)' AFTER instagram_url;

-- Opcional: copiar form desde page_content si existe fila contact (solo si ya tienes datos en page_content).
-- UPDATE page_contact c
-- SET c.form_json = (SELECT JSON_EXTRACT(p.content, '$.form') FROM page_content p WHERE p.page_id = 'contact' LIMIT 1)
-- WHERE c.locale IN ('en', 'es')
--   AND (SELECT p.content FROM page_content p WHERE p.page_id = 'contact' LIMIT 1) IS NOT NULL;
UPDATE page_contact c
JOIN page_content p ON p.page_id = 'contact'
SET c.form_json = JSON_EXTRACT(p.content, '$.form')
WHERE c.locale IN ('en','es');