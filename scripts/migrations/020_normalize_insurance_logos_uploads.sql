-- Migración 020: Logos de aseguradoras (Rates) con ruta unificada /uploads/insurance/
-- Actualiza providerList en insurance_json (page_rates) para que cada ítem tenga
-- { "name": "<nombre>", "logoUrl": "/uploads/insurance/<archivo>" }.
-- Los archivos están en public/uploads/insurance/ (copiados desde public/logos/insurance/).
--
-- Ejecutar en la misma BD que usa public/api/content.php.

-- Ambas filas (en y es) usan la misma lista de nombres; logoUrl apunta a /uploads/insurance/
UPDATE page_rates
SET insurance_json = JSON_SET(
  insurance_json,
  '$.providerList',
  JSON_ARRAY(
    JSON_OBJECT('name', 'Aetna', 'logoUrl', '/uploads/insurance/aetna.svg'),
    JSON_OBJECT('name', 'Ambetter', 'logoUrl', '/uploads/insurance/ambetter.png'),
    JSON_OBJECT('name', 'Blue Cross Blue Shield', 'logoUrl', '/uploads/insurance/blue-cross-blue-shield.svg'),
    JSON_OBJECT('name', 'Cigna and Evernorth', 'logoUrl', '/uploads/insurance/cigna-evernorth.svg'),
    JSON_OBJECT('name', 'Magellan', 'logoUrl', '/uploads/insurance/magellan.png'),
    JSON_OBJECT('name', 'Medicare', 'logoUrl', '/uploads/insurance/medicare.png'),
    JSON_OBJECT('name', 'Mines and Associates', 'logoUrl', '/uploads/insurance/mines-associates.png'),
    JSON_OBJECT('name', 'New Mexico Medicaid', 'logoUrl', ''),
    JSON_OBJECT('name', 'New Mexico Medical Insurance Pool', 'logoUrl', '/uploads/insurance/new-mexico-medical-insurance-pool.png'),
    JSON_OBJECT('name', 'Optum', 'logoUrl', '/uploads/insurance/optum.png'),
    JSON_OBJECT('name', 'Presbyterian', 'logoUrl', '/uploads/insurance/presbyterian.svg'),
    JSON_OBJECT('name', 'Tricare', 'logoUrl', '/uploads/insurance/tricare.svg'),
    JSON_OBJECT('name', 'United Healthcare', 'logoUrl', '/uploads/insurance/united-healthcare.png')
  )
)
WHERE locale IN ('en', 'es');
