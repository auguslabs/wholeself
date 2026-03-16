-- Actualizar headline de la página home: "whole self" → "Whole Self"
-- Ejecutar en la misma BD que usa public/api/content.php (tabla page_content).
-- Solo modifica content.hero.headline para page_id = 'home'.

UPDATE page_content
SET content = JSON_SET(content, '$.hero.headline', 'Healing that centers your Whole Self')
WHERE page_id = 'home';
