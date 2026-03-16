-- Migración 026: Rellenar logo_url en insurance_provider con las rutas de los logos que ya existen en /uploads/insurance/.
-- Ejecutar después de 025_create_insurance_providers.sql.
-- Si un proveedor no tiene archivo de logo en el repo, se deja logo_url vacío (el front mostrará el nombre por defecto).

UPDATE insurance_provider SET logo_url = '/uploads/insurance/aetna.svg' WHERE name_en = 'Aetna';
UPDATE insurance_provider SET logo_url = '/uploads/insurance/ambetter.png' WHERE name_en = 'Ambetter';
UPDATE insurance_provider SET logo_url = '/uploads/insurance/blue-cross-blue-shield.svg' WHERE name_en = 'Blue Cross Blue Shield';
UPDATE insurance_provider SET logo_url = '/uploads/insurance/cigna-evernorth.svg' WHERE name_en = 'Cigna and Evernorth';
UPDATE insurance_provider SET logo_url = '/uploads/insurance/magellan.png' WHERE name_en = 'Magellan';
UPDATE insurance_provider SET logo_url = '/uploads/insurance/medicare.png' WHERE name_en = 'Medicare';
UPDATE insurance_provider SET logo_url = '/uploads/insurance/mines-associates.png' WHERE name_en = 'Mines and Associates';
-- New Mexico Medicaid: no hay archivo en uploads/insurance, se deja logo_url vacío
UPDATE insurance_provider SET logo_url = '/uploads/insurance/new-mexico-medical-insurance-pool.png' WHERE name_en = 'New Mexico Medical Insurance Pool';
UPDATE insurance_provider SET logo_url = '/uploads/insurance/optum.png' WHERE name_en = 'Optum';
UPDATE insurance_provider SET logo_url = '/uploads/insurance/presbyterian.svg' WHERE name_en = 'Presbyterian';
UPDATE insurance_provider SET logo_url = '/uploads/insurance/tricare.svg' WHERE name_en = 'Tricare';
UPDATE insurance_provider SET logo_url = '/uploads/insurance/united-healthcare.png' WHERE name_en = 'United Healthcare';
