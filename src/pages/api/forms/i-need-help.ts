/**
 * POST /api/forms/i-need-help — Formulario "I need help".
 * Body: name, contactMethod, phone, email, bestTime, message, insurance,
 *       preferredTherapist, hearAbout, language?
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
  if (!name) {
    return json({ ok: false, error: 'name is required' }, 400);
  }
  const contact_method = sanitizeString(o.contactMethod, 50);
  const phone = sanitizeString(o.phone, 50);
  const email = sanitizeString(o.email, 255);
  const best_time = sanitizeString(o.bestTime, 50);
  const message = sanitizeText(o.message);
  const insurance = sanitizeString(o.insurance, 255);
  const preferred_therapist = sanitizeString(o.preferredTherapist, 255);
  const hear_about = sanitizeString(o.hearAbout, 50);
  const language = sanitizeString(o.language, 2);

  let conn;
  try {
    conn = await getDbConnection();
    await conn.execute(
      `INSERT INTO form_i_need_help (
        name, contact_method, phone, email, best_time, message,
        insurance, preferred_therapist, hear_about, language
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        name, contact_method, phone, email, best_time, message,
        insurance, preferred_therapist, hear_about, language,
      ]
    );
    return json({ ok: true });
  } catch (err) {
    console.error('Form i-need-help DB error:', err);
    return json({ ok: false, error: 'Failed to save submission' }, 500);
  } finally {
    if (conn) await conn.end().catch(() => {});
  }
};
