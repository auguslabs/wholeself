/**
 * POST /api/forms/loved-one-needs-help — Formulario "My loved one needs help".
 * Body: yourName, relationship, phone, email, contactMethod, situation, questions, howHelp, language?
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
  const your_name = sanitizeString(o.yourName, 255);
  if (!your_name) {
    return json({ ok: false, error: 'yourName is required' }, 400);
  }
  const relationship = sanitizeString(o.relationship, 50);
  const phone = sanitizeString(o.phone, 50);
  const email = sanitizeString(o.email, 255);
  const contact_method = sanitizeString(o.contactMethod, 50);
  const situation = sanitizeText(o.situation);
  const questions = sanitizeText(o.questions);
  const how_help = sanitizeText(o.howHelp);
  const language = sanitizeString(o.language, 2);

  let conn;
  try {
    conn = await getDbConnection();
    await conn.execute(
      `INSERT INTO form_loved_one (
        your_name, relationship, phone, email, contact_method,
        situation, questions, how_help, language
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        your_name, relationship, phone, email, contact_method,
        situation, questions, how_help, language,
      ]
    );
    return json({ ok: true });
  } catch (err) {
    console.error('Form loved-one-needs-help DB error:', err);
    return json({ ok: false, error: 'Failed to save submission' }, 500);
  } finally {
    if (conn) await conn.end().catch(() => {});
  }
};
