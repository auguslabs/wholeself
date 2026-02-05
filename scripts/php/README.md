# Scripts PHP para formularios (Bluehost / cPanel)

Estos PHP reciben el JSON de los 4 formularios del sitio estático, insertan en MySQL y responden `{ "ok": true }` o `{ "ok": false, "error": "..." }`.

## Dónde se guardan las credenciales

- **En el repositorio (GitHub)** solo hay:
  - **`db_config.example.php`** — plantilla con placeholders (`TU_USUARIO_MYSQL`, etc.). Sin datos reales.
  - Los 4 archivos **`contact.php`**, **`referral.php`**, **`i-need-help.php`**, **`loved-one-needs-help.php`** — no contienen contraseñas.

- **`db_config.php`** (con credenciales reales):
  - **No está en el repo.** Está en **`.gitignore`** (`scripts/php/db_config.php`).
  - Solo existe **en el servidor**: lo creas tú al subir los PHP (copiando la plantilla y rellenando con los datos de cPanel).
  - Si por error creas `db_config.php` en tu máquina local, Git no lo subirá gracias al `.gitignore`.

## Cómo mantener la integridad

1. **Nunca** quitar `scripts/php/db_config.php` del `.gitignore`.
2. **Nunca** hacer commit de un archivo que contenga contraseñas o datos reales de BD.
3. En el servidor, crear `db_config.php` solo ahí: copiar `db_config.example.php` → `db_config.php` y reemplazar los valores con los de cPanel (MySQL).
4. Opcional en el servidor: en `public_html/api/forms/` puedes añadir un `.htaccess` que impida listar el directorio, para que nadie vea la lista de archivos (el PHP en sí no expone el contenido de `db_config.php`).

## Despliegue en el servidor (ej. ajamoment.com)

1. En el servidor, crea la carpeta **`public_html/api/forms/`** (por FTP o File Manager).
2. Sube los 4 archivos: **`contact.php`**, **`referral.php`**, **`i-need-help.php`**, **`loved-one-needs-help.php`**.
3. Copia **`db_config.example.php`** como **`db_config.php`** en esa misma carpeta (o créalo a mano con el mismo contenido).
4. Edita **`db_config.php`** en el servidor y sustituye:
   - `TU_USUARIO_MYSQL` → usuario MySQL de cPanel
   - `TU_PASSWORD_MYSQL` → contraseña del usuario
   - `TU_BASE_DE_DATOS` → nombre de la base de datos
   - `localhost` suele quedarse igual.
5. Asegúrate de haber ejecutado antes el SQL de las tablas: **`scripts/migrations/001_create_form_tables.sql`** en esa BD.
6. **Permisos del usuario MySQL:** el usuario que usas en `db_config.php` debe tener permisos para escribir en la BD. En cPanel → MySQL® Databases → el usuario debe tener asignada la base de datos con permisos **ALL PRIVILEGES** (o al menos **SELECT** e **INSERT** sobre las tablas `form_contact`, `form_referral`, `form_i_need_help`, `form_loved_one`). Si el usuario solo tiene permisos de lectura, los formularios devolverán error al enviar (por ejemplo "DB save: ..." o "Access denied"); al dar los permisos correctos, los PHP podrán insertar sin problema.

En el proyecto Astro, en **`.env`** pon `PUBLIC_API_BASE=https://ajamoment.com` (o el dominio que uses), haz **`npm run build`** y sube el `dist/` para que los formularios apunten a `https://ajamoment.com/api/forms/contact.php`, etc.
