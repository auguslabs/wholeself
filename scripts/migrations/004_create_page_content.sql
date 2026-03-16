-- Migración 004: Tabla de contenido de páginas (API /api/content/*)
-- Misma base de datos que formularios (wholeself_forms). Necesaria para que
-- el sitio cargue home, crisis-resources, services, etc. desde la BD y no use fallback a JSON estático.
-- Después de ejecutar este script, cargar los datos con: extra/json-to-bd/page_content_data.sql

CREATE TABLE IF NOT EXISTS page_content (
  page_id    VARCHAR(64)  NOT NULL PRIMARY KEY,
  meta       JSON         NOT NULL COMMENT 'pageId, lastUpdated, version',
  seo        JSON         NOT NULL COMMENT 'title, description (string o {en,es})',
  content    JSON         NOT NULL COMMENT 'secciones y elementos por página',
  created_at DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Contenido de páginas del sitio (hero, CTAs, SEO, etc.)';
