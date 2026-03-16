-- ============================================================
-- Comprobar si page_services tiene categorías CON servicios
-- Ejecutar en la BD del servidor (la que usa content.php).
-- ============================================================

-- Ver qué hay en categories_json (primeros 500 caracteres) y si hay "services":[] vacíos
SELECT
  locale,
  LEFT(categories_json, 500) AS categories_preview,
  LENGTH(categories_json) AS total_chars,
  IF(categories_json LIKE '%"services":[]%', 'SÍ (vacío)', 'NO') AS tiene_services_vacio
FROM page_services
ORDER BY locale;

-- Si "tiene_services_vacio" = SÍ → la página solo muestra títulos, no las tarjetas.
-- Para llenar los datos, ejecutar en esta misma BD:
--   scripts/migrations/007_populate_page_services_categories_json.sql
