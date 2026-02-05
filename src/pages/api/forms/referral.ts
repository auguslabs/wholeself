/**
 * POST /api/forms/referral — Formulario de referidos.
 * Body: nameCredentials, organization, phone, email, clientName, clientDob, clientContact,
 *       referralReason, preferredTherapist, insurance, additionalNotes, language?
 */
import type { APIRoute } from 'astro';
import { getDbConnection, sanitizeString, sanitizeText, sanitizeDate } from '@/lib/db.server';

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
  const name_credentials = sanitizeString(o.nameCredentials, 255);
  const referral_reason = sanitizeText(o.referralReason);
  if (!name_credentials || !referral_reason) {
    return json({ ok: false, error: 'nameCredentials and referralReason are required' }, 400);
  }
  const organization = sanitizeString(o.organization, 255);
  const phone = sanitizeString(o.phone, 50);
  const email = sanitizeString(o.email, 255);
  const client_name = sanitizeString(o.clientName, 255);
  const client_dob = sanitizeDate(o.clientDob);
  const client_contact = sanitizeString(o.clientContact, 255);
  const preferred_therapist = sanitizeText(o.preferredTherapist);
  const insurance = sanitizeString(o.insurance, 255);
  const additional_notes = sanitizeText(o.additionalNotes);
  const language = sanitizeString(o.language, 2);

  let conn;
  try {
    conn = await getDbConnection();
    await conn.execute(
      `INSERT INTO form_referral (
        name_credentials, organization, phone, email,
        client_name, client_dob, client_contact,
        referral_reason, preferred_therapist, insurance, additional_notes, language
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        name_credentials, organization, phone, email,
        client_name, client_dob, client_contact,
        referral_reason, preferred_therapist, insurance, additional_notes, language,
      ]
    );
    return json({ ok: true });
  } catch (err) {
    console.error('Form referral DB error:', err);
    return json({ ok: false, error: 'Failed to save submission' }, 500);
  } finally {
    if (conn) await conn.end().catch(() => {});
  }
};
