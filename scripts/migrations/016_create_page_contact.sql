-- Migración 016: Tabla plana para la página Contact (pageId=contact).
-- Solo campos editables: dirección (street, city, state, zip), teléfono, email,
-- horario de oficina (title, hours, note), Facebook e Instagram. No se editan formularios.
-- 2 filas: locale 'en' y 'es'. API content.php GET/PUT pageId=contact.
--
-- El front (ContactInfo) espera content.contactInfo.address (street, city, state, zip),
-- contactInfo.phone, contactInfo.email, contactInfo.officeHours (title, hours, note),
-- contactInfo.socialMedia (facebook, instagram). content.form se sigue sirviendo desde page_content.
--
-- meta.lastUpdated en ISO 8601. Ejecutar en la misma BD que public/api/content.php.

CREATE TABLE IF NOT EXISTS page_contact (
  id INT AUTO_INCREMENT PRIMARY KEY,
  locale VARCHAR(5) NOT NULL UNIQUE COMMENT 'en or es',
  meta_last_updated VARCHAR(32),
  meta_version INT DEFAULT 1,
  seo_title VARCHAR(255) DEFAULT '',
  seo_description TEXT,
  hero_title VARCHAR(255) NOT NULL DEFAULT 'Contact Us',
  address_street VARCHAR(500) DEFAULT '',
  address_city VARCHAR(255) DEFAULT '',
  address_state VARCHAR(50) DEFAULT '',
  address_zip VARCHAR(20) DEFAULT '',
  phone VARCHAR(50) DEFAULT '',
  email VARCHAR(255) DEFAULT '',
  office_hours_title VARCHAR(255) DEFAULT '',
  office_hours_hours VARCHAR(255) DEFAULT '',
  office_hours_note TEXT,
  facebook_url VARCHAR(500) DEFAULT '',
  instagram_url VARCHAR(500) DEFAULT '',
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- INSERT con datos reales desde export page_content (solo campos editables). Generado con extract-contact-json.js.
INSERT INTO page_contact (locale, meta_last_updated, meta_version, seo_title, seo_description, hero_title, address_street, address_city, address_state, address_zip, phone, email, office_hours_title, office_hours_hours, office_hours_note, facebook_url, instagram_url) VALUES
('en', '2024-01-15T10:00:00Z', 1, 'Contact - WholeSelf Counseling', 'Get in touch with us', 'Contact Us', '7520 Montgomery Blvd. NE, Bldg. E15', 'Albuquerque', 'NM', '87109', '505.226.6380', 'admin@wholeselfnm.com', 'Office Hours', 'Monday - Friday: 8:00 AM - 5:00 PM', 'Please note: Office hours are not the same as clinician hours. Our office hours are Monday - Friday, 8:00 AM - 5:00 PM.', 'https://www.facebook.com/wholeselfnm', 'https://www.instagram.com/wholeselfnm/'),
('es', '2024-01-15T10:00:00Z', 1, 'Contacto - WholeSelf Counseling', 'Ponte en contacto con nosotros', 'Contáctanos', '7520 Montgomery Blvd. NE, Bldg. E15', 'Albuquerque', 'NM', '87109', '505.226.6380', 'admin@wholeselfnm.com', 'Horario de Oficina', 'Lunes - Viernes: 8:00 AM - 5:00 PM', 'Nota: Las horas de oficina no son las mismas que las horas de los clínicos. Nuestro horario de oficina es Lunes - Viernes, 8:00 AM - 5:00 PM.', 'https://www.facebook.com/wholeselfnm', 'https://www.instagram.com/wholeselfnm/')
ON DUPLICATE KEY UPDATE meta_last_updated=VALUES(meta_last_updated), meta_version=VALUES(meta_version), seo_title=VALUES(seo_title), seo_description=VALUES(seo_description), hero_title=VALUES(hero_title), address_street=VALUES(address_street), address_city=VALUES(address_city), address_state=VALUES(address_state), address_zip=VALUES(address_zip), phone=VALUES(phone), email=VALUES(email), office_hours_title=VALUES(office_hours_title), office_hours_hours=VALUES(office_hours_hours), office_hours_note=VALUES(office_hours_note), facebook_url=VALUES(facebook_url), instagram_url=VALUES(instagram_url), updated_at=NOW();
