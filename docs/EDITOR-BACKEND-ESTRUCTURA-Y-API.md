# Para el editor: estructura del backend y cómo leer/escribir en la base de datos

Este documento va dirigido al **equipo del editor (CMS / Augushub)**. Explica la estructura actual de la base de datos (cada página con su tabla), cómo leer y escribir contenido vía API y la regla obligatoria sobre la tabla antigua.

---

## 1. Regla obligatoria: NO usar la tabla `page_content`

**La tabla `page_content` no debe tocarse para nada: ni lectura ni escritura.**

- **En el front:** El sitio público **no** debe leer contenido de `page_content`. Todo el contenido se sirve desde las tablas por página (page_home, page_shared_header, page_shared_footer, page_rates, etc.).
- **En el editor:** El editor **no** debe leer ni escribir en `page_content`. Todas las lecturas y escrituras deben hacerse únicamente a través de la API por `pageId`, que a su vez lee y escribe en la tabla correspondiente a cada página.
- **Motivo:** `page_content` es **solo legacy**. Se mantiene en el servidor temporalmente por seguridad durante la transición. **En el futuro será eliminada.** La fuente de verdad del contenido son las tablas por página. Cualquier uso de `page_content` en el editor o en el front es incorrecto y debe evitarse.

Resumen: **ni el front ni el editor deben tocar `page_content`.** Todo el contenido se obtiene y se guarda mediante la API usando `pageId`, que está mapeado a su tabla concreta (ver sección 4).

---

## 2. Modelo de datos: cada página tiene su tabla

- Cada página o sección tiene **su propia tabla** en la BD (con filas por idioma `en` / `es` donde aplica). Tablas adicionales guardan contenido relacionado (condiciones de servicios, proveedores de seguro, etc.).
- **Lectura:** El front y el editor obtienen contenido con **GET** a la API pasando `pageId`. La API lee de la tabla (o tablas) asociada a ese `pageId` y devuelve `meta`, `seo`, `content`.
- **Escritura:** El editor guarda con **PUT** (o POST) al mismo endpoint, enviando el body JSON con `meta`, `seo`, `content`. La API escribe en la tabla correspondiente a ese `pageId`; nunca en `page_content`.

---

## 3. Dónde está la BD y archivo JSON de referencia

- **Estado actual:** La base de datos está en **Banahost**. Ahí se valida la estructura “cada página su tabla”. Cuando todo esté al 100%, se migrará a **Bluehost**.
- **Nombre de la BD:** `koxwefbs_wholeself_forms`.
- **Export en JSON:** Se comparte con el editor el **export en JSON** de la base de datos (phpMyAdmin “Export to JSON”) con la estructura final (estable y funcional a fecha de hoy):
  - **Archivo de referencia:** `koxwefbs_wholeself_forms_final_03_15_26.json` — estructura final de la BD a fecha de hoy (estable y funcional). Ruta de ejemplo: `C:\Users\augus\Downloads\koxwefbs_wholeself_forms_final_03_15_26.json`.
  - En ese JSON aparecen las **tablas que sí se usan** (page_home, page_shared_header, page_shared_footer, page_rates, page_contact, etc.) y también puede aparecer la tabla **`page_content`**. **Importante:** aunque `page_content` aparezca en el export, **no es la fuente de verdad y no debe usarse.** La referencia para estructura y datos son las tablas por página.

---

## 4. Cómo leer y escribir: API por pageId

### Lectura (GET)

- **URL:** `GET /api/content.php?pageId=<pageId>` (opcional: `locale=es` si aplica).
- **Respuesta:** Objeto con `meta`, `seo`, `content`. El backend obtiene estos datos **solo** de la tabla (o tablas) asociada al `pageId`; no de `page_content`.

### Escritura (PUT, desde el editor)

- **URL:** Mismo endpoint (PUT o POST según configuración).
- **Body:** JSON con `meta`, `seo`, `content` según el contrato de cada página.
- El backend persiste **solo** en la tabla correspondiente al `pageId`; nunca en `page_content`.

### Mapeo: pageId → tabla(s) en BD

Todas las páginas que edita el editor leen y escriben en sus propias tablas:

| pageId | Tabla(s) en BD | Notas |
|--------|-----------------|--------|
| **home** | `page_home` | 2 filas: locale `en`, `es`. |
| **shared-footer** | `page_shared_footer` | 2 filas en/es. Nav (nav_link1..6), Resources (link1..6 con label, link, is_modal). |
| **shared-header** | `page_shared_header` | 2 filas en/es. `menu.label`, `menu.closeLabel`; **navigation.items** (nav_link1_label/link .. nav_link6). |
| **crisis-resources** | `page_crisis_resources` | 2 filas en/es. Incluye `categories_json`. |
| **what-to-expect** | `page_what_to_expect` | 2 filas en/es. Incluye `sections_json`, `cta_section_json`. |
| **rates** | `page_rates` + **`insurance_provider`** | 2 filas en/es en `page_rates`. Lista de seguros en **`insurance_provider`**. En PUT se puede enviar `content.insurance.providerList` y se persiste en esa tabla. Ver sección 5. |
| **services** | `page_services` + **`page_services_condition`** | 2 filas en/es en `page_services`; condiciones en `page_services_condition`. |
| **contact** | `page_contact` | 2 filas en/es (hero, dirección, teléfono, horario, redes). Todo lo editable de Contact está aquí. |
| **fellowship** | `page_fellowship` | 2 filas en/es. |
| **immigration-evaluations** | `page_immigration_evaluations` | 2 filas en/es. |

Para leer o actualizar una página, el editor debe usar **solo** el `pageId` de esta tabla. El backend se encarga de leer/escribir en la tabla correcta; el editor **nunca** debe acceder directamente a `page_content`.

---

## 5. Casos que requieren atención en el editor

### 5.1 Rates e insurance providers

- **GET rates:** La API devuelve `content.insurance.providerList` desde la tabla **`insurance_provider`** (cada ítem: `name: { en, es }`, `logoUrl`). El orden del array es el de `display_order` en BD.
- **PUT rates:** El editor **puede** enviar `content.insurance.providerList` al guardar la página Rates. Si se envía un array con al menos un ítem, el backend **reemplaza** el contenido de la tabla `insurance_provider` por esa lista (cada ítem: `name: { en, es }` o `name` string, y opcionalmente `logoUrl` o `logo_url`). El orden del array se guarda como `display_order`. Si no se envía `providerList`, la tabla no se modifica.

**Cómo verificar el endpoint de insurance providers**

- En el código: la escritura está en **`public/api/content.php`** (bloque PUT rates, aprox. líneas 592-606): se persiste `content.insurance.providerList` en la tabla `insurance_provider`. La lectura está en el mismo archivo (GET rates, aprox. líneas 1498-1568).
- Prueba rápida: (1) GET `?pageId=rates` y guardar el JSON. (2) Modificar en ese JSON `content.insurance.providerList` (por ejemplo un `name.en` o el orden de dos ítems). (3) PUT al mismo endpoint con ese body (y cabecera `X-API-Key` si aplica). (4) GET `?pageId=rates` de nuevo: la lista debe coincidir con lo enviado en el PUT.

### 5.2 Services

- **GET services:** La sección “Conditions” viene de `page_services` + **`page_services_condition`**.
- **PUT services:** El backend actualiza `page_services` y los datos que corresponden a `page_services_condition`. El editor debe enviar la estructura que la API espera para esa sección.

### 5.3 Contact

- **GET contact:** Todos los datos editables (hero, dirección, teléfono, horario, redes) vienen de **`page_contact`**.
- **PUT contact:** Se actualizan solo los campos en **`page_contact`**. El editor no debe leer ni escribir el contenido de Contact en `page_content`.

---

## 6. Resumen para el editor

1. **No usar `page_content`:** Ni lectura ni escritura, ni en el front ni en el editor. Es tabla legacy y será eliminada; la fuente de verdad son las tablas por página.
2. **Estructura:** Se comparte el archivo **`koxwefbs_wholeself_forms_final_03_15_26.json`** con la estructura final de la BD (estable y funcional a fecha de hoy). Las tablas que importan son las por página (page_home, page_shared_header, page_shared_footer, page_rates, page_contact, etc.); `page_content` puede aparecer en el export pero no debe usarse.
3. **Leer:** GET `/api/content.php?pageId=<pageId>`. La API lee de la tabla correspondiente al `pageId`.
4. **Escribir:** PUT al mismo endpoint con body `meta`, `seo`, `content`. La API escribe en la tabla correspondiente al `pageId`; nunca en `page_content`.
5. **Ajustes:** Rates (se puede enviar `providerList` en PUT y se persiste en `insurance_provider`). Services (alinear con `page_services` + `page_services_condition`). Contact (todo en `page_contact`; no usar `page_content`).

Con esto, el editor puede leer y escribir de forma correcta contra la base de datos actual (Banahost) y mantener la coherencia cuando se migre a Bluehost, sin tocar en ningún caso la tabla `page_content`.
