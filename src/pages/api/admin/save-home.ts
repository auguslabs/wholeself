import type { APIRoute } from 'astro';
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

export const prerender = false;

const TEST_FILES: Record<'en' | 'es', string> = {
  en: path.resolve(process.cwd(), 'extra', 'test', 'home.en.json'),
  es: path.resolve(process.cwd(), 'extra', 'test', 'home.es.json'),
};

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const language = body?.language as 'en' | 'es';
    const content = body?.content;

    if (!language || (language !== 'en' && language !== 'es')) {
      return new Response(JSON.stringify({ message: 'Idioma inválido.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (!content || typeof content !== 'object') {
      return new Response(JSON.stringify({ message: 'Contenido inválido.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const filePath = TEST_FILES[language];
    const raw = await readFile(filePath, 'utf-8');
    const json = JSON.parse(raw);

    const next = {
      ...json,
      meta: {
        ...json.meta,
        lastUpdated: new Date().toISOString(),
        version: typeof json.meta?.version === 'number' ? json.meta.version + 1 : 1,
      },
      content,
    };

    await writeFile(filePath, `${JSON.stringify(next, null, 2)}\n`, 'utf-8');

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('[save-home] Error:', error);
    return new Response(
      JSON.stringify({
        message: error?.message || 'Error guardando contenido.',
        details: import.meta.env.DEV ? String(error?.stack || error) : undefined,
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
};
