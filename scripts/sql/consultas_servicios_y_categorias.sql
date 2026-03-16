-- =============================================================================
-- Consultas para revisar datos de la página Services en page_content
-- Base de datos: wholeself_forms (o la que uses). Tabla: page_content
-- =============================================================================

-- 0) SOLO EL CAMPO CONTENT (lo que ves en la BD: hero, categories, etc.)
-- Una columna, el JSON tal cual está almacenado. Sin otros campos.
SELECT content
FROM page_content
WHERE page_id = 'services';


-- 1) SOLO LA SECCIÓN DE CATEGORÍAS (content.categories) — JSON completo formateado
-- Ver qué categorías y servicios tienes almacenados en la BD para la página services.
SELECT
  page_id,
  JSON_PRETTY(JSON_EXTRACT(content, '$.categories')) AS categories
FROM page_content
WHERE page_id = 'services';


-- 1b) SOLO EL JSON DE CATEGORÍAS (una columna; útil si en tu cliente se trunca)
SELECT JSON_PRETTY(JSON_EXTRACT(content, '$.categories')) AS datos_dentro_de_categories
FROM page_content
WHERE page_id = 'services';


-- 1c) DATOS DENTRO DE CATEGORÍAS — una fila por categoría (MySQL 8+)
-- Solo columnas que SÍ vienen del JSON: id, title, services. (No hay "cardinalidad" en tu BD.)
SELECT
  cat.id       AS category_id,
  cat.title    AS category_title,
  cat.services AS services_json
FROM page_content p,
JSON_TABLE(
  p.content,
  '$.categories[*]' COLUMNS (
    id      VARCHAR(64)  PATH '$.id',
    title   JSON         PATH '$.title',
    services JSON        PATH '$.services'
  )
) AS cat
WHERE p.page_id = 'services'
ORDER BY cat.id;


-- 1d) DETALLE DE CADA SERVICIO DENTRO DE CATEGORÍAS (MySQL 8+)
-- Una fila por tarjeta: categoría (ej. Evaluation & Consultation) + cada servicio (Consultation, Psychiatric Diagnostic Evaluation, Treatment Plan Development...) con name, description, icon.
SELECT
  j.category_id,
  j.category_title,
  j.service_id,
  j.service_name,
  j.service_description,
  j.service_icon
FROM page_content p,
JSON_TABLE(
  p.content,
  '$.categories[*]' COLUMNS (
    category_id   VARCHAR(64)  PATH '$.id',
    category_title JSON        PATH '$.title',
    NESTED PATH '$.services[*]' COLUMNS (
      service_id          VARCHAR(64)  PATH '$.id',
      service_name        JSON         PATH '$.name',
      service_description JSON         PATH '$.description',
      service_icon        VARCHAR(128) PATH '$.icon'
    )
  )
) AS j
WHERE p.page_id = 'services'
ORDER BY j.category_id, j.service_id;


-- 1e) MISMO DETALLE PERO EN COLUMNAS DE TEXTO (ver todo sin truncar)
-- Título, nombre y descripción en columnas en/es para que la interfaz no corte el JSON.
-- Para ver TODO en consola/phpMyAdmin: Export → CSV o haz clic en una celda para ver el valor completo.
SELECT
  j.category_id,
  COALESCE(JSON_UNQUOTE(JSON_EXTRACT(j.category_title, '$.en')), JSON_UNQUOTE(j.category_title)) AS category_title_en,
  COALESCE(JSON_UNQUOTE(JSON_EXTRACT(j.category_title, '$.es')), NULL)                         AS category_title_es,
  j.service_id,
  COALESCE(JSON_UNQUOTE(JSON_EXTRACT(j.service_name, '$.en')), JSON_UNQUOTE(j.service_name))   AS service_name_en,
  COALESCE(JSON_UNQUOTE(JSON_EXTRACT(j.service_name, '$.es')), NULL)                            AS service_name_es,
  COALESCE(JSON_UNQUOTE(JSON_EXTRACT(j.service_description, '$.en')), JSON_UNQUOTE(j.service_description)) AS description_en,
  COALESCE(JSON_UNQUOTE(JSON_EXTRACT(j.service_description, '$.es')), NULL)                    AS description_es,
  j.service_icon
FROM page_content p,
JSON_TABLE(
  p.content,
  '$.categories[*]' COLUMNS (
    category_id    VARCHAR(64)  PATH '$.id',
    category_title JSON         PATH '$.title',
    NESTED PATH '$.services[*]' COLUMNS (
      service_id          VARCHAR(64)  PATH '$.id',
      service_name        JSON         PATH '$.name',
      service_description JSON         PATH '$.description',
      service_icon        VARCHAR(128) PATH '$.icon'
    )
  )
) AS j
WHERE p.page_id = 'services'
ORDER BY j.category_id, j.service_id;


-- DIAGNÓSTICO: ver qué claves tiene la primera categoría.
-- En el export real de la BD, services guarda los ítems en "subcategories", no en "services".
SELECT
  page_id,
  JSON_EXTRACT(content, '$.categories') IS NOT NULL AS tiene_categories,
  JSON_LENGTH(JSON_EXTRACT(content, '$.categories')) AS num_categories,
  JSON_EXTRACT(content, '$.categories[0].services') IS NOT NULL AS tiene_services,
  JSON_LENGTH(JSON_EXTRACT(content, '$.categories[0].services')) AS num_services_primera,
  JSON_EXTRACT(content, '$.categories[0].items') IS NOT NULL AS tiene_items,
  JSON_LENGTH(JSON_EXTRACT(content, '$.categories[0].items')) AS num_items_primera,
  JSON_EXTRACT(content, '$.categories[0].subcategories') IS NOT NULL AS tiene_subcategories,
  JSON_LENGTH(JSON_EXTRACT(content, '$.categories[0].subcategories')) AS num_subcategories_primera
FROM page_content
WHERE page_id = 'services';

-- 1f) VALORES DE CONSULTA DE LOS ITEMS (una fila por ítem)
-- En la BD real el panel guarda los ítems en "subcategories". También se admite "services" o "items".
SELECT
  cat.categoria,
  s.srv_id   AS item_id,
  s.srv_icon AS item_icon,
  COALESCE(JSON_UNQUOTE(JSON_EXTRACT(s.srv_title, '$.en')), JSON_UNQUOTE(s.srv_title), JSON_UNQUOTE(JSON_EXTRACT(s.srv_name, '$.en')), JSON_UNQUOTE(s.srv_name)) AS item_title,
  COALESCE(JSON_UNQUOTE(JSON_EXTRACT(s.srv_description, '$.en')), JSON_UNQUOTE(s.srv_description)) AS item_description
FROM (
  SELECT
    c.cat_id,
    COALESCE(JSON_UNQUOTE(JSON_EXTRACT(c.cat_title, '$.en')), JSON_UNQUOTE(c.cat_title)) AS categoria,
    COALESCE(c.subcategories, c.services, c.items) AS arr
  FROM page_content p
  CROSS JOIN JSON_TABLE(
    p.content,
    '$.categories[*]' COLUMNS (
      cat_id         VARCHAR(64) PATH '$.id',
      cat_title      JSON        PATH '$.title',
      subcategories  JSON        PATH '$.subcategories',
      services       JSON        PATH '$.services',
      items          JSON        PATH '$.items'
    )
  ) AS c
  WHERE p.page_id = 'services'
) AS cat
CROSS JOIN JSON_TABLE(
  cat.arr,
  '$[*]' COLUMNS (
    srv_id          VARCHAR(64)  PATH '$.id',
    srv_name        JSON        PATH '$.name',
    srv_title       JSON        PATH '$.title',
    srv_description JSON       PATH '$.description',
    srv_icon        VARCHAR(128) PATH '$.icon'
  )
) AS s
WHERE cat.arr IS NOT NULL
ORDER BY cat.categoria, s.srv_id;


-- 1f_alt) Con CAST(content AS JSON) y subcategories/services/items.
SELECT
  cat.categoria,
  s.srv_id   AS item_id,
  s.srv_icon AS item_icon,
  COALESCE(JSON_UNQUOTE(JSON_EXTRACT(s.srv_title, '$.en')), JSON_UNQUOTE(s.srv_title), JSON_UNQUOTE(JSON_EXTRACT(s.srv_name, '$.en')), JSON_UNQUOTE(s.srv_name)) AS item_title,
  COALESCE(JSON_UNQUOTE(JSON_EXTRACT(s.srv_description, '$.en')), JSON_UNQUOTE(s.srv_description)) AS item_description
FROM (
  SELECT
    c.cat_id,
    COALESCE(JSON_UNQUOTE(JSON_EXTRACT(c.cat_title, '$.en')), JSON_UNQUOTE(c.cat_title)) AS categoria,
    COALESCE(c.subcategories, c.services, c.items) AS arr
  FROM page_content p
  CROSS JOIN JSON_TABLE(
    CAST(p.content AS JSON),
    '$.categories[*]' COLUMNS (
      cat_id         VARCHAR(64) PATH '$.id',
      cat_title      JSON        PATH '$.title',
      subcategories  JSON        PATH '$.subcategories',
      services       JSON        PATH '$.services',
      items          JSON        PATH '$.items'
    )
  ) AS c
  WHERE p.page_id = 'services'
) AS cat
CROSS JOIN JSON_TABLE(
  cat.arr,
  '$[*]' COLUMNS (
    srv_id          VARCHAR(64)  PATH '$.id',
    srv_name        JSON         PATH '$.name',
    srv_title       JSON         PATH '$.title',
    srv_description JSON        PATH '$.description',
    srv_icon        VARCHAR(128) PATH '$.icon'
  )
) AS s
WHERE cat.arr IS NOT NULL
ORDER BY cat.categoria, s.srv_id;


-- 2) TODOS LOS DATOS DE LA PÁGINA SERVICES
-- Ver meta, seo y content completo (hero, quickJump, intro, categories, conditionsSection, ctaSection, etc.)
SELECT
  page_id,
  meta,
  seo,
  content,
  created_at,
  updated_at
FROM page_content
WHERE page_id = 'services';


-- 3) CONTENIDO PRETTY (más legible en consola)
-- Si tu cliente MySQL muestra JSON en una sola línea, esta versión lo formatea.
SELECT
  page_id,
  JSON_PRETTY(meta)   AS meta,
  JSON_PRETTY(seo)    AS seo,
  JSON_PRETTY(content) AS content,
  created_at,
  updated_at
FROM page_content
WHERE page_id = 'services';


-- 4) COMPROBAR SI EXISTE LA PÁGINA SERVICES
SELECT page_id, updated_at
FROM page_content
WHERE page_id = 'services';


-- 5) LISTAR TODAS LAS PÁGINAS EN page_content (por si quieres ver qué page_id existen)
SELECT page_id, updated_at
FROM page_content
ORDER BY page_id;
