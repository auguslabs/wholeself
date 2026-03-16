#!/usr/bin/env node
/**
 * Build con BD: comprueba DATABASE_URL y ejecuta astro build.
 * Así se generan dist/index.html y las páginas de condiciones completas (sin redirect).
 * Uso: npm run build:with-db
 * Requisito: .env con DATABASE_URL y BD accesible desde esta máquina.
 */

import { readFileSync, existsSync } from 'fs';
import { spawnSync } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');

function loadEnv() {
  const envPath = join(root, '.env');
  if (!existsSync(envPath)) return {};
  const content = readFileSync(envPath, 'utf8');
  const out = {};
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'")))
      value = value.slice(1, -1);
    out[key] = value;
  }
  return out;
}

const env = loadEnv();
const databaseUrl = env.DATABASE_URL || process.env.DATABASE_URL;

if (!databaseUrl || databaseUrl.trim() === '') {
  console.error('');
  console.error('  [build:with-db] DATABASE_URL no configurada en .env');
  console.error('  Configura en .env la URL de la BD (ej. mysql://user:pass@host:3306/dbname)');
  console.error('  y asegúrate de que la BD sea accesible desde esta máquina.');
  console.error('');
  console.error('  Sin DATABASE_URL el build generará redirects en /services/anxiety, etc.');
  console.error('');
  process.exit(1);
}

console.log('[build:with-db] DATABASE_URL configurada. Ejecutando astro build...\n');
const result = spawnSync('npx', ['astro', 'build'], {
  cwd: root,
  stdio: 'inherit',
  env: { ...process.env, ...env },
  shell: true,
});

process.exit(result.status ?? 1);
