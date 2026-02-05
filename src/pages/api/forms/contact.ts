/**
 * POST /api/forms/contact — Formulario de contacto general.
 * Body: { name, email, comment, language? }
 */
import type { APIRoute } from 'astro';
import { getDbConnection, sanitizeString, sanitizeText } from '@/lib/db.server';

const json = (data: object, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });

export const POST: APIRoute = async ({ request }) => {
  if (request.headers.get('content-type')?.includes('application/json') !== true) {
    return json({ ok: false, error: 'Content-Type must be application/json' }, 400);
  }
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return json({ ok: false, error: 'Invalid JSON' }, 400);
  }
  const o = body && typeof body === 'object' ? body as Record<string, unknown> : {};
  const name = sanitizeString(o.name, 255);
  const email = sanitizeString(o.email, 255);
  const comment = sanitizeText(o.comment);
  const language = sanitizeString(o.language, 2);
  if (!name || !email || !comment) {
    return json({ ok: false, error: 'name, email and comment are required' }, 400);
  }
  let conn;
  try {
    conn = await getDbConnection();
    await conn.execute(
      `INSERT INTO form_contact (name, email, comment, language) VALUES (?, ?, ?, ?)`,
      [name, email, comment, language || null]
    );
    return json({ ok: true });
  } catch (err) {
    console.error('Form contact DB error:', err);
    return json({ ok: false, error: 'Failed to save submission' }, 500);
  } finally {
    if (conn) await conn.end().catch(() => {});
  }
};
