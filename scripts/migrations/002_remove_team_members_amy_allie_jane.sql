-- Eliminar del equipo: Amy (Amy-Melendrez), Allie (Alexandria-Rakes), Jane (Jane-Brooks)
-- Ejecutar en la misma BD que usa public/api/team-members.php (tabla team_members).
-- Ajusta el nombre de la base de datos si es distinto.

DELETE FROM team_members
WHERE photo_filename IN (
  'Alexandria-Rakes',  -- Allie
  'Amy-Melendrez',     -- Amy
  'Jane-Brooks'        -- Jane
);
