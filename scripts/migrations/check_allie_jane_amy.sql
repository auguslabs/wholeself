-- Verificar si Allie, Jane y Amy están en team_members.
-- Ejecutar en la misma BD que usa la API (ej. cPanel → phpMyAdmin → SQL).

SELECT
  photo_filename,
  first_name,
  last_name,
  role,
  display_order
FROM team_members
WHERE photo_filename IN (
  'Alexandria-Rakes',  -- Allie
  'Amy-Melendrez',     -- Amy
  'Jane-Brooks'        -- Jane
)
ORDER BY display_order;

-- Si no devuelve filas, no están en la BD (coherente con 002_remove_team_members_amy_allie_jane.sql).
