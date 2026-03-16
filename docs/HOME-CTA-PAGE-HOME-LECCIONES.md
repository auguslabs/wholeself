# Home CTA, tabla page_home y contrato API — Lecciones y referencia

Documento de aprendizaje del proyecto Whole Self: qué falló con la sección CTA de la home, qué errores aparecieron, qué contrato se estableció con el editor (Augushub), qué tabla nueva se usa y qué cambios se hicieron. Sirve como **referencia para proyectos futuros** que usen contenido desde BD + editor externo.

---

## 1. Qué estaba pasando (síntomas)

- La sección **"How can we help you?"** se veía en la home, pero las **tres tarjetas CTA** solo mostraban:
  - Círculo blanco (placeholder de icono)
  - Guiones o texto vacío donde deberían ir título y descripción
- En la consola del navegador:
  - Los 3 ítems llegaban (`list: Array(3)`), pero cada uno tenía `id`, `link` e `icon` como la **cadena literal `"Array"`** y `title`/`description` como `{ en: '', es: '' }`.
- Conclusión: el front recibía estructura correcta pero **contenido vacío o mal formado**.

---

## 2. Errores que aparecieron (en orden)

| Error | Dónde | Causa |
|-------|--------|--------|
| `TypeError: Cannot read properties of undefined (reading 'map')` | CTASection / ValuePropositions | La API devolvía `ctaSection.items` o el front usaba solo `ctaSection.ctas`; al no existir una de las dos claves, `.map()` se llamaba sobre `undefined`. |
| `ReferenceError: titlestr is not defined` | CTASection (dentro del `.map`) | Se usaban variables `titleStr` y `descStr` en el JSX pero no se habían declarado en ese callback (typo o código incompleto). |
| Tarjetas con placeholders (icono/título/descripción vacíos) | UI | La API devolvía datos mal formados: `id`, `link`, `icon` como string `"Array"` y `title`/`description` vacíos porque en la BD se había guardado así. |

---

## 3. Causas de fondo

### 3.1 Cadena "Array" en id, link, icon

- El **editor (Augushub)** a veces envía en el body del PUT campos como `id`, `link` o `icon` en formato **objeto** `{ en: "...", es: "..." }` en lugar de string.
- En PHP, al hacer `bind_param('s', $valor)` con un **array**, PHP convierte el array a la cadena literal `"Array"`.
- Ese valor se guardaba en `page_home` (columnas `cta1_id`, `cta1_link`, `cta1_icon`, etc.).
- Al leer (GET), la API devolvía `"Array"` y el front no podía resolver icono ni enlaces.

### 3.2 Títulos y descripciones vacíos

- O bien no se habían migrado/cargado nunca los textos en `page_home`, o un guardado anterior había escrito objetos/valores vacíos en las columnas `cta1_title`, `cta1_description`, etc.

### 3.3 Desalineación de contrato (items vs ctas)

- El front esperaba en algún momento `ctaSection.items` y la API devolvía `ctaSection.ctas` (o al revés), lo que generaba listas vacías y el `undefined.map()`.

---

## 4. Contrato único con el editor (API ↔ Augushub)

Para que el sitio y el editor no den “vueltas” entre dos nombres, se fijó **un solo contrato**. La fuente de verdad del proyecto está en `.cursor/rules/cliente-contrato-bd-api.mdc` y se resume aquí para la **Home**.

### 4.1 GET — Respuesta de la API (Home)

- **Endpoint:** `GET /api/content?pageId=home`
- **Forma de la respuesta:** `{ meta, seo, content }`
- **Contenido relevante para CTA:**
  - `content.ctaSection.title` → `{ en: string, es: string }`
  - `content.ctaSection.ctas` → **array de 3 objetos** (no usar `items`).
- **Cada elemento de `ctas` tiene:**
  - `id` → **string** (ej. `"i-need-help"`, `"loved-one"`, `"referral"`).
  - `title` → `{ en: string, es: string }`.
  - `description` → `{ en: string, es: string }`.
  - `link` → **string** (ruta, ej. `"/contact/i-need-help"`).
  - `icon` → **string** (nombre del icono, ej. `"HandRaisedIcon"`).

### 4.2 PUT — Guardado desde el editor

- **Endpoint:** `PUT /api/content?pageId=home` (o `POST`), header `X-API-Key`, body `{ meta, seo, content }`.
- El backend **acepta** `content.ctaSection.ctas` (y por compatibilidad temporal `content.ctaSection.items`).
- **Importante:** `id`, `link` e `icon` deben tratarse siempre como **escalares (string)** al escribir en BD. Si el editor envía `{ en, es }`, el backend debe normalizar a un solo string (p. ej. usar `en`) y guardar ese string en `page_home`.

---

## 5. Tabla `page_home` (nueva estructura)

La home **no** se guarda en el blob de `page_content`; tiene su propia tabla plana.

- **Nombre:** `page_home`
- **Filas:** 2 — una por idioma: `locale = 'en'` y `locale = 'es'`.
- **Columnas (snake_case):** todas las que usa la API en `content.php` (hero, value propositions, CTA, meta, SEO). Para los CTAs:

| Columna | Tipo | Uso |
|---------|------|-----|
| `locale` | VARCHAR | `'en'` o `'es'` (parte de la clave/filtro) |
| `cta_section_title` | TEXT/VARCHAR | Título de la sección (por locale) |
| `cta1_id` | VARCHAR | Identificador del primer CTA (string, no objeto) |
| `cta1_title` | TEXT | Título del CTA 1 para este locale |
| `cta1_description` | TEXT | Descripción del CTA 1 para este locale |
| `cta1_link` | VARCHAR | Ruta del enlace (string) |
| `cta1_icon` | VARCHAR | Nombre del icono (ej. HandRaisedIcon) |
| `cta2_id`, `cta2_title`, `cta2_description`, `cta2_link`, `cta2_icon` | idem | CTA 2 |
| `cta3_id`, `cta3_title`, `cta3_description`, `cta3_link`, `cta3_icon` | idem | CTA 3 |

Además la tabla incluye columnas para `meta_*`, `seo_*`, `hero_*`, `vp1_*` … `vp4_*` (ver `content.php` SELECT/UPDATE). La creación de `page_home` puede estar en el repo de Augushub o en migraciones propias del cliente; en este proyecto la corrección de datos se hizo con la migración **007**.

---

## 6. Cambios realizados (resumen)

### 6.1 API (`public/api/content.php`)

- **PUT (escritura):**
  - Se añadió un helper `$str($v)` que convierte a string: si `$v` es `{ en, es }`, se usa `en` (o `es`); si ya es string, se devuelve tal cual.
  - Para cada CTA se usa `$str()` en **id, link e icon** antes de `bind_param`, de modo que **nunca** se guarde un array en columnas string (y por tanto nunca se persista la cadena `"Array"`).
- **GET (lectura):**
  - La respuesta de Home construye **siempre** `content.ctaSection.ctas` (no `items`).
  - Para cada CTA se hace cast explícito a string en id, link, icon y se arma `title`/`description` como `{ en: ..., es: ... }` desde las columnas de la fila `en` y la fila `es`.

### 6.2 Frontend

- **CTASection.tsx**
  - Lista de CTAs: `list = ctaSection?.items ?? ctaSection?.ctas ?? []` para no hacer `.map()` sobre `undefined`.
  - Dentro del `.map()` se declaran y usan `titleStr` y `descStr` con `getLocalizedText(cta.title, lang)` y `getLocalizedText(cta.description, lang)`.
- **ValuePropositions.tsx**
  - Se asegura que `items` sea un array antes de hacer `.map()` (por defecto `[]`).
- **Debug (opcional):** Se añadieron `console.log` con prefijo `[Home CTA]` para inspeccionar en consola la respuesta de la API y los props de la sección; se pueden quitar en producción.

### 6.3 Base de datos

- **Migración `scripts/migrations/007_fix_page_home_ctas.sql`:**
  - Actualiza las filas `locale = 'en'` y `locale = 'es'` de `page_home` con los valores correctos de los 3 CTAs (id, title, description, link, icon) para que la API devuelva datos válidos sin depender de un nuevo guardado desde el editor.

---

## 7. Lecciones para proyectos futuros

1. **Contrato único API ↔ editor**  
   Definir y documentar **un solo** shape (p. ej. `ctaSection.ctas`) y que tanto el backend como el editor lo usen. Evitar mantener dos nombres vivos (`items` y `ctas`) para lo mismo.

2. **Tipos escalares en BD**  
   Si una columna es VARCHAR/TEXT, el valor que se pasa a `bind_param('s', ...)` debe ser **siempre** string. Si el editor puede enviar objetos (p. ej. `{ en, es }`), el backend debe **normalizar a string** antes de guardar (p. ej. con un helper tipo `$str()`), para no guardar la cadena `"Array"`.

3. **Front defensivo con listas**  
   Antes de hacer `.map()` sobre una lista que viene de la API, usar algo como `list = data?.ctas ?? data?.items ?? []` y, si hace falta, `Array.isArray(list) ? list : []`, para evitar `undefined.map()`.

4. **Debug en consola**  
   Logs con un prefijo común (ej. `[Home CTA]`) permiten ver rápido qué devuelve la API y qué recibe cada componente; útiles para detectar datos vacíos o mal formados (`"Array"`, `{ en: '', es: '' }`).

5. **Migraciones de corrección de datos**  
   Si la BD ya tiene datos incorrectos (p. ej. `"Array"` o vacíos), un script SQL de actualización (como 007) es más fiable que depender solo de “volver a guardar desde el editor”, y queda como registro de lo que se corrigió.

6. **Documentar tabla y contrato**  
   Tener un doc (como este) que explique la tabla (`page_home`), el shape del JSON (GET/PUT) y las lecciones aprendidas ayuda a que futuros proyectos repitan el patrón sin repetir los mismos fallos.

---

## 8. Referencias en el repo

| Recurso | Descripción |
|---------|-------------|
| `.cursor/rules/cliente-contrato-bd-api.mdc` | Contrato único BD + API (ctaSection.ctas, tablas planas). |
| `.cursor/rules/reglas-api-bd-contenido.mdc` | Criterios de reglas para seguir (evitar errores repetitivos); aplicados por el agente. |
| `.cursor/rules/regla-secciones-desde-bd-hero-patron.mdc` | Patrón Hero como referencia para todas las secciones (sin hardcodear ni inventar nombres). |
| `public/api/content.php` | Implementación GET/PUT Home y uso de `page_home`. |
| `scripts/migrations/007_fix_page_home_ctas.sql` | Corrección de datos CTA en `page_home`. |
| `docs/CONTENIDO-DESDE-BD-Y-AUGUSHUB-BLUEHOST.md` | Contexto Augushub, scripts y checklist Bluehost. |
| `scripts/migrations/README.md` | Orden de migraciones y cómo ejecutarlas. |
