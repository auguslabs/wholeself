-- Migración 010: Asegurar que nav_title, resources_title y link4 (Fellowship) tengan valor en page_shared_footer.
-- Así el footer muestra "Navigation", "Resources" y "Fellowship Program" desde la BD (sin fallbacks en el front).

-- EN: títulos y Fellowship
UPDATE page_shared_footer
SET
  nav_title = COALESCE(NULLIF(TRIM(nav_title), ''), 'Navigation'),
  resources_title = COALESCE(NULLIF(TRIM(resources_title), ''), 'Resources'),
  link4_label = CASE WHEN NULLIF(TRIM(link4_label), '') IS NULL OR TRIM(link4_label) = '0' THEN 'Fellowship Program' ELSE link4_label END
WHERE locale = 'en';

-- ES: títulos y Fellowship
UPDATE page_shared_footer
SET
  nav_title = COALESCE(NULLIF(TRIM(nav_title), ''), 'Navegación'),
  resources_title = COALESCE(NULLIF(TRIM(resources_title), ''), 'Recursos'),
  link4_label = CASE WHEN NULLIF(TRIM(link4_label), '') IS NULL OR TRIM(link4_label) = '0' THEN 'Programa de Fellowship' ELSE link4_label END
WHERE locale = 'es';
