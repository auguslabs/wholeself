-- Migración 019: Normalizar rutas de imágenes hero (Home, Rates, Services).
-- Todas usan la misma ruta: /uploads/hero/<página>.webp
--
-- Requisito: tener en public/uploads/hero/ los archivos home.webp, rates.webp, services.webp
-- (copiados desde public/banner-hero-section.webp, public/banner-rates.webp, public/banner-services.webp).
--
-- Ejecutar en la misma BD que usa public/api/content.php.

-- Home (tabla page_home, 2 filas en/es)
UPDATE page_home SET hero_background_image = '/uploads/hero/home.webp' WHERE locale IN ('en', 'es');

-- Rates (tabla page_rates, 2 filas en/es)
UPDATE page_rates SET hero_background_image = '/uploads/hero/rates.webp' WHERE locale IN ('en', 'es');

-- Services (tabla page_services, 2 filas en/es) — ya puede estar en /uploads/hero/services.webp; se deja igual por consistencia
UPDATE page_services SET hero_background_image = '/uploads/hero/services.webp' WHERE locale IN ('en', 'es');
