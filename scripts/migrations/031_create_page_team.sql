-- Migración 031: Crear tabla page_team (meta/seo) para eliminar dependencia de page_content en Team.
-- Ejecutar en la misma BD que usa public/api/content.php (wholeself_forms).

CREATE TABLE IF NOT EXISTS page_team (
  id              INT(11)      NOT NULL AUTO_INCREMENT PRIMARY KEY,
  locale          CHAR(2)      NOT NULL COMMENT 'en, es',
  meta_last_updated VARCHAR(64) DEFAULT NULL COMMENT 'ISO 8601 string (date(c) en PHP)',
  meta_version    INT(11)      NOT NULL DEFAULT 1,
  seo_title       VARCHAR(255) NOT NULL DEFAULT '',
  seo_description TEXT         NOT NULL,
  updated_at      DATETIME     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uniq_locale (locale)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Página Team: meta/seo (miembros viven en team_members)';

-- Insertar filas base (necesarias para UPDATE en la API).
INSERT INTO page_team (locale, meta_last_updated, meta_version, seo_title, seo_description)
VALUES
  ('en', NULL, 1, 'Humanizing the service from the very first contact', 'Meet our compassionate team dedicated to your well-being'),
  ('es', NULL, 1, 'Humanizando el servicio desde el primer contacto', 'Conoce a nuestro equipo compasivo dedicado a tu bienestar')
ON DUPLICATE KEY UPDATE
  seo_title = VALUES(seo_title),
  seo_description = VALUES(seo_description);

