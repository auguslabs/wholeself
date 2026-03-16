-- Migración 028: Tabla plana para el header compartido (shared-header) con menú y navegación.
-- 2 filas: locale 'en' y 'es'. API content.php GET/PUT pageId=shared-header.
-- Incluye menu_label, menu_close_label y nav_link1..6 (igual que footer). Front usa content.menu y content.navigation.items.

CREATE TABLE IF NOT EXISTS page_shared_header (
  id INT AUTO_INCREMENT PRIMARY KEY,
  locale VARCHAR(5) NOT NULL UNIQUE COMMENT 'en or es',
  meta_last_updated VARCHAR(32),
  meta_version INT DEFAULT 1,
  seo_title VARCHAR(255) DEFAULT '',
  seo_description TEXT,
  menu_label VARCHAR(128) NOT NULL DEFAULT 'menu' COMMENT 'Texto del botón menú (ej. menu / menú)',
  menu_close_label VARCHAR(128) NOT NULL DEFAULT '✕' COMMENT 'Texto del botón cerrar (ej. ✕)',
  nav_link1_label VARCHAR(255) DEFAULT '',
  nav_link1_link VARCHAR(512) DEFAULT '',
  nav_link2_label VARCHAR(255) DEFAULT '',
  nav_link2_link VARCHAR(512) DEFAULT '',
  nav_link3_label VARCHAR(255) DEFAULT '',
  nav_link3_link VARCHAR(512) DEFAULT '',
  nav_link4_label VARCHAR(255) DEFAULT '',
  nav_link4_link VARCHAR(512) DEFAULT '',
  nav_link5_label VARCHAR(255) DEFAULT '',
  nav_link5_link VARCHAR(512) DEFAULT '',
  nav_link6_label VARCHAR(255) DEFAULT '',
  nav_link6_link VARCHAR(512) DEFAULT '',
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO page_shared_header (
  locale, meta_last_updated, meta_version, seo_title, seo_description,
  menu_label, menu_close_label,
  nav_link1_label, nav_link1_link, nav_link2_label, nav_link2_link,
  nav_link3_label, nav_link3_link, nav_link4_label, nav_link4_link,
  nav_link5_label, nav_link5_link, nav_link6_label, nav_link6_link
) VALUES
('en', NOW(), 1, 'WholeSelf Counseling', '', 'menu', '✕',
 'home', '/', 'services', '/services', 'what to expect', '/what-to-expect',
 'rates', '/rates', 'team', '/team', 'contact', '/contact'),
('es', NOW(), 1, 'WholeSelf Counseling', '', 'menú', '✕',
 'inicio', '/', 'servicios', '/services', 'que esperar', '/what-to-expect',
 'tarifas', '/rates', 'equipo', '/team', 'contacto', '/contact')
ON DUPLICATE KEY UPDATE
  menu_label = VALUES(menu_label), menu_close_label = VALUES(menu_close_label),
  nav_link1_label = VALUES(nav_link1_label), nav_link1_link = VALUES(nav_link1_link),
  nav_link2_label = VALUES(nav_link2_label), nav_link2_link = VALUES(nav_link2_link),
  nav_link3_label = VALUES(nav_link3_label), nav_link3_link = VALUES(nav_link3_link),
  nav_link4_label = VALUES(nav_link4_label), nav_link4_link = VALUES(nav_link4_link),
  nav_link5_label = VALUES(nav_link5_label), nav_link5_link = VALUES(nav_link5_link),
  nav_link6_label = VALUES(nav_link6_label), nav_link6_link = VALUES(nav_link6_link),
  updated_at = NOW();
