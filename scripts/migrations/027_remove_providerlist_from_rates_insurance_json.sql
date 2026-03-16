-- Migración 027: Quitar providerList del JSON insurance_json en page_rates.
--
-- La lista de insurance providers vive en la tabla insurance_provider (migración 025).
-- La API ya no lee ni escribe providerList en insurance_json. Para evitar confusión
-- en código legacy o en el editor, eliminamos la clave providerList del JSON guardado.
--
-- Requiere MySQL 5.7+ o MariaDB 10.2.3+ (JSON_REMOVE). Ejecutar en la misma BD.

UPDATE page_rates
SET insurance_json = JSON_REMOVE(insurance_json, '$.providerList')
WHERE locale IN ('en', 'es')
  AND JSON_CONTAINS_PATH(insurance_json, 'one', '$.providerList') = 1;

-- Actualizar el comentario de la columna para que refleje el contenido actual
ALTER TABLE page_rates
MODIFY COLUMN insurance_json LONGTEXT NOT NULL
COMMENT 'JSON: insurance block (title, description, providers, modal). providerList está en tabla insurance_provider.';
