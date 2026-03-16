# Contenido desde BD y Augushub — Qué es y qué crear en Bluehost (producción)

Este documento resume: (1) qué es Augushub y qué hace con Whole Self, (2) qué scripts y endpoints ya existen en el proyecto, y (3) **qué debes crear o ejecutar en el servidor de Bluehost** para que wholeselfnm.com funcione igual que ajamoment.com cuando la BD estaba en Banahost (pruebas). Ahora la BD de producción está en Bluehost.

---

## 1. Qué es Augushub y qué hace

- **Augushub** (augushub.com) es el **portal/editor** de Augus Labs para administrar sitios de clientes.
- Para Whole Self hará:
  - **Leer** el contenido de las páginas (home, services, rates, crisis-resources, etc.) desde la API del sitio.
  - **Editar** textos, SEO, imágenes de hero, etc. en una interfaz.
  - **Guardar** enviando **PUT** (o POST) a `https://www.wholeselfnm.com/api/content/{pageId}` con header **`X-API-Key`** y body JSON `{ meta, seo, content }`.
- El sitio público (wholeselfnm.com) ya está preparado para **leer** todo desde la BD (`page_content`). Cuando Augushub guarde, el visitante verá los cambios al recargar (o con la lógica de refresco que tenga el front).

Referencias en el repo:
- **`extra/augushub/README.md`** — contexto del portal Augushub.
- **`extra/augushub/ENTREGA-AUGUSHUB-ENDPOINT-GUARDADO.md`** — contrato del endpoint (URL, método, headers, body) para que Augushub lo implemente.
- **`extra/augushub/CHECKLIST-DEPLOY-Y-CONFIG-ENDPOINT-GUARDADO.md`** — checklist pensado para ajamoment; en Bluehost aplica lo mismo pero con dominio wholeselfnm.com.
- **`extra/json-to-bd/10-LISTO-PARA-MODULO-EDICION-AUGUSHUB.md`** — qué está listo (lectura desde BD) y qué falta (canal de escritura). El canal de escritura **ya existe**: es el **PUT/POST** en `content.php`; solo hace falta configurar `content_api_config.php` en el servidor.

---

## 2. Scripts y archivos de referencia que ya existen

Todo esto está en el proyecto; no hay que inventar nada nuevo, solo ejecutarlos o copiarlos en el servidor donde corresponda.

### Migraciones y datos (BD)

| Archivo | Qué hace |
|--------|-----------|
| **`scripts/migrations/001_create_form_tables.sql`** | Crea tablas de formularios (`form_contact`, `form_referral`, etc.). |
| **`scripts/migrations/004_create_page_content.sql`** | Crea la tabla **`page_content`** (contenido de páginas: home, crisis-resources, services, etc.). |
| **`extra/json-to-bd/page_content_data.sql`** | Inserta/actualiza las filas de contenido (home, contact, rates, services, crisis-resources, fellowship, team, shared-header, shared-footer, etc.). Ejecutar **después** de `004_create_page_content.sql`. |
| **`extra/json-to-bd/schema-page-content.sql`** | Mismo DDL que `004_create_page_content.sql`; referencia alternativa. |
| **`scripts/migrations/007_fix_page_home_ctas.sql`** | Corrige los CTAs en la tabla **`page_home`** (cuando la Home se sirve desde esa tabla y los datos están mal). Ver **`docs/HOME-CTA-PAGE-HOME-LECCIONES.md`**. |
| **`scripts/migrations/README.md`** | Orden de migraciones y cómo ejecutarlas en cPanel/phpMyAdmin. |

### API de contenido (lectura + escritura desde Augushub)

| Archivo | Qué hace |
|--------|-----------|
| **`public/api/content.php`** | **GET** devuelve contenido: para **Home** lee de la tabla **`page_home`** (2 filas en/es); para otras páginas, de `page_content`. **PUT/POST** recibe guardados desde Augushub (header `X-API-Key`, body `meta`, `seo`, `content`) y escribe en `page_home` (Home) o `page_content`. Contrato y lecciones: **`docs/HOME-CTA-PAGE-HOME-LECCIONES.md`**. |
| **`public/api/content_api_config.sample.php`** | Plantilla de configuración: **`CONTENT_API_KEY`** (clave que enviará Augushub) y **`CONTENT_API_CORS_ORIGINS`** (dominios permitidos, ej. augushub.com). |
| **`public/.htaccess`** | Reglas para que `GET/PUT /api/content/{pageId}` lleguen a `content.php`. |

### Formularios y config de BD (formularios + contenido)

| Archivo | Qué hace |
|--------|-----------|
| **`scripts/php/db_config.example.php`** | Plantilla para MySQL, Resend y correos. En el servidor se usa como base para **`api/forms/db_config.php`**. Ese mismo `db_config.php` es el que usa **`content.php`** para conectar a la BD (lectura y escritura de `page_content`). |
| **`scripts/php/README.md`** | Cómo desplegar los PHP de formularios y configurar `db_config.php`. |

---

## 3. Qué tenías en ajamoment.com (Banahost, pruebas) y qué debes tener en wholeselfnm.com (Bluehost, producción)

En **ajamoment.com** (BD en Banahost) ya tenías:

- Tabla **`page_content`** creada y **datos cargados** (con `page_content_data.sql` o equivalente).
- **`content_api_config.php`** en el servidor (clave API y CORS para Augushub).
- **`db_config.php`** en `api/forms/` con `<?php` correcto y credenciales de la BD de Banahost.
- Sitio y API leyendo desde esa BD; Augushub podía guardar vía PUT al endpoint de contenido.

Para que **wholeselfnm.com** en Bluehost se comporte igual (contenido desde BD y listo para que Augushub edite), hay que tener lo mismo pero apuntando a la **BD y dominio de producción**.

---

## 4. Checklist: qué crear o ejecutar en Bluehost (producción)

Todo en la **misma base de datos** que usa `db_config.php` (la que configuraste para formularios en `api/forms/`).

### 4.1 Base de datos

- [ ] **Tabla de formularios:** ya ejecutaste `001_create_form_tables.sql` (form_contact, etc.).
- [ ] **Tabla de contenido:** ejecutar **`scripts/migrations/004_create_page_content.sql`** en phpMyAdmin (crea `page_content`).
- [ ] **Datos de contenido:** ejecutar **`extra/json-to-bd/page_content_data.sql`** en la misma BD. Así la API devolverá home, crisis-resources, services, etc. y no hará falta fallback a JSON estático.

### 4.2 Archivos en el servidor (carpeta pública del sitio, ej. `public_html/` o `public_html/wholeself/`)

- [ ] **`api/content.php`** — ya va dentro de `dist/`; si subes el contenido de `dist/`, está.
- [ ] **`api/forms/`** — con los PHP de formularios y **`db_config.php`** (primera línea exactamente `<?php`; credenciales MySQL de Bluehost, Resend, etc.). Ese mismo `db_config.php` lo usa `content.php` para leer/escribir `page_content`.
- [ ] **Config para Augushub (escritura):** en el servidor, dentro de **`api/`**, copiar **`content_api_config.sample.php`** como **`content_api_config.php`** y:
  - Definir **`CONTENT_API_KEY`** con una clave secreta (la misma que configurarás en Augushub para este sitio).
  - Definir **`CONTENT_API_CORS_ORIGINS`** e incluir los orígenes de Augushub (ej. `https://augushub.com`, `https://www.augushub.com`) y, si aplica, `http://localhost:5173` para desarrollo.
  - No subir `content_api_config.php` al repo (está en `.gitignore`).

### 4.3 Comprobar

- [ ] **Lectura:** abrir `https://www.wholeselfnm.com/api/content/crisis-resources?locale=en` (o `home`, `services`) y ver JSON con `meta`, `seo`, `content` (sin "Failed to load content").
- [ ] **Escritura (Augushub):** cuando Augushub esté conectado a este sitio, probar guardar una página; la petición será **PUT** `https://www.wholeselfnm.com/api/content/{pageId}` con **X-API-Key** y el body; debe responder `200` y `{ "ok": true }`.

---

## 5. Resumen de referencias rápidas

| Tema | Dónde está |
|------|------------|
| Migraciones (formularios + page_content) | `scripts/migrations/` (001, 004) y `scripts/migrations/README.md` |
| Datos iniciales de páginas | `extra/json-to-bd/page_content_data.sql` |
| Config de API para Augushub (clave + CORS) | `public/api/content_api_config.sample.php` → copiar a `content_api_config.php` en el servidor |
| Contrato del endpoint para Augushub | `extra/augushub/ENTREGA-AUGUSHUB-ENDPOINT-GUARDADO.md` |
| Checklist deploy + endpoint (ajamoment → aplicable a Bluehost) | `extra/augushub/CHECKLIST-DEPLOY-Y-CONFIG-ENDPOINT-GUARDADO.md` |
| Estado “listo para edición desde Augushub” | `extra/json-to-bd/10-LISTO-PARA-MODULO-EDICION-AUGUSHUB.md` |
| Deploy general Bluehost | `docs/DEPLOY-BLUEHOST-CHECKLIST.md` |

En resumen: el proyecto **ya tiene** el flujo de contenido desde BD y el endpoint de guardado para Augushub. En Bluehost solo falta **crear la tabla `page_content`**, **cargar los datos** con `page_content_data.sql`, y **crear `content_api_config.php`** en `api/` con la clave y CORS para augushub.com.

---

## Dónde ver errores de PHP en Bluehost

Si la API devuelve `{"ok":false,"error":"Failed to load content"}` o el sitio se queda en "Cargando…", la causa suele estar en el PHP del servidor.

1. **cPanel → Metrics → Errors** (o **Errors** en la sección de "Advanced")  
   Ahí se listan los últimos errores de PHP; busca líneas que mencionen `content.php` o `[content.php GET]`.

2. **Archivo de log en el servidor**  
   En la raíz de tu sitio (o en `public_html/`) puede haber un archivo **`error_log`**. Ábrelo con File Manager o por FTP y revisa las últimas líneas.

3. **Logs por dominio**  
   En cPanel a veces hay **"Error Log"** o **"Select PHP Version"** y un enlace a los logs del dominio. Ahí verás el mensaje y la línea exacta que lanza la excepción en `content.php`.
