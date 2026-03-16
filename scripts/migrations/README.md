# Migraciones de base de datos — formularios

Scripts SQL para crear y actualizar las tablas de los 4 formularios de contacto.

## Requisitos

- MySQL 5.7+ o MariaDB.
- Base de datos creada (ej. `wholeself_forms` en tu hosting con cPanel: Bluehost, BanaHost, etc.).

## Cómo ejecutar

### En local (MySQL instalado)

```bash
# Crear la base de datos primero (una vez)
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS wholeself_forms CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# Ejecutar la migración
mysql -u root -p wholeself_forms < scripts/migrations/001_create_form_tables.sql
```

Ajusta usuario y contraseña según tu entorno. Usa variables de entorno (no pongas la contraseña en el repo).

### En hosting con cPanel (Bluehost, BanaHost, etc.)

Los pasos son los mismos en cualquier proveedor que use cPanel (MySQL + phpMyAdmin).

#### Paso A: Crear la base de datos y el usuario (Manage My Data / MySQL Databases)

1. En el panel de tu hosting (cPanel), entra a **Manage My Data** o **MySQL Databases** (gestión de bases de datos MySQL).
2. **Crear la base de datos**
   - Busca la sección **Create New Database** (o similar).
   - Nombre sugerido: `wholeself_forms` (en algunos paneles el nombre final será `tuusuario_wholeself_forms`; anota el nombre completo que te muestre).
   - Clic en **Create Database**.
3. **Crear el usuario de la base de datos**
   - En la misma página, busca **Add New User** (o **MySQL Users**).
   - Elige un nombre de usuario (ej. `wholeself_forms`) y una contraseña segura.
   - Guarda usuario y contraseña en un lugar seguro (no en el repositorio). Los usarás en `DATABASE_URL` o en las variables de entorno del servidor.
   - Clic en **Create User**.
4. **Asignar el usuario a la base de datos**
   - Busca **Add User To Database** (o **Privileges** / asignar usuario a base de datos).
   - Selecciona el usuario que creaste y la base de datos `wholeself_forms`.
   - Asigna **ALL PRIVILEGES** (todos los privilegios) sobre esa base de datos.
   - Guarda los cambios.
5. Anota en un lugar seguro (solo para ti, no en el repo):
   - **Host** (suele ser `localhost` en la mayoría de hostings).
   - **Nombre de la base de datos** (ej. `tuusuario_wholeself_forms`).
   - **Usuario** y **Contraseña** del usuario MySQL.

#### Paso B: Crear las tablas (phpMyAdmin)

1. En tu cPanel, abre **phpMyAdmin** (suele estar en la sección de bases de datos o en “Manage My Data”).
2. En el panel izquierdo, selecciona la base de datos que creaste (ej. `wholeself_forms`).
3. Ve a la pestaña **SQL**.
4. Copia **todo** el contenido del archivo `001_create_form_tables.sql` (incluyendo comentarios; MySQL los ignora al ejecutar).
5. Pégalo en el cuadro de texto y haz clic en **Go** (o **Continuar**).
6. Verifica que aparezcan las 4 tablas: `form_contact`, `form_referral`, `form_i_need_help`, `form_loved_one`.

### Orden de migraciones

- `001_create_form_tables.sql` — crear tablas de formularios (ejecutar primero).
- `002_...`, `003_...` — según corresponda.
- `004_create_page_content.sql` — crear tabla de contenido de páginas (para API `/api/content/*`). **Después** de ejecutarla, cargar los datos con el archivo **`extra/json-to-bd/page_content_data.sql`** en phpMyAdmin (misma BD). Sin esto, el sitio usará fallback a JSON estático y verás avisos en consola (ej. crisis-resources).
- **`007_fix_page_home_ctas.sql`** — corrige los CTAs en la tabla **`page_home`** (id, link, icon, title, description). Solo aplica si la Home se sirve desde `page_home` y los datos quedaron mal (ej. "Array" o vacíos). Ver **`docs/HOME-CTA-PAGE-HOME-LECCIONES.md`** para contexto y contrato API/editor.
- **`008_create_page_shared_footer.sql`** — crea la tabla **`page_shared_footer`** (2 filas en/es) e inserta datos iniciales. La API lee/escribe el footer con `pageId=shared-footer` desde esta tabla para que el editor (Augushub) pueda editar el pie de página.
- **`010_fix_footer_nav_resources_fellowship.sql`** — corrige en **`page_shared_footer`** los campos `nav_title`, `resources_title` y `link4_label` cuando están vacíos o son `"0"`, para que el footer muestre "Navigation"/"Resources" y "Fellowship Program" desde la BD.
- **`011_create_page_crisis_resources.sql`** — crea la tabla **`page_crisis_resources`** (2 filas: locale en, es) con columnas: hero_title, button_aria_label, button_title, seo_title, seo_description, **categories_json** (LONGTEXT con el array completo de categorías → subcategorías → recursos: teléfonos, URLs, descripciones, tty, videoPhone, email, hours, address, etc.). La API lee/escribe con `pageId=crisis-resources`. Ejecutar en la misma BD que usa `public/api/content.php`. Los datos iniciales son mínimos.
- **`012_seed_crisis_resources_from_export.sql`** — actualiza **`page_crisis_resources`** con el contenido completo del módulo (hero, button, seo, categories con todas las subcategorías y recursos). Ejecutar **después** de 011. Se genera con `node scripts/migrations/extract-crisis-json.js "ruta/al/export-page_content.json"` (export phpMyAdmin de la tabla page_content).
- **`013_fix_crisis_resources_meta_last_updated.sql`** — rellena **`meta_last_updated`** en `page_crisis_resources` con valor ISO 8601 para evitar ZodError "Invalid datetime" en el front. Ver **docs/PATRON-CONTENIDO-DESDE-BD-FRONT-Y-BACK.md** §2.5.
- **`014_create_page_what_to_expect.sql`** — crea la tabla **`page_what_to_expect`** (2 filas: locale en, es) con columnas: hero_title, hero_subtitle, intro_text, **sections_json** (LONGTEXT, timeline por idioma), **cta_section_json** (LONGTEXT, CTAs por idioma). La API lee/escribe con `pageId=what-to-expect`. Ejecutar en la misma BD que usa `public/api/content.php`. **Incluye INSERT con contenido real** (hero, intro, 6 secciones, CTAs) extraído del export de page_content. Para regenerar desde un export: `node scripts/migrations/extract-what-to-expect-json.js "ruta/al/export.json"` (genera opcionalmente `015_seed_what_to_expect_from_export.sql`).
- **`015_create_page_rates.sql`** — crea la tabla **`page_rates`** (2 filas: locale en, es) con columnas: hero_title, hero_subtitle, hero_background_image, hero_background_image_alt, **pricing_json**, **insurance_json**, **payment_options_json**, **faq_json**, **cta_section_json**. La API lee/escribe con `pageId=rates`. Ejecutar en la misma BD que usa `public/api/content.php`. **Incluye INSERT con contenido real** (tarifas, seguro, opciones de pago, FAQ, CTA) extraído del export de page_content. Para regenerar: `node scripts/migrations/extract-rates-json.js "ruta/al/export.json"`.
- **`018_create_page_services.sql`** — crea la tabla **`page_services`** (2 filas: locale en, es) con columnas: hero (title, subtitle, background_image, alt), seo, quick_jump_text, immigration_evaluation_text, intro_text, **categories_json**, **conditions_section_json**, **cta_section_json**. La API leerá/escribirá con `pageId=services`. **Incluye INSERT mínimo**; para datos reales: exportar page_content, ejecutar `node scripts/migrations/extract-services-json.js "ruta/al/export.json"` y luego el archivo generado **018_seed_services_from_export.sql**.
- **`019_normalize_hero_images_routes.sql`** — normaliza las rutas del hero para Home, Rates y Services a **`/uploads/hero/home.webp`**, **`/uploads/hero/rates.webp`**, **`/uploads/hero/services.webp`**. Requiere tener esos archivos en `public/uploads/hero/` (copiados desde los `banner-*.webp` de la raíz de public). Ejecutar en la misma BD que usa `public/api/content.php`.
- **`020_normalize_insurance_logos_uploads.sql`** — actualiza **`page_rates.insurance_json`** para que `providerList` sea un array de `{ name, logoUrl }` con **`logoUrl`** = `/uploads/insurance/<archivo>`. Los archivos están en `public/uploads/insurance/` (copiados desde `public/logos/insurance/`). Misma fuente que el hero: todo bajo `/uploads/`. Ejecutar en la misma BD que usa `public/api/content.php`.
- **`021_create_page_fellowship.sql`** — crea la tabla **`page_fellowship`** (2 filas: locale en, es) con columnas: hero (title, subtitle, description, icon, announcement), mission (title, content), **benefits_json**, **program_details_json**, **how_to_apply_json**. La API leerá/escribirá con `pageId=fellowship`. **Incluye INSERT** con datos desde el export de page_content (fila fellowship). Para regenerar el seed: `node scripts/migrations/extract-fellowship-json.js "ruta/al/export.json"` y opcionalmente ejecutar **021_seed_fellowship_from_export.sql**.
- **`022_create_page_immigration_evaluations.sql`** — crea la tabla **`page_immigration_evaluations`** (2 filas: locale en, es) con columnas: hero (title, description), intro_text, **specializations_json** (array de especialidades), **faq_json** (preguntas/respuestas o párrafos), cta (title, subtitle, buttonText). Contenido extraído de `src/pages/services/immigration-evaluations.astro` (no existía en page_content). Después: añadir GET/PUT en content.php y getImmigrationEvaluationsContentFromDb() en contentDbService.server.ts; opcionalmente refactorizar el .astro para consumir desde la API.
- **`023_fix_page_services_conditions_section.sql`** — rellena **`page_services.conditions_section_json`** (en y es) cuando la columna está vacía o NULL, para que la sección "Conditions We Support" se muestre en la página de Servicios. Ejecutar en la misma BD que usa content.php (ej. ajamoment.com). **Si ves "0 rows affected"**: en esa BD no hay filas en `page_services`; ejecuta primero **018_create_page_services.sql** (crea tabla e inserta en/es) y luego vuelve a ejecutar 023.
- **`024_conditions_flat_table.sql`** — reestructura "Conditions We Support" **sin JSON**: (1) crea **`page_services_condition`** (7 filas, una por condición: anxiety, adhd, depression, bipolar, trauma, stress, identity) con columnas planas (slug, icon, title_en, title_es, short_description_en, short_description_es, detail_title_en, detail_title_es, detail_content_en, detail_content_es, display_order); (2) en **`page_services`** añade `conditions_section_title` y `conditions_section_subtitle`, rellena en/es y **elimina** `conditions_section_json`. Requiere tener `page_services` con filas en/es (018). La API y contentDbService leen de estas tablas. Ejecutar en la misma BD que content.php.

## Tabla page_home (Home desde BD)

La Home puede leerse desde la tabla plana **`page_home`** (2 filas: `locale = 'en'` y `locale = 'es'`). Si usas esa tabla, la migración 007 sirve para dejar los CTAs con valores correctos. Documentación completa: **`docs/HOME-CTA-PAGE-HOME-LECCIONES.md`**.

El **footer compartido** se sirve desde **`page_shared_footer`** (2 filas en/es). Migración **008** crea la tabla e inserta datos; la API y el servidor (SSR) leen/escriben ahí cuando `pageId = shared-footer`.

**Crisis Resources** se sirve desde **`page_crisis_resources`** (2 filas en/es). La tabla guarda **todo** el contenido del módulo: hero (título), botón flotante (ariaLabel, title), seo (title, description) y **categories_json** (LONGTEXT) con el array completo: categorías (General & Community Support, Specialized Support), subcategorías (General, Children/Adolescents, Immigrant Resources, Queer Folks, BIPOC, Substance Use, Domestic Violence, Elders, Crime) y cada recurso con name, description, phone, url, text, tty, videoPhone, instantMessenger, email, hours, address (en/es). Migración **011** crea la tabla e inserta datos mínimos. Para cargar el contenido actual (como en el export de page_content): ejecutar `node scripts/migrations/extract-crisis-json.js "ruta/al/export.json"` y luego en el servidor **012_seed_crisis_resources_from_export.sql**. El cliente puede usar **011** y opcionalmente **012** (o generar **012** desde su export) en su entorno.

**What to Expect** se sirve desde **`page_what_to_expect`** (2 filas en/es). La tabla guarda hero (title, subtitle), intro (text), **sections_json** (timeline: id, title, icon, content.intro, content.items, content.paragraphs por idioma) y **cta_section_json** (title, subtitle, ctas por idioma). La API combina en/es al responder. Migración **014** crea la tabla e inserta **contenido real** (6 secciones, 2 CTAs) desde el export de page_content; no hace falta seed adicional.

**Rates** se sirve desde **`page_rates`** (2 filas en/es). La tabla guarda hero (title, subtitle, backgroundImage, backgroundImageAlt), **pricing_json** (title, sessions), **insurance_json** (title, description, **providerList** — array de `{ name, logoUrl }` por ítem para logos editables, providers, modal), **payment_options_json**, **faq_json**, **cta_section_json**. La API combina en/es al responder. Migración **015** crea la tabla e inserta **contenido real** desde el export de page_content. **017** documenta el formato de `providerList` con `logoUrl`; no requiere ejecutar UPDATE (retrocompatible).

**Contact** se sirve desde **`page_contact`** (2 filas en/es) para los **campos editables**: dirección (street, city, state, zip), teléfono, email, horario de oficina (title, hours, note), Facebook e Instagram. El formulario de contacto (content.form) no es editable por ahora y se sigue leyendo desde la fila `contact` de **`page_content`**. Migración **016** crea la tabla e inserta **contenido real**; no hace falta seed adicional.

**Services** se sirve desde **`page_services`** (2 filas en/es). La tabla guarda hero (title, subtitle, backgroundImage, backgroundImageAlt), seo, quick_jump_text, immigration_evaluation_text, intro_text, **categories_json** (categorías con servicios por idioma), **conditions_section_json** (título, subtítulo, conditions[]), **cta_section_json** (title, subtitle, primaryCTAs, secondaryCTA). La API combina en/es al responder. Migración **018** crea la tabla e inserta **datos mínimos**; para cargar contenido real desde la estructura anterior: exportar **page_content** (fila `page_id = 'services'`), ejecutar `node scripts/migrations/extract-services-json.js "ruta/al/export.json"` y luego ejecutar el archivo generado **018_seed_services_from_export.sql** en la BD.

**Fellowship** se sirve desde **`page_fellowship`** (2 filas en/es). La tabla guarda hero (title, subtitle, description, icon, announcement), mission (title, content), **benefits_json**, **program_details_json**, **how_to_apply_json**. La API leerá/escribirá con `pageId=fellowship`. Migración **021** crea la tabla e inserta datos desde el export de page_content (fila fellowship). Para regenerar: `node scripts/migrations/extract-fellowship-json.js "ruta/al/export.json"` y opcionalmente **021_seed_fellowship_from_export.sql**.

**Immigration Evaluations** se sirve desde **`page_immigration_evaluations`** (2 filas en/es). La tabla guarda hero (title, description), intro_text, **specializations_json**, **faq_json**, cta (title, subtitle, buttonText). El contenido inicial se extrajo de la página estática `immigration-evaluations.astro`. Migración **022** crea la tabla e inserta datos. Para que el sitio use la BD: añadir GET/PUT en content.php y getImmigrationEvaluationsContentFromDb() en contentDbService.server.ts; opcionalmente refactorizar el .astro para consumir desde la API.

## Esquema documentado

Ver: [extra/test/esquema-bd-formularios.md](../../extra/test/esquema-bd-formularios.md)
