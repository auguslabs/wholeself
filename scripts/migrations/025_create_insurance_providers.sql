-- Migración 025: Tabla dedicada para Insurance Providers (proveedores de seguro).
--
-- Objetivo: tener los proveedores de seguro en una tabla aparte para simplificar
-- inserción, edición y lectura (sin depender del JSON dentro de page_rates.insurance_json).
--
-- Cada fila = un proveedor. Si logo_url está vacío, el front muestra el nombre por defecto.
-- name_en y name_es permiten etiquetas distintas por idioma si en el futuro se traducen.
--
-- La API (content.php GET pageId=rates) y el build (contentDbService) leerán esta tabla
-- y armarán content.insurance.providerList desde aquí. El resto del bloque insurance
-- (title, description, providers[], modal) sigue en page_rates.insurance_json.
--
-- Ejecutar en la misma BD que public/api/content.php (phpMyAdmin o CLI).

CREATE TABLE IF NOT EXISTS insurance_provider (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name_en VARCHAR(255) NOT NULL COMMENT 'Nombre del proveedor (inglés)',
  name_es VARCHAR(255) NOT NULL COMMENT 'Nombre del proveedor (español); puede ser igual a name_en',
  logo_url VARCHAR(500) DEFAULT '' COMMENT 'URL del logo (relativa o absoluta). Vacío = mostrar solo el nombre',
  display_order INT NOT NULL DEFAULT 0 COMMENT 'Orden de aparición (menor = primero)',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uk_name_en (name_en)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Índice para ordenar por display_order y luego por nombre
CREATE INDEX idx_insurance_provider_display_order ON insurance_provider (display_order ASC, name_en ASC);

-- Seed: proveedores que estaban en page_rates.insurance_json (misma lista en/en).
-- logo_url vacío = el front usará el nombre o el path por defecto /uploads/insurance/<slug>.(svg|png)
INSERT INTO insurance_provider (name_en, name_es, logo_url, display_order) VALUES
('Aetna', 'Aetna', '', 1),
('Ambetter', 'Ambetter', '', 2),
('Blue Cross Blue Shield', 'Blue Cross Blue Shield', '', 3),
('Cigna and Evernorth', 'Cigna and Evernorth', '', 4),
('Magellan', 'Magellan', '', 5),
('Medicare', 'Medicare', '', 6),
('Mines and Associates', 'Mines and Associates', '', 7),
('New Mexico Medicaid', 'New Mexico Medicaid', '', 8),
('New Mexico Medical Insurance Pool', 'New Mexico Medical Insurance Pool', '', 9),
('Optum', 'Optum', '', 10),
('Presbyterian', 'Presbyterian', '', 11),
('Tricare', 'Tricare', '', 12),
('United Healthcare', 'United Healthcare', '', 13)
ON DUPLICATE KEY UPDATE name_es = VALUES(name_es), logo_url = VALUES(logo_url), display_order = VALUES(display_order), updated_at = NOW();

-- Ejemplos después de crear la tabla:
-- Añadir proveedor: INSERT INTO insurance_provider (name_en, name_es, logo_url, display_order) VALUES ('Nuevo Seguro', 'Nuevo Seguro', '', 14);
-- Poner logo:       UPDATE insurance_provider SET logo_url = '/uploads/insurance/mi-logo.png' WHERE name_en = 'Aetna';
-- Cambiar orden:   UPDATE insurance_provider SET display_order = 5 WHERE id = 3;
-- Eliminar:        DELETE FROM insurance_provider WHERE id = 99;
