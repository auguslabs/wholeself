/**
 * Generate a minimal SQL sync file from a phpMyAdmin dump.
 * هدف: sincronizar tablas de contenido (no formularios) desde Banahost -> Bluehost.
 *
 * Usage:
 *   node scripts/generate-content-sync-sql.mjs "<input_dump.sql>" "<output_sync.sql>"
 *
 * It will extract INSERT INTO blocks for:
 *   page_home, page_fellowship, page_what_to_expect, page_contact
 *
 * It omits volatile columns when present:
 *   id, updated_at
 *
 * Uses INSERT ... ON DUPLICATE KEY UPDATE to upsert per locale.
 */
import fs from 'node:fs';

const TABLES = ['page_home', 'page_fellowship', 'page_what_to_expect', 'page_contact'];
const DROP_COLS = new Set(['id', 'updated_at']);

const [, , inPath, outPath] = process.argv;
if (!inPath || !outPath) {
  console.error('Usage: node scripts/generate-content-sync-sql.mjs "<input_dump.sql>" "<output_sync.sql>"');
  process.exit(1);
}
if (!fs.existsSync(inPath)) {
  console.error('Input dump not found:', inPath);
  process.exit(1);
}

const sql = fs.readFileSync(inPath, 'utf8');

function splitTuples(valuesSql) {
  const out = [];
  let i = 0;
  let start = -1;
  let depth = 0;
  let inStr = false;
  while (i < valuesSql.length) {
    const ch = valuesSql[i];
    if (inStr) {
      if (ch === "'" && valuesSql[i - 1] !== '\\') {
        if (valuesSql[i + 1] === "'") { i += 2; continue; }
        inStr = false;
      }
      i++;
      continue;
    }
    if (ch === "'") { inStr = true; i++; continue; }
    if (ch === '(') { if (depth === 0) start = i; depth++; }
    else if (ch === ')') {
      depth--;
      if (depth === 0 && start !== -1) { out.push(valuesSql.slice(start, i + 1)); start = -1; }
    }
    i++;
  }
  return out;
}

function splitFields(tupleSql) {
  const s = tupleSql.trim().replace(/^\(/, '').replace(/\)$/, '');
  const out = [];
  let cur = '';
  let i = 0;
  let inStr = false;
  while (i < s.length) {
    const ch = s[i];
    if (inStr) {
      cur += ch;
      if (ch === "'" && s[i - 1] !== '\\') {
        if (s[i + 1] === "'") { cur += "'"; i += 2; continue; }
        inStr = false;
      }
      i++;
      continue;
    }
    if (ch === "'") { inStr = true; cur += ch; i++; continue; }
    if (ch === ',') { out.push(cur.trim()); cur = ''; i++; continue; }
    cur += ch;
    i++;
  }
  out.push(cur.trim());
  return out;
}

function extractInsertBlock(table) {
  const re = new RegExp(`INSERT INTO\\s+\`?${table}\`?\\s*\\(([^)]+)\\)\\s*VALUES\\s*([\\s\\S]*?);`, 'i');
  const m = sql.match(re);
  if (!m) return null;
  return { columnsRaw: m[1], valuesRaw: m[2] };
}

function buildUpsert(table, columnsRaw, valuesRaw) {
  const cols = columnsRaw.split(',').map((c) => c.trim().replace(/`/g, ''));
  const keep = cols
    .map((c, idx) => ({ c, idx }))
    .filter(({ c }) => !DROP_COLS.has(c))
    .map(({ idx }) => idx);
  const outCols = keep.map((i) => `\`${cols[i]}\``).join(', ');

  const tuples = splitTuples(valuesRaw);
  const outTuples = tuples.map((t) => {
    const fields = splitFields(t);
    const kept = keep.map((i) => fields[i] ?? 'NULL');
    return `(${kept.join(', ')})`;
  });

  const updateCols = keep
    .map((i) => cols[i])
    .filter((c) => c !== 'locale') // locale es la llave natural; no se actualiza
    .map((c) => `\`${c}\`=VALUES(\`${c}\`)`)
    .join(', ');

  return [
    `-- ${table}`,
    `INSERT INTO \`${table}\` (${outCols}) VALUES`,
    outTuples.join(',\n') + '\nON DUPLICATE KEY UPDATE ' + updateCols + ';',
    '',
  ].join('\n');
}

let out = '';
out += '-- Sync content tables from Banahost dump -> Bluehost\n';
out += '-- Tables: page_home, page_fellowship, page_what_to_expect, page_contact\n';
out += '-- Omits: id, updated_at\n\n';
out += "SET SQL_MODE = 'NO_AUTO_VALUE_ON_ZERO';\n";
out += 'START TRANSACTION;\n';
out += "SET time_zone = '+00:00';\n";
out += "/*!40101 SET NAMES utf8mb4 */;\n\n";

for (const t of TABLES) {
  const blk = extractInsertBlock(t);
  if (!blk) {
    console.error('Missing INSERT block for table:', t);
    process.exit(1);
  }
  out += buildUpsert(t, blk.columnsRaw, blk.valuesRaw);
}

out += 'COMMIT;\n';

fs.writeFileSync(outPath, out, 'utf8');
console.log('Wrote sync SQL to:', outPath);

