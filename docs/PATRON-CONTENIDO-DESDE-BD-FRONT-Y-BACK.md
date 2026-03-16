# Patrón: contenido desde BD en front y back (refetch 60s, mismo origen, seo válido)

**Objetivo:** Cualquier sección o página que lea contenido desde la BD debe seguir este mismo patrón para que los cambios del editor se vean en el sitio sin hacer build, y para evitar CORS, validación Zod y datos “congelados”.

**Referencia:** Solución aplicada al **Footer** (tabla `page_shared_footer`, endpoint `shared-footer`). La **Home** ya seguía este patrón; el Footer se alineó a él.

---

## 1. Qué problema teníamos (Footer como ejemplo)

- El **editor** guardaba cambios en la BD y la **API** devolvía bien el JSON (GET `/api/content/shared-footer`).
- En el **sitio** el footer seguía mostrando el texto viejo (“Whole Self Counseling” en vez de “Whole Self Counseling + Testing Changes”).

**Causas que encontramos:**

1. **Solo un fetch al montar**  
   El Footer hacía un único `getSharedContent('footer')` al montar. Si fallaba o el componente se reutilizaba (View Transitions), no se volvía a intentar y se quedaba con los datos del build/SSR.

2. **CORS (origen distinto)**  
   En el cliente se usaba `PUBLIC_API_BASE` (ej. `https://www.wholeselfnm.com`). El usuario estaba en `https://www.ajamoment.com`, así que el fetch iba a otro origen → CORS bloqueaba la petición → fallo y fallback al dato estático.

3. **Validación Zod**  
   La API devolvía `seo: {}`. El esquema `ContentPageSchema` exige `seo.title` y `seo.description` (LocalizedTextSchema). Al ser `undefined`, la validación fallaba y se lanzaba error → no se actualizaba `liveFooterData`.

---

## 2. Solución (reglas a seguir siempre)

### 2.1 Backend (API PHP `content.php`)

- **GET** del recurso (ej. `shared-footer`):
  - Leer de la tabla plana (ej. `page_shared_footer`) por `locale` (`en`, `es`).
  - Construir el JSON con **`meta`**, **`seo`** y **`content`**.
  - **`seo`** debe cumplir el contrato del front: **siempre** incluir `title` y `description`. Si la tabla no tiene columnas SEO, devolver al menos:
    - `seo: { title: { en: '', es: '' }, description: { en: '', es: '' } }`
  - No devolver `seo: {}` si el cliente valida con Zod `SEOContentSchema` (title y description requeridos).

- **PUT** del recurso:
  - Recibir `{ meta, seo, content }`, normalizar con helpers (`$loc()`, `$str()`) y escribir en la tabla por `locale`.
  - En closures que usen `$str` o `$loc`, incluir esas variables en el `use` de la función anónima para no tener “Undefined variable” en PHP.
  - `bind_param`: la cadena de tipos debe tener **exactamente** el mismo número de caracteres que placeholders en el SQL (uno por cada `?`).

### 2.2 Frontend – URL del fetch (evitar CORS)

- En el **cliente** (navegador), la URL base para pedir contenido debe ser **siempre el mismo origen** que la página: **`window.location.origin`**.
- No usar `PUBLIC_API_BASE` en el cliente para contenido compartido (footer, header) ni para páginas por pageId si sitio y API están en el mismo dominio. Así:
  - En `www.ajamoment.com` → fetch a `https://www.ajamoment.com/api/content/...`
  - En `www.wholeselfnm.com` → fetch a `https://www.wholeselfnm.com/api/content/...`
- Referencia en código: `contentService.ts` → `getSharedContent` y `getPageContent` usan `window.location.origin` en el cliente.

### 2.3 Frontend – Refetch cada 60 s y al volver a la pestaña

- El componente que muestra contenido desde la API debe:
  1. **Al montar:** hacer fetch (ej. `getSharedContent('footer')` o `getPageContent('home', lang)`).
  2. **Cada 60 segundos:** repetir el mismo fetch con `setInterval(..., 60_000)`.
  3. **Al volver a la pestaña:** repetir el fetch en `window.addEventListener('focus', fetchFn)`.
- Guardar el resultado en estado (ej. `liveFooterData`) y renderizar con **dato vivo ?? dato inicial del SSR/build** para no depender de un solo intento.
- Referencia: `Footer.tsx` (fetch al montar + intervalo 60s + focus) y `HomeContentFromApi.tsx` (mismo patrón).

### 2.4 Validación (Zod)

- La respuesta de la API debe cumplir **ContentPageSchema**: `meta`, `seo` (con `title` y `description`), `content`.
- Si una sección no usa SEO, el backend debe enviar igualmente `seo.title` y `seo.description` (vacíos o desde BD) para que `safeValidateContentPage(data)` no falle.

### 2.5 meta.lastUpdated — evitar ZodError "Invalid datetime" (lección Crisis Resources)

**Problema que tuvimos:** El módulo Crisis Resources no cargaba; en consola aparecía `[contentService] Invalid content structure for "crisis-resources". ZodError: path ["meta","lastUpdated"], validation "datetime"`. El front valida `meta.lastUpdated` con Zod; si la API envía `null`, string vacío o un formato no ISO 8601, la validación falla y el módulo no se muestra.

**Causa:** En la migración/seed de la nueva tabla se insertó `meta_last_updated = NULL`. La API hacía `lastUpdated => $en['meta_last_updated'] ?? $updatedAt`; en algunos entornos o con datos recién insertados se acababa enviando un valor inválido o `null`.

**Reglas para no repetir el error en futuros módulos:**

1. **Backend (content.php GET):** Al construir `meta` para cualquier pageId que use ContentPageSchema:
   - **Nunca** enviar `meta.lastUpdated` como `null` o vacío.
   - Calcular un string **siempre** en formato ISO 8601 (ej. con `date('c', strtotime($en['updated_at']))` o `date('c')` como fallback).
   - Si `meta_last_updated` o `updated_at` son NULL/inválidos, usar `date('c')` (ahora) como valor por defecto antes de asignar a `$meta['lastUpdated']`.

2. **Migraciones SQL:** Al crear tablas nuevas con `meta_last_updated`:
   - Opción A: En el INSERT inicial, dar valor ISO 8601 (ej. `CONCAT(DATE_FORMAT(UTC_TIMESTAMP(), '%Y-%m-%dT%H:%i:%s'), 'Z')`) en vez de `NULL`.
   - Opción B: Dejar NULL y asegurar en content.php que el GET siempre construya un `lastUpdated` válido (ver punto 1).

3. **Frontend (contentSchemas.ts):** El esquema `lastUpdated` está definido para aceptar string, null o undefined y **transformar** a ISO 8601; así se evita que un valor raro de la API tumbe el módulo. No volver a poner `z.string().datetime()` estricto sin transform; mantener el `lastUpdatedSchema` actual que normaliza en el transform.

**Referencia de código:** `public/api/content.php` bloque GET `crisis-resources` (cálculo de `$lastUpdated`); `src/data/validators/contentSchemas.ts` (`lastUpdatedSchema`); migración `013_fix_crisis_resources_meta_last_updated.sql` (fix manual en BD).

---

## 3. Paso a paso para una nueva sección o tabla

Seguir este orden al añadir una **nueva** sección que lee/escribe en BD (nueva tabla plana, nuevo pageId).

### Paso 1 – BD y migración

- Crear tabla plana con filas por `locale` (`en`, `es`), columnas para meta (opcional), seo (opcional), y los campos de la sección.
- Incluir en la migración INSERT inicial para `en` y `es` (y ON DUPLICATE KEY UPDATE si aplica).
- Documentar en el mismo repo el nombre de la tabla y el pageId (ej. `shared-footer` → `page_shared_footer`).

### Paso 2 – API (`content.php`)

- **GET** `pageId`:
  - Leer de la nueva tabla por `locale`, construir `meta`, `seo`, `content`.
  - Asegurar **siempre** `seo: { title: { en, es }, description: { en, es } }` (aunque sea vacío).
  - **meta.lastUpdated:** siempre un string en formato ISO 8601; si `meta_last_updated` o `updated_at` son NULL/inválidos, usar `date('c')` (ver §2.5).
  - Devolver `json_encode(['meta' => $meta, 'seo' => $seo, 'content' => $content])`.
- **PUT** `pageId`:
  - Recibir body `{ meta, seo, content }`, normalizar con `$loc`/`$str`, hacer UPDATE por `locale`.
  - Usar `use ($navItems, $str)` (o las variables que hagan falta) en las closures que usen `$str`/`$loc`.
  - Comprobar que la cadena de tipos de `bind_param` tenga exactamente el mismo número de caracteres que placeholders.

### Paso 3 – Servicio de contenido (front)

- Si es contenido **compartido** (varios layouts/páginas): usar o crear función tipo `getSharedContent('footer'|'header')` que:
  - En SSR: llame al servicio de BD del servidor (ej. `getSharedContentFromDb`).
  - En cliente: haga fetch a `window.location.origin + '/api/content/' + pageId` con `?_t=${Date.now()}` y mismo manejo de errores/validación que el resto.
- Si es contenido de **página**: usar `getPageContent(pageId, locale)` (ya usa mismo origen en cliente).
- Validar la respuesta con `safeValidateContentPage(data)` antes de devolverla.

### Paso 4 – Componente que muestra el contenido

- Recibir **dato inicial** por props (del SSR/build).
- Estado para **dato vivo**: `const [liveData, setLiveData] = useState<ContentPage | null>(null)`.
- **Función de fetch** (useCallback) que llame a `getSharedContent(...)` o `getPageContent(...)` y en éxito haga `setLiveData(data)`.
- **useEffect 1:** al montar llamar al fetch y programar `setInterval(fetchFn, 60_000)`; cleanup con `clearInterval`.
- **useEffect 2:** `window.addEventListener('focus', fetchFn)` y cleanup con `removeEventListener`.
- Renderizar con **`const data = liveData ?? initialData`** y derivar `content`, etc., de `data`.

### Paso 5 – Documentación y regla

- Actualizar docs (ej. LISTO-PARA-EDITOR-FOOTER-Y-HOME.md o este mismo doc) con el nuevo pageId, tabla y shape de `content`.
- La regla en `.cursor/rules/patron-contenido-bd-refresh-60s.mdc` obliga a usar este patrón en nuevas secciones desde BD.
- Para módulos con UI tipo modal y contenido localizado: ver **docs/TAKEAWAY-CRISIS-RESOURCES-UI.md** (evitar propagación de clic al cerrar modal, no renderizar objetos `{ en, es }` en JSX, no duplicar botón de cierre en detalle móvil).

---

## 4. Resumen rápido (checklist)

| Dónde | Qué hacer |
|------|-----------|
| **API GET** | Devolver `meta`, `seo` (con `title` y `description`), `content`. No `seo: {}`. **meta.lastUpdated** siempre string ISO 8601 (nunca null/vacío). |
| **API PUT** | `use ($str)` en closures que usen `$str`; contar placeholders vs cadena de tipos en `bind_param`. |
| **Cliente – URL** | Usar `window.location.origin` para el fetch (mismo origen, sin CORS). |
| **Cliente – Refetch** | Fetch al montar + cada 60 s + en `window` `focus`. |
| **Componente** | `liveData ?? initialData`; estado `liveData` actualizado por el fetch. |
| **Nueva tabla** | Migración + GET/PUT en content.php + servicio + componente con refetch 60s/focus. |

Este documento es la referencia para replicar la lógica en el resto de la página y en futuras tablas/estructuras.
