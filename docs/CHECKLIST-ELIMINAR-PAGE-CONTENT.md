# Checklist: Eliminar dependencia de `page_content`

Objetivo: dejar de guardar y leer contenido desde la tabla **`page_content`** (blob). Cada página debe vivir en su propia tabla plana (o tabla dedicada) y el frontend/API solo usar esas tablas.

---

## Estado actual (resumen)

| Origen | Qué usa hoy |
|--------|-------------|
| **Backend** `content.php` | Páginas con tabla propia: home, shared-header, shared-footer, **team**, crisis-resources, what-to-expect, rates, services, **contact** (incl. form en `page_contact.form_json`), fellowship, immigration-evaluations. Cualquier otro `pageId` → blob. |
| **Frontend SSR** `contentDbService.server.ts` | what-to-expect, rates, **contact** (form desde form_json), services, fellowship, immigration-evaluations, **team**, **crisis-resources** → tablas propias. Cualquier otro → `page_content`. |

---

## Qué falta (resumen)

1. ~~**Contact**~~ — Hecho: columna `form_json`, GET/PATCH en content.php, getContactContentFromDb sin page_content.
2. ~~**Crisis-resources**~~ — Hecho: rama + `getCrisisResourcesContentFromDb()` en el front.
3. **Otros `page_id`**: listar los que aún estén en `page_content`, migrar uno a uno.
4. **Eliminación final**: quitar todas las referencias a `page_content` y opcionalmente borrar la tabla.

---

## 1. Team (`pageId = 'team'`) — HECHO

- [x] **Crear tabla** `page_team` (solo meta + seo; miembros ya están en `team_members`).
  - Migración: `031_create_page_team.sql`.
- [x] **Backend** `content.php`:
  - GET team: leer meta/seo desde `page_team`; miembros vía `/api/team-members`. Sin `page_content`.
  - PATCH/PUT team: escribir meta/seo en `page_team`. Sin `page_content`.
- [x] **Frontend** `contentDbService.server.ts`:
  - Rama `if (pageId === 'team') return getTeamContentFromDb();` leyendo `page_team` + `team_members`. Sin `page_content`.

---

## 2. Contact – formulario (`form` en `content`) — HECHO

- [x] **Decisión**: columna `form_json` (LONGTEXT) en **`page_contact`**.
- [x] **Migración**: `032_add_page_contact_form_json.sql` (ALTER TABLE page_contact ADD form_json LONGTEXT).
- [x] **Backend** `content.php`:
  - GET contact: leer `form` desde `page_contact.form_json`. Sin `page_content`.
  - PATCH/PUT contact: escribir `form` en `page_contact.form_json` (ambas filas en/es). Sin `page_content`.
- [x] **Frontend** `contentDbService.server.ts`:
  - `getContactContentFromDb()`: leer `form` desde `page_contact.form_json` (en/es). Sin `page_content`.

---

## 3. Crisis-resources (SSR ya no usa blob) — HECHO

- [x] **Backend** `content.php`: ya usa `page_crisis_resources` (GET y PATCH).
- [x] **Frontend** `contentDbService.server.ts`:
  - Rama `if (pageId === 'crisis-resources') return getCrisisResourcesContentFromDb();` antes del fallback a `page_content`.
  - `getCrisisResourcesContentFromDb()` leyendo de `page_crisis_resources` (2 filas en/es), mismo formato que la API (hero, button, categories).
- [x] Crisis-resources ya no depende de `page_content` en el frontend.

---

## 4. Cualquier otro `pageId` que caiga al blob

Hoy, cualquier `pageId` no listado explícitamente en `content.php` o en `getPageContentFromDb` termina en:

- **Backend**: devolverá error (fallback a `page_content` deshabilitado).
- **Frontend**: devolverá error (fallback a `page_content` deshabilitado).

- [ ] **Listar** en producción/editor qué `page_id` existen en `page_content` (ej. `SELECT page_id FROM page_content;`).
- [ ] Por cada uno:
  - [ ] Crear tabla plana dedicada (o reutilizar si ya existe).
  - [ ] Añadir rama GET/PATCH en `content.php` y rama en `getPageContentFromDb`.
  - [ ] Migrar datos desde `page_content` a la nueva tabla.
  - [ ] Dejar de leer/escribir ese `page_id` en `page_content`.

---

## 5. Eliminación final de `page_content`

Solo cuando **ninguna** rama de código lea o escriba en `page_content`:

- [ ] Buscar en el repo: `page_content`, `FROM page_content`, `INTO page_content`.
- [ ] Confirmar que no queden referencias (salvo migraciones históricas o scripts de export).
- [ ] (Opcional) Renombrar tabla a `page_content_deprecated` o eliminarla tras backup: `DROP TABLE page_content;`.

---

## Resumen por archivo

| Archivo | Estado |
|---------|--------|
| `public/api/content.php` | Team y Contact (form_json) hechos. Resto de pageIds no listados → blob. |
| `src/data/services/contentDbService.server.ts` | Team, crisis-resources y Contact (form desde form_json) hechos. Cualquier otro pageId → fallback `page_content`. |
| `scripts/migrations/` | 031 page_team, 032 page_contact form_json. |

Cuando todo esté tachado, el frontend y el backend ya no dependerán de `page_content` para contenido vivo.
