-- Migración 008: Tabla plana para el footer compartido (shared-footer).
-- Esquema y datos alineados con augushub:
--   augushub/extra/nueva-estructura-bd/scripts/create-page_shared_footer.sql
-- 2 filas: locale 'en' y 'es'. API content.php GET/PUT pageId=shared-footer.
--
-- Navigation: nav_title, nav_link1_label, nav_link1_link ... nav_link6_*.
-- Resources: resources_title, link1_label, link1_link, link1_is_modal ... link6_*.

CREATE TABLE IF NOT EXISTS page_shared_footer (
  id INT AUTO_INCREMENT PRIMARY KEY,
  locale VARCHAR(5) NOT NULL UNIQUE COMMENT 'en or es',
  meta_last_updated VARCHAR(32),
  meta_version INT DEFAULT 1,
  seo_title VARCHAR(255),
  seo_description TEXT,
  company_name VARCHAR(255),
  company_tagline VARCHAR(255),
  copyright VARCHAR(255),
  nav_title VARCHAR(64),
  nav_link1_label VARCHAR(255),
  nav_link1_link VARCHAR(512),
  nav_link2_label VARCHAR(255),
  nav_link2_link VARCHAR(512),
  nav_link3_label VARCHAR(255),
  nav_link3_link VARCHAR(512),
  nav_link4_label VARCHAR(255),
  nav_link4_link VARCHAR(512),
  nav_link5_label VARCHAR(255),
  nav_link5_link VARCHAR(512),
  nav_link6_label VARCHAR(255),
  nav_link6_link VARCHAR(512),
  resources_title VARCHAR(64),
  link1_label VARCHAR(255),
  link1_link VARCHAR(512),
  link1_is_modal TINYINT(1) DEFAULT 0,
  link2_label VARCHAR(255),
  link2_link VARCHAR(512),
  link2_is_modal TINYINT(1) DEFAULT 0,
  link3_label VARCHAR(255),
  link3_link VARCHAR(512),
  link3_is_modal TINYINT(1) DEFAULT 0,
  link4_label VARCHAR(255),
  link4_link VARCHAR(512),
  link4_is_modal TINYINT(1) DEFAULT 0,
  link5_label VARCHAR(255),
  link5_link VARCHAR(512),
  link5_is_modal TINYINT(1) DEFAULT 0,
  link6_label VARCHAR(255),
  link6_link VARCHAR(512),
  link6_is_modal TINYINT(1) DEFAULT 0,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Datos iniciales (coinciden con augushub/.../create-page_shared_footer.sql)
INSERT INTO page_shared_footer (
  locale, meta_last_updated, meta_version, seo_title, seo_description,
  company_name, company_tagline, copyright, nav_title,
  nav_link1_label, nav_link1_link, nav_link2_label, nav_link2_link, nav_link3_label, nav_link3_link, nav_link4_label, nav_link4_link, nav_link5_label, nav_link5_link, nav_link6_label, nav_link6_link,
  resources_title,
  link1_label, link1_link, link1_is_modal, link2_label, link2_link, link2_is_modal, link3_label, link3_link, link3_is_modal, link4_label, link4_link, link4_is_modal, link5_label, link5_link, link5_is_modal, link6_label, link6_link, link6_is_modal
) VALUES
('en', '2024-01-15T10:00:00Z', 1, '', '', 'Whole Self Counseling', 'A safe space for your healing journey', 'All rights reserved', 'Navigation', 'Home', '/', 'Services', '/services', 'What to Expect', '/what-to-expect', 'Rates', '/rates', 'Team', '/team', 'Contact', '/contact', 'Resources', 'Crisis Resources', '#crisis-resources', 1, 'Client Portal', 'https://alvordbaker.sessionshealth.com/clients/sign_in', 0, 'Immigration Evaluations', '/services/immigration-evaluations', 0, 'Fellowship Program', '/fellowship', 0, '', '', 0, '', '', 0),
('es', '2024-01-15T10:00:00Z', 1, '', '', 'Whole Self Counseling', 'Un espacio seguro para tu viaje de sanación', 'Todos los derechos reservados', 'Navegación', 'Inicio', '/', 'Servicios', '/services', 'Qué esperar', '/what-to-expect', 'Tarifas', '/rates', 'Equipo', '/team', 'Contacto', '/contact', 'Recursos', 'Recursos de Crisis', '#crisis-resources', 1, 'Portal del Cliente', 'https://alvordbaker.sessionshealth.com/clients/sign_in', 0, 'Evaluaciones de Inmigración', '/services/immigration-evaluations', 0, 'Programa de Fellowship', '/fellowship', 0, '', '', 0, '', '', 0)
ON DUPLICATE KEY UPDATE updated_at = NOW();
