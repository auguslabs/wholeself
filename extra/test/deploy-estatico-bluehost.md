# Deploy estático a Bluehost (sitio + PHP para formularios)

Guía para publicar el rediseño de Whole Self NM como **sitio estático** en Bluehost y guardar los 4 formularios en **MySQL** mediante **scripts PHP**. No se usa Node.js en el servidor.

**Contexto:** Plan shared (ej. WordPress Choice Plus); Node.js no disponible en cPanel. La base de datos es la misma que en el plan con Node (mismas tablas).

---

## Checklist (orden a seguir)

- [ ] **1.** Crear base de datos y usuario MySQL en Bluehost; ejecutar el SQL de las 4 tablas.
- [ ] **2.** En el proyecto Astro: `output: 'static'`, sin adapter Node. Base raíz (`/`).
- [ ] **3.** Configurar la URL base de la API (PHP) y actualizar los formularios para que envíen a esas URLs.
- [ ] **4.** Crear en el servidor la carpeta `api/forms/` y los 4 scripts PHP + archivo de configuración de BD.
- [ ] **5.** Build: `npm run build`. Subir el contenido de `dist/` a la raíz de `public_html`.
- [ ] **6.** Probar en el navegador y envío de cada formulario.

---

## Build y subida

`npm run build` genera la carpeta `dist/`. Sube el **contenido** de `dist/` a la raíz de `public_html` (ajamoment.com, wholeselfnm.com en Bluehost, etc.).

---

## Próximos pasos — Formularios (checklist)

El sitio estático ya está en la raíz. Para que los 4 formularios guarden en MySQL:

1. **Base de datos (si aún no está):** En cPanel → MySQL® Databases: crear BD y usuario, asignar permisos. En phpMyAdmin ejecutar **`scripts/migrations/001_create_form_tables.sql`** (crea las 4 tablas).

2. **`.env` en el proyecto:** Poner la URL del sitio (donde estarán los PHP), sin barra final:
   - Producción wholeselfnm: `PUBLIC_API_BASE=https://wholeselfnm.com`
   - Prueba ajamoment: `PUBLIC_API_BASE=https://ajamoment.com`  
   Luego **`npm run build`** y volver a subir el contenido de `dist/` para que el build lleve esa URL.

3. **En el servidor (FTP o File Manager):** Crear **`public_html/api/forms/`**. Subir:
   - **`db_config.php`** con los datos reales (DB_HOST, DB_USER, DB_PASSWORD, DB_NAME).
   - Los 4 PHP: **`contact.php`**, **`referral.php`**, **`i-need-help.php`**, **`loved-one-needs-help.php`** (código completo en **Paso 4** más abajo).

4. **Probar:** En el sitio, enviar cada formulario y comprobar en phpMyAdmin que aparece una fila nueva en la tabla correspondiente.

---

## Paso 1 — Base de datos en Bluehost

1. Entra en **cPanel** de Bluehost.
2. **MySQL® Databases:** Crea una base de datos (ej. `usuario_wholeself_forms`) y un usuario con contraseña. Asigna el usuario a la base de datos con **todos los privilegios**.
3. Anota: **nombre de la BD**, **usuario**, **contraseña**. El host suele ser **localhost**.
4. Abre **phpMyAdmin** (desde cPanel) y selecciona esa base de datos.
5. Ejecuta el contenido del archivo **`scripts/migrations/001_create_form_tables.sql`** del proyecto (las 4 tablas: `form_contact`, `form_referral`, `form_i_need_help`, `form_loved_one`). Si el nombre de la BD es distinto a `wholeself_forms`, no importa; las tablas se crean en la BD que tengas seleccionada.

**Verificación:** En phpMyAdmin deben aparecer las 4 tablas.

---

## Paso 2 — Proyecto Astro: modo estático y base path

Hay que dejar de usar el adapter Node y generar solo HTML/JS/CSS.

1. Abre **`astro.config.mjs`**.
2. **Quitar** el adapter Node y la opción `output: 'server'`:
   - Elimina la línea `import node from '@astrojs/node';`.
   - Elimina la línea `adapter: node({ mode: 'standalone' }),`.
   - Cambia `output: 'server'` a **`output: 'static'`** (o elimina la línea si con `static` por defecto basta en tu versión de Astro).
3. Dejar **base** en raíz: `base: '/'` (ya está así por defecto en el proyecto). El sitio se sube a la raíz de `public_html`.
4. Opcional: eliminar o comentar en `vite` las referencias a `ssr` y `external` de `mysql2` si ya no usas servidor. Guarda el archivo.

**Build de prueba:** En la raíz del proyecto ejecuta `npm run build`. Debe generar una carpeta **`dist/`** con solo archivos estáticos (HTML, JS, CSS); no debe haber `dist/server/`.

---

## Paso 3 — URL base de la API (formularios apuntan a PHP)

Los formularios hoy envían a rutas como `/api/forms/contact`. En estático no hay servidor; deben enviar a la URL **absoluta** de los PHP en Bluehost.

1. **Definir la URL base de la API** (origen del sitio en producción). Ejemplo: `https://wholeselfnm.com` (sin barra final). Puedes usar una variable de entorno pública en Astro, por ejemplo **`PUBLIC_API_BASE`**.
   - En **`.env`** (y en `.env.production` si lo usas):  
     `PUBLIC_API_BASE=https://wholeselfnm.com`  
     (En producción será el dominio real; en desarrollo puedes dejar `http://localhost:4321` o la URL donde pruebes.)
2. **En el código de los formularios**, sustituir la URL relativa por la absoluta:
   - **`src/components/contact/ContactForm.tsx`:** Donde hace `fetch('/api/forms/contact', ...)` usar `fetch(\`${import.meta.env.PUBLIC_API_BASE}/api/forms/contact.php\`, ...)` (o una constante que lea `import.meta.env.PUBLIC_API_BASE`).
   - **`src/pages/contact/referral.astro`**, **`i-need-help.astro`**, **`loved-one-needs-help.astro`:** Donde construyen la URL del `fetch` (p. ej. `endpoint` o `form.dataset.endpoint`), usar la base pública + `/api/forms/referral.php`, `/api/forms/i-need-help.php`, `/api/forms/loved-one-needs-help.php` (o construir con `import.meta.env.PUBLIC_API_BASE`).
3. Los PHP en el servidor estarán en **`public_html/api/forms/`**, así la URL final será `https://tudominio.com/api/forms/contact.php`, etc.

**Resumen:** Un solo lugar donde se define `PUBLIC_API_BASE`; todos los formularios usan esa base + la ruta del PHP correspondiente.

---

## Paso 4 — Scripts PHP en Bluehost

Los PHP reciben el mismo **JSON** que enviaban las APIs Node (mismo cuerpo y nombres en camelCase), insertan en las tablas y devuelven `{ "ok": true }` o `{ "ok": false, "error": "..." }`.

### 4.1 Estructura en el servidor

- **`public_html/api/forms/`** — aquí van los 4 PHP.
- **Configuración de la BD:** Crear un archivo que no se sirva directamente o que esté fuera de `public_html` si el hosting lo permite. Por simplicidad, aquí se usa **`public_html/api/forms/db_config.php`** con las constantes de conexión. **Importante:** Ese archivo debe estar en un directorio protegido por `.htaccess` (deny from all) o no debe exponer datos sensibles por error; en muchos shared se deja en `api/forms/` y se evita listado de directorio.

Contenido de **`db_config.php`** (sustituir por los datos reales de Bluehost):

```php
<?php
define('DB_HOST', 'localhost');
define('DB_USER', 'tu_usuario_mysql');
define('DB_PASSWORD', 'tu_password_mysql');
define('DB_NAME', 'tu_base_datos');
```

### 4.2 Contact — `contact.php`

Recibe: `name`, `email`, `comment`, `language` (opcional).  
Responde: `Content-Type: application/json`, cuerpo `{ "ok": true }` o `{ "ok": false, "error": "..." }`.

```php
<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(204); exit; }
if ($_SERVER['REQUEST_METHOD'] !== 'POST') { echo json_encode(['ok' => false, 'error' => 'Method not allowed']); exit; }
if (strpos($_SERVER['CONTENT_TYPE'] ?? '', 'application/json') === false) { echo json_encode(['ok' => false, 'error' => 'Content-Type must be application/json']); exit; }

$raw = file_get_contents('php://input');
$data = json_decode($raw, true);
if (!is_array($data)) { echo json_encode(['ok' => false, 'error' => 'Invalid JSON']); exit; }

$name = trim($data['name'] ?? '');
$email = trim($data['email'] ?? '');
$comment = trim($data['comment'] ?? '');
$language = trim($data['language'] ?? '');
if ($name === '' || $email === '' || $comment === '') {
  echo json_encode(['ok' => false, 'error' => 'name, email and comment are required']); exit;
}
$name = substr($name, 0, 255);
$email = substr($email, 0, 255);
$language = substr($language, 0, 2);

require __DIR__ . '/db_config.php';
$conn = new mysqli(DB_HOST, DB_USER, DB_PASSWORD, DB_NAME);
if ($conn->connect_error) { echo json_encode(['ok' => false, 'error' => 'Database error']); exit; }
$conn->set_charset('utf8mb4');

$stmt = $conn->prepare('INSERT INTO form_contact (name, email, comment, language) VALUES (?, ?, ?, ?)');
$stmt->bind_param('ssss', $name, $email, $comment, $language);
if ($stmt->execute()) { echo json_encode(['ok' => true]); }
else { echo json_encode(['ok' => false, 'error' => 'Failed to save']); }
$stmt->close();
$conn->close();
```

### 4.3 Referral — `referral.php`

Recibe (camelCase como en el front): `nameCredentials`, `organization`, `phone`, `email`, `clientName`, `clientDob`, `clientContact`, `referralReason`, `preferredTherapist`, `insurance`, `additionalNotes`, `language`.  
Obligatorios: `nameCredentials`, `referralReason`.

```php
<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(204); exit; }
if ($_SERVER['REQUEST_METHOD'] !== 'POST') { echo json_encode(['ok' => false, 'error' => 'Method not allowed']); exit; }
if (strpos($_SERVER['CONTENT_TYPE'] ?? '', 'application/json') === false) { echo json_encode(['ok' => false, 'error' => 'Content-Type must be application/json']); exit; }

$raw = file_get_contents('php://input');
$data = json_decode($raw, true);
if (!is_array($data)) { echo json_encode(['ok' => false, 'error' => 'Invalid JSON']); exit; }

$name_credentials = trim($data['nameCredentials'] ?? '');
$referral_reason = trim($data['referralReason'] ?? '');
if ($name_credentials === '' || $referral_reason === '') {
  echo json_encode(['ok' => false, 'error' => 'nameCredentials and referralReason are required']); exit;
}

$organization = substr(trim($data['organization'] ?? ''), 0, 255);
$phone = substr(trim($data['phone'] ?? ''), 0, 50);
$email = substr(trim($data['email'] ?? ''), 0, 255);
$client_name = substr(trim($data['clientName'] ?? ''), 0, 255);
$client_dob = !empty($data['clientDob']) ? $data['clientDob'] : null;
$client_contact = substr(trim($data['clientContact'] ?? ''), 0, 255);
$preferred_therapist = trim($data['preferredTherapist'] ?? '');
$insurance = substr(trim($data['insurance'] ?? ''), 0, 255);
$additional_notes = trim($data['additionalNotes'] ?? '');
$language = substr(trim($data['language'] ?? ''), 0, 2);

require __DIR__ . '/db_config.php';
$conn = new mysqli(DB_HOST, DB_USER, DB_PASSWORD, DB_NAME);
if ($conn->connect_error) { echo json_encode(['ok' => false, 'error' => 'Database error']); exit; }
$conn->set_charset('utf8mb4');

$stmt = $conn->prepare('INSERT INTO form_referral (name_credentials, organization, phone, email, client_name, client_dob, client_contact, referral_reason, preferred_therapist, insurance, additional_notes, language) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
$stmt->bind_param('ssssssssssss', $name_credentials, $organization, $phone, $email, $client_name, $client_dob, $client_contact, $referral_reason, $preferred_therapist, $insurance, $additional_notes, $language);
if ($stmt->execute()) { echo json_encode(['ok' => true]); }
else { echo json_encode(['ok' => false, 'error' => 'Failed to save']); }
$stmt->close();
$conn->close();
```

### 4.4 I need help — `i-need-help.php`

Recibe: `name`, `contactMethod`, `phone`, `email`, `bestTime`, `message`, `insurance`, `preferredTherapist`, `hearAbout`, `language`. Obligatorio: `name`.

```php
<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(204); exit; }
if ($_SERVER['REQUEST_METHOD'] !== 'POST') { echo json_encode(['ok' => false, 'error' => 'Method not allowed']); exit; }
if (strpos($_SERVER['CONTENT_TYPE'] ?? '', 'application/json') === false) { echo json_encode(['ok' => false, 'error' => 'Content-Type must be application/json']); exit; }

$raw = file_get_contents('php://input');
$data = json_decode($raw, true);
if (!is_array($data)) { echo json_encode(['ok' => false, 'error' => 'Invalid JSON']); exit; }

$name = trim($data['name'] ?? '');
if ($name === '') { echo json_encode(['ok' => false, 'error' => 'name is required']); exit; }
$name = substr($name, 0, 255);
$contact_method = substr(trim($data['contactMethod'] ?? ''), 0, 50);
$phone = substr(trim($data['phone'] ?? ''), 0, 50);
$email = substr(trim($data['email'] ?? ''), 0, 255);
$best_time = substr(trim($data['bestTime'] ?? ''), 0, 50);
$message = trim($data['message'] ?? '');
$insurance = substr(trim($data['insurance'] ?? ''), 0, 255);
$preferred_therapist = substr(trim($data['preferredTherapist'] ?? ''), 0, 255);
$hear_about = substr(trim($data['hearAbout'] ?? ''), 0, 50);
$language = substr(trim($data['language'] ?? ''), 0, 2);

require __DIR__ . '/db_config.php';
$conn = new mysqli(DB_HOST, DB_USER, DB_PASSWORD, DB_NAME);
if ($conn->connect_error) { echo json_encode(['ok' => false, 'error' => 'Database error']); exit; }
$conn->set_charset('utf8mb4');

$stmt = $conn->prepare('INSERT INTO form_i_need_help (name, contact_method, phone, email, best_time, message, insurance, preferred_therapist, hear_about, language) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
$stmt->bind_param('ssssssssss', $name, $contact_method, $phone, $email, $best_time, $message, $insurance, $preferred_therapist, $hear_about, $language);
if ($stmt->execute()) { echo json_encode(['ok' => true]); }
else { echo json_encode(['ok' => false, 'error' => 'Failed to save']); }
$stmt->close();
$conn->close();
```

### 4.5 Loved one needs help — `loved-one-needs-help.php`

Recibe: `yourName`, `relationship`, `phone`, `email`, `contactMethod`, `situation`, `questions`, `howHelp`, `language`. Obligatorio: `yourName`.

```php
<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(204); exit; }
if ($_SERVER['REQUEST_METHOD'] !== 'POST') { echo json_encode(['ok' => false, 'error' => 'Method not allowed']); exit; }
if (strpos($_SERVER['CONTENT_TYPE'] ?? '', 'application/json') === false) { echo json_encode(['ok' => false, 'error' => 'Content-Type must be application/json']); exit; }

$raw = file_get_contents('php://input');
$data = json_decode($raw, true);
if (!is_array($data)) { echo json_encode(['ok' => false, 'error' => 'Invalid JSON']); exit; }

$your_name = trim($data['yourName'] ?? '');
if ($your_name === '') { echo json_encode(['ok' => false, 'error' => 'yourName is required']); exit; }
$your_name = substr($your_name, 0, 255);
$relationship = substr(trim($data['relationship'] ?? ''), 0, 50);
$phone = substr(trim($data['phone'] ?? ''), 0, 50);
$email = substr(trim($data['email'] ?? ''), 0, 255);
$contact_method = substr(trim($data['contactMethod'] ?? ''), 0, 50);
$situation = trim($data['situation'] ?? '');
$questions = trim($data['questions'] ?? '');
$how_help = trim($data['howHelp'] ?? '');
$language = substr(trim($data['language'] ?? ''), 0, 2);

require __DIR__ . '/db_config.php';
$conn = new mysqli(DB_HOST, DB_USER, DB_PASSWORD, DB_NAME);
if ($conn->connect_error) { echo json_encode(['ok' => false, 'error' => 'Database error']); exit; }
$conn->set_charset('utf8mb4');

$stmt = $conn->prepare('INSERT INTO form_loved_one (your_name, relationship, phone, email, contact_method, situation, questions, how_help, language) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)');
$stmt->bind_param('sssssssss', $your_name, $relationship, $phone, $email, $contact_method, $situation, $questions, $how_help, $language);
if ($stmt->execute()) { echo json_encode(['ok' => true]); }
else { echo json_encode(['ok' => false, 'error' => 'Failed to save']); }
$stmt->close();
$conn->close();
```

**Nota:** En `referral.php`, si `clientDob` llega como string (ej. `YYYY-MM-DD`), MySQL acepta el string en una columna DATE. Si en tu front envías otro formato, puedes convertirlo en PHP antes de bind.

---

## Paso 5 — Build y subida del sitio estático

1. En la raíz del proyecto: **`npm run build`**.
2. Por **FTP** o **File Manager** de Bluehost, sube el **contenido** de la carpeta **`dist/`** a la **raíz de `public_html`**. No subas el código fuente ni `node_modules`.
3. Comprueba que en `public_html` haya `index.html`, `_astro/`, `es/`, etc.

---

## Paso 6 — Subir los PHP y probar

1. Crear en el servidor la carpeta **`public_html/api/forms/`** (si no existe).
2. Subir **`db_config.php`** (con los datos reales de la BD) y los 4 archivos: **`contact.php`**, **`referral.php`**, **`i-need-help.php`**, **`loved-one-needs-help.php`**.
3. Probar en el navegador:
   - Sitio: `https://tudominio.com`
   - Formulario de contacto: enviar y comprobar que aparece mensaje de éxito y que en phpMyAdmin hay una fila nueva en `form_contact`.
   - Repetir para los otros tres formularios (referral, I need help, Loved one needs help).

---

## Actualizaciones futuras

- **Solo contenido/código del sitio:** `npm run build` → subir de nuevo el contenido de `dist/` a la raíz de `public_html` (reemplazar o sincronizar). No hace falta tocar los PHP ni la BD.
- **Cambiar formularios o tablas:** Ajustar los PHP y/o el SQL y volver a subir los archivos afectados.

---

## Referencias

- Migración de tablas: **`scripts/migrations/001_create_form_tables.sql`**
- Deploy con Node (BanaHost/Bluehost): **`deploy-banahost.md`** (opción estático + PHP y comparación con Netlify)
