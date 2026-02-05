-- Migración 001: Tablas para los 4 formularios de contacto
-- Base de datos: wholeself_forms (crear en cPanel antes de ejecutar)
-- Ejecutar en orden. Compatible con MySQL 5.7+ / MariaDB.

-- ---------------------------------------------------------------------------
-- 1. Contacto general (contact.astro → ContactForm.tsx)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS form_contact (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  comment TEXT NOT NULL,
  language CHAR(2) DEFAULT NULL COMMENT 'en, es',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- 2. Referral (contact/referral.astro)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS form_referral (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name_credentials VARCHAR(255) NOT NULL,
  organization VARCHAR(255) DEFAULT NULL,
  phone VARCHAR(50) DEFAULT NULL,
  email VARCHAR(255) DEFAULT NULL,
  client_name VARCHAR(255) DEFAULT NULL,
  client_dob DATE DEFAULT NULL,
  client_contact VARCHAR(255) DEFAULT NULL,
  referral_reason TEXT NOT NULL,
  preferred_therapist TEXT DEFAULT NULL,
  insurance VARCHAR(255) DEFAULT NULL,
  additional_notes TEXT DEFAULT NULL,
  language CHAR(2) DEFAULT NULL COMMENT 'en, es',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- 3. I need help (contact/i-need-help.astro)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS form_i_need_help (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  contact_method VARCHAR(50) DEFAULT NULL COMMENT 'phone, email, text',
  phone VARCHAR(50) DEFAULT NULL,
  email VARCHAR(255) DEFAULT NULL,
  best_time VARCHAR(50) DEFAULT NULL COMMENT 'morning, afternoon, evening, flexible',
  message TEXT DEFAULT NULL,
  insurance VARCHAR(255) DEFAULT NULL,
  preferred_therapist VARCHAR(255) DEFAULT NULL,
  hear_about VARCHAR(50) DEFAULT NULL COMMENT 'search, referral, provider, social-media, other',
  language CHAR(2) DEFAULT NULL COMMENT 'en, es',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- 4. Loved one needs help (contact/loved-one-needs-help.astro)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS form_loved_one (
  id INT AUTO_INCREMENT PRIMARY KEY,
  your_name VARCHAR(255) NOT NULL,
  relationship VARCHAR(50) DEFAULT NULL COMMENT 'spouse, parent, child, sibling, friend, other',
  phone VARCHAR(50) DEFAULT NULL,
  email VARCHAR(255) DEFAULT NULL,
  contact_method VARCHAR(50) DEFAULT NULL COMMENT 'phone, email, text',
  situation TEXT DEFAULT NULL,
  questions TEXT DEFAULT NULL,
  how_help TEXT DEFAULT NULL,
  language CHAR(2) DEFAULT NULL COMMENT 'en, es',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
