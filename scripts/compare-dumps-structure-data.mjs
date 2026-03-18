/**
 * Compare two SQL dumps for structure and data (by table), omitting selected tables.
 *
 * Usage (PowerShell):
 *   node scripts/compare-dumps-structure-data.mjs "C:\path\a.sql" "C:\path\b.sql"
 *
 * Exit code:
 *   0 -> data equivalent for all compared tables
 *   2 -> differences found
 *   1 -> error
 */
import fs from 'node:fs';

const OMIT = new Set([
  'form_contact',
  'form_i_need_help',
  'form_loved_one',
  'form_referral',
  'page_content',
  'page_content__legacy',
  'team_members',
]);

const [, , aPath, bPath] = process.argv;
if (!aPath || !bPath) {
  console.error('Usage: node scripts/compare-dumps-structure-data.mjs "<a.sql>" "<b.sql>"');
  process.exit(1);
}
if (!fs.existsSync(aPath) || !fs.existsSync(bPath)) {
  console.error('File not found:', !fs.existsSync(aPath) ? aPath : bPath);
  process.exit(1);
}

const aSql = fs.readFileSync(aPath, 'utf8');
const bSql = fs.readFileSync(bPath, 'utf8');

function extract(sql) {
  /** @type {Record<string, {create?: string, insertCols?: string, insertVals?: string}>} */
  const out = {};
  const createRe = /CREATE TABLE `(\w+)`\s*\(([\s\S]*?)\)\s*ENGINE=/gi;
  const insertRe = /INSERT INTO `(\w+)`\s*\(([^)]+)\)\s*VALUES\s*([\s\S]*?);/gi;
  let m;
  while ((m = createRe.exec(sql)) !== null) {
    const t = m[1];
    if (OMIT.has(t)) continue;
    out[t] ||= {};
    out[t].create = m[2].trim();
  }
  while ((m = insertRe.exec(sql)) !== null) {
    const t = m[1];
    if (OMIT.has(t)) continue;
    out[t] ||= {};
    out[t].insertCols = m[2].trim().replace(/\s+/g, ' ');
    out[t].insertVals = m[3].trim();
  }
  return out;
}

function normCreate(s = '') {
  return s
    .replace(/\s*COLLATE\s+[\w_]+\s*/gi, ' ')
    .replace(/\s*CHARACTER SET\s+[\w]+\s*/gi, ' ')
    .replace(/\bDEFAULT\s+CURRENT_TIMESTAMP\b/gi, 'DEFAULT current_ts')
    .replace(/\bON UPDATE\s+CURRENT_TIMESTAMP\b/gi, 'ON UPDATE current_ts')
    .replace(/\bCURRENT_TIMESTAMP\b/gi, 'current_ts')
    .replace(/\bcurrent_timestamp\s*\(\s*\)/gi, 'current_ts')
    .replace(/\bcurrent_ts\s*\(\s*\)/g, 'current_ts')
    .replace(/\bDEFAULT\s+'0'\b/gi, 'DEFAULT 0')
    .replace(/\bDEFAULT\s+'1'\b/gi, 'DEFAULT 1')
    .replace(/\s+/g, ' ')
    .replace(/\s*,\s*/g, ',')
    .trim();
}

function normValues(s = '') {
  return s.replace(/\s+/g, ' ').replace(/\s*,\s*/g, ',').trim();
}

const IGNORE_COLS = new Set(['id', 'created_at', 'updated_at', 'meta_last_updated', 'meta_version']);

function splitTuples(valuesSql) {
  // Splits "(a,b),(c,d)" into ["(a,b)","(c,d)"] without parsing SQL fully.
  const out = [];
  let i = 0;
  let start = -1;
  let depth = 0;
  let inStr = false;
  while (i < valuesSql.length) {
    const ch = valuesSql[i];
    if (inStr) {
      if (ch === "'" && valuesSql[i - 1] !== '\\') {
        // handle doubled '' inside strings
        if (valuesSql[i + 1] === "'") {
          i += 2;
          continue;
        }
        inStr = false;
      }
      i++;
      continue;
    }
    if (ch === "'") {
      inStr = true;
      i++;
      continue;
    }
    if (ch === '(') {
      if (depth === 0) start = i;
      depth++;
    } else if (ch === ')') {
      depth--;
      if (depth === 0 && start !== -1) {
        out.push(valuesSql.slice(start, i + 1));
        start = -1;
      }
    }
    i++;
  }
  return out;
}

function splitFields(tupleSql) {
  // tupleSql: "(a,'b,c',NULL)" -> ["a", "'b,c'", "NULL"]
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
        if (s[i + 1] === "'") { // doubled quote
          cur += "'";
          i += 2;
          continue;
        }
        inStr = false;
      }
      i++;
      continue;
    }
    if (ch === "'") {
      inStr = true;
      cur += ch;
      i++;
      continue;
    }
    if (ch === ',') {
      out.push(cur.trim());
      cur = '';
      i++;
      continue;
    }
    cur += ch;
    i++;
  }
  if (cur.trim() !== '') out.push(cur.trim());
  return out;
}

function smartDataEq(table, a, b) {
  if (!a.insertCols || !a.insertVals || !b.insertCols || !b.insertVals) {
    // If no inserts in either, compare raw.
    return normValues(a.insertVals ?? '') === normValues(b.insertVals ?? '');
  }
  const cols = a.insertCols.split(',').map((c) => c.trim().replace(/`/g, ''));
  const colsB = b.insertCols.split(',').map((c) => c.trim().replace(/`/g, ''));
  if (cols.join(',') !== colsB.join(',')) return false;

  const keepIdx = cols
    .map((c, idx) => ({ c, idx }))
    .filter(({ c }) => !IGNORE_COLS.has(c))
    .map(({ idx }) => idx);

  const normRows = (vals) =>
    splitTuples(vals).map((tup) => {
      const fields = splitFields(tup);
      const kept = keepIdx.map((i) => fields[i] ?? 'NULL');
      return kept.join('|');
    }).sort();

  const ra = normRows(a.insertVals);
  const rb = normRows(b.insertVals);
  if (ra.length !== rb.length) return false;
  for (let i = 0; i < ra.length; i++) {
    if (ra[i] !== rb[i]) return false;
  }
  return true;
}

const A = extract(aSql);
const B = extract(bSql);
const tables = [...new Set([...Object.keys(A), ...Object.keys(B)])].sort();

/** @type {{table: string, structure: string, data: string}[]} */
const rows = [];
let dataOk = true;
let structOk = true;

for (const t of tables) {
  const a = A[t];
  const b = B[t];
  if (!a) { rows.push({ table: t, structure: 'solo en B', data: '-' }); dataOk = false; structOk = false; continue; }
  if (!b) { rows.push({ table: t, structure: 'solo en A', data: '-' }); dataOk = false; structOk = false; continue; }
  const sEq = normCreate(a.create) === normCreate(b.create) && (a.insertCols ?? '') === (b.insertCols ?? '');
  const dEq = smartDataEq(t, a, b);
  if (!sEq) structOk = false;
  if (!dEq) dataOk = false;
  rows.push({ table: t, structure: sEq ? 'igual' : 'distinto', data: dEq ? 'igual' : 'distinto' });
}

console.log('Comparación de dumps (omitidas: form_*, page_content, team_members)\n');
console.log('Tabla                      | Estructura | Datos');
console.log('---------------------------|------------|--------');
for (const r of rows) {
  console.log(`${r.table.padEnd(26)} | ${r.structure.padEnd(10)} | ${r.data}`);
}
console.log('\n--- Resumen ---');
console.log('Estructura lógica igual:', structOk ? 'Sí' : 'No (solo dialecto/orden o diferencias reales)');
console.log('Datos iguales:', dataOk ? 'Sí' : 'No');

if (!dataOk) process.exit(2);
process.exit(0);

