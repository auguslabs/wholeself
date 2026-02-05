/**
 * Conexión a MySQL solo en servidor (.server.ts).
 * Usa DATABASE_URL o DB_HOST, DB_USER, DB_PASSWORD, DB_NAME.
 * En serverless (Netlify) se crea una conexión por petición.
 */
/// <reference types="node" />

import mysql from 'mysql2/promise';

export interface DbConfig {
  host: string;
  user: string;
  password: string;
  database: string;
  port?: number;
}

function getEnv(key: string): string | undefined {
  const v = import.meta.env?.[key] ?? process.env?.[key];
  return typeof v === 'string' ? v : undefined;
}

function getDbConfig(): DbConfig {
  // En desarrollo (astro dev), Vite carga .env en import.meta.env. En Netlify, process.env.
  const url = getEnv('DATABASE_URL');
  if (url) {
    try {
      const u = new URL(url);
      return {
        host: u.hostname,
        user: decodeURIComponent(u.username),
        password: decodeURIComponent(u.password),
        database: u.pathname.replace(/^\//, '') || 'wholeself_forms',
        port: u.port ? parseInt(u.port, 10) : 3306,
      };
    } catch {
      // Si DATABASE_URL está mal formado, usar variables por separado
    }
  }
  const host = getEnv('DB_HOST') ?? 'localhost';
  const user = getEnv('DB_USER') ?? '';
  const password = getEnv('DB_PASSWORD') ?? '';
  const database = getEnv('DB_NAME') ?? 'wholeself_forms';
  const portStr = getEnv('DB_PORT');
  const port = portStr ? parseInt(portStr, 10) : 3306;
  return { host, user, password, database, port };
}

export async function getDbConnection() {
  const config = getDbConfig();
  if (!config.user || !config.password) {
    throw new Error('Database config missing: set DATABASE_URL or DB_HOST, DB_USER, DB_PASSWORD, DB_NAME');
  }
  return mysql.createConnection(config);
}

export function sanitizeString(value: unknown, maxLength: number): string | null {
  if (value == null || value === '') return null;
  const s = String(value).trim();
  return s.length > maxLength ? s.slice(0, maxLength) : s;
}

export function sanitizeText(value: unknown): string | null {
  if (value == null || value === '') return null;
  return String(value).trim() || null;
}

export function sanitizeDate(value: unknown): string | null {
  if (value == null || value === '') return null;
  const s = String(value).trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return null;
  return s;
}
