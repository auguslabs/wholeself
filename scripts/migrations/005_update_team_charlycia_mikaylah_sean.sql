-- Actualizar rol y credenciales de Charlycia, Mikaylah y Sean
-- Ejecutar en la misma BD que usa public/api/team-members.php (tabla team_members).

-- Charlycia: nuevo rol y credenciales
UPDATE team_members
SET
  role = 'Manager Strategic Initiatives, CPSW',
  credentials = 'BSW, CSPW, CCSS'
WHERE first_name = 'Charlycia';

-- Mikaylah: nuevo rol y credenciales
UPDATE team_members
SET
  role = 'Mental Health Therapist',
  credentials = 'MSW'
WHERE first_name = 'Mikaylah';

-- Sean: nuevas credenciales (rol sin cambio)
UPDATE team_members
SET credentials = 'MSW'
WHERE first_name = 'Sean';
