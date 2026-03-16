-- Migración 011: Tabla plana para la página Crisis Resources (pageId=crisis-resources).
-- 2 filas: locale 'en' y 'es'. API content.php GET/PUT pageId=crisis-resources.
--
-- Campos fijos por fila: hero (título), botón flotante (ariaLabel, title), seo (title, description).
-- categories_json: JSON con el array de categorías (id, title {en,es}, subcategories con id, title, resources).
-- El front (CrisisResourcesContentFromApi, CrisisResourcesModal) espera content.hero.title, content.button.ariaLabel/title, content.categories[].
--
-- Dónde ejecutar: en el mismo servidor/BD que usa public/api/content.php (phpMyAdmin o línea de comandos).
-- El cliente puede usar este mismo archivo para crear la tabla en su entorno.

CREATE TABLE IF NOT EXISTS page_crisis_resources (
  id INT AUTO_INCREMENT PRIMARY KEY,
  locale VARCHAR(5) NOT NULL UNIQUE COMMENT 'en or es',
  meta_last_updated VARCHAR(32),
  meta_version INT DEFAULT 1,
  seo_title VARCHAR(255) DEFAULT '',
  seo_description TEXT,
  hero_title VARCHAR(255) NOT NULL DEFAULT 'Crisis Resources',
  button_aria_label VARCHAR(255) NOT NULL DEFAULT 'Open crisis resources',
  button_title VARCHAR(255) NOT NULL DEFAULT 'Crisis Resources',
  categories_json LONGTEXT NOT NULL COMMENT 'JSON array: [{ id, title: {en,es}, subcategories: [{ id, title, resources: [...] }] }]',
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Datos iniciales: estructura mínima (dos categorías con subcategorías vacías).
-- Para cargar el contenido completo actual (todas las categorías, subcategorías y recursos del módulo):
--   1. Exportar page_content desde phpMyAdmin (JSON).
--   2. Ejecutar: node scripts/migrations/extract-crisis-json.js "ruta/al/export.json"
--   3. Ejecutar en el servidor: scripts/migrations/012_seed_crisis_resources_from_export.sql
INSERT INTO page_crisis_resources (
  locale, meta_last_updated, meta_version, seo_title, seo_description,
  hero_title, button_aria_label, button_title, categories_json
) VALUES
(
  'en',
  NULL,
  1,
  'Crisis Resources',
  'Crisis and support resources.',
  'Crisis Resources',
  'Open crisis resources',
  'Crisis Resources',
  '[{"id":"general-community","title":{"en":"General & Community Support","es":"Apoyo general y comunitario"},"subcategories":[]},{"id":"specialized","title":{"en":"Specialized Support","es":"Apoyo especializado"},"subcategories":[]}]'
),
(
  'es',
  NULL,
  1,
  'Recursos de crisis',
  'Recursos de crisis y apoyo.',
  'Recursos de crisis',
  'Abrir recursos de crisis',
  'Recursos de crisis',
  '[{"id":"general-community","title":{"en":"General & Community Support","es":"Apoyo general y comunitario"},"subcategories":[]},{"id":"specialized","title":{"en":"Specialized Support","es":"Apoyo especializado"},"subcategories":[]}]'
)
ON DUPLICATE KEY UPDATE updated_at = NOW();
