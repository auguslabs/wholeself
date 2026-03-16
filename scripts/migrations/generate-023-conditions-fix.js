/**
 * Genera 023_fix_page_services_conditions_section.sql a partir del INSERT de 018.
 * Extrae solo conditions_section_json para en y es.
 * Ejecutar: node scripts/migrations/generate-023-conditions-fix.js
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const dir = path.join(__dirname);
const content018 = fs.readFileSync(path.join(dir, '018_create_page_services.sql'), 'utf8');

// EN: conditions_section_json empieza después de "]', '" (fin de categories_json) y termina en "]}', '" antes de cta
const enStart = content018.indexOf("]', '{\"title\":\"Conditions We Support\"");
if (enStart === -1) {
  console.error('No se encontró inicio conditions_section_json EN');
  process.exit(1);
}
const enValueStart = content018.indexOf("'{\"title\":\"Conditions We Support\"", enStart) + 1; // después de la comilla
// Buscar el "}]}" que va seguido de "', '{\"title\":\"Ready" (fin del conditions_section_json EN)
let enEnd = enValueStart;
let pos = enValueStart;
while (true) {
  const idx = content018.indexOf('}]}', pos);
  if (idx === -1) break;
  const after = content018.substring(idx + 3, idx + 25);
  if (after.startsWith("', '{\"title\":\"Ready") || after.startsWith("'} , '{\"title\":\"Ready")) {
    enEnd = idx + 3;
    break;
  }
  pos = idx + 1;
}
const enJson = content018.substring(enValueStart, enEnd);

// ES: empieza con "Condiciones que Apoyamos" y termina antes de "¿Listo para comenzar?"
const esValueStart = content018.indexOf("'{\"title\":\"Condiciones que Apoyamos\"") + 1; // +1 para no incluir la comilla
if (esValueStart === -1) {
  console.error('No se encontró conditions_section_json ES');
  process.exit(1);
}
// Buscar el "}]}" que va seguido del CTA ES
let esEnd = esValueStart;
pos = esValueStart;
while (true) {
  const idx = content018.indexOf('}]}', pos);
  if (idx === -1) break;
  const after = content018.substring(idx + 3, idx + 30);
  if (after.startsWith("', '{\"title\":\"¿Listo") || after.startsWith("'} , '{\"title\":\"¿Listo")) {
    esEnd = idx + 3;
    break;
  }
  pos = idx + 1;
}
const esJson = content018.substring(esValueStart, esEnd);

// En 018 el JSON ya tiene '' para apostrofes; preservar y escapar solo ' sueltas
const escapeSql = (s) => s.replace(/''/g, '\u0002').replace(/'/g, "''").replace(/\u0002/g, "''");

const sql = `-- Migración 023: Rellena conditions_section_json en page_services si está vacío.
-- La API devuelve conditionsSection vacío cuando esta columna es NULL o ''.
-- Ejecutar en la misma BD que usa content.php (phpMyAdmin o CLI).
-- Generado con: node scripts/migrations/generate-023-conditions-fix.js

UPDATE page_services SET conditions_section_json = '${escapeSql(enJson)}' WHERE locale = 'en';
UPDATE page_services SET conditions_section_json = '${escapeSql(esJson)}' WHERE locale = 'es';
`;

fs.writeFileSync(path.join(dir, '023_fix_page_services_conditions_section.sql'), sql, 'utf8');
console.log('Generado: scripts/migrations/023_fix_page_services_conditions_section.sql');
console.log('EN JSON length:', enJson.length, 'ES JSON length:', esJson.length);
