-- Migración 013: Rellenar meta_last_updated en page_crisis_resources para que la API
-- envíe un datetime válido (ISO 8601) y Zod no falle con "Invalid datetime".
-- Ejecutar en el mismo servidor/BD que usa public/api/content.php (phpMyAdmin o línea de comandos).

UPDATE page_crisis_resources
SET meta_last_updated = CONCAT(DATE_FORMAT(UTC_TIMESTAMP(), '%Y-%m-%dT%H:%i:%s'), 'Z')
WHERE locale IN ('en', 'es');
