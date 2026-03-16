-- Borrar Allie, Jane y Amy de team_members (si están en la BD).
-- Ejecutar en la misma BD que usa la API.
-- Si ya no están, no borra nada (0 filas afectadas).

DELETE FROM team_members
WHERE photo_filename IN (
  'Alexandria-Rakes',  -- Allie
  'Amy-Melendrez',     -- Amy
  'Jane-Brooks'        -- Jane
);
