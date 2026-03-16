# Lista de actividades: Deploy a Bluehost (Whole Self)

Esta es la lista para desplegar la versión actual del proyecto (build) en el servidor del cliente (Bluehost). Incluye lo que ya está hecho en el proyecto y los pasos a seguir para cada deploy.

---

## Lo que ya está hecho en el proyecto (deploy / migración a Bluehost)

- **Build estático**: Astro configurado con `output: 'static'`. El build genera `dist/` listo para hosting estático.
- **API en PHP**: Scripts PHP para formularios en `scripts/php/` y API de contenido/equipo en `public/api/` (content.php, team-members.php, upload-image.php). El contenido de `public/` se copia a `dist/` en el build.
- **Formularios + Resend**: Los formularios envían a endpoints PHP que guardan en MySQL y envían notificaciones por correo vía **Resend** (configurado en `db_config.php` en el servidor).
- **Subida de archivos**: Por ahora se usa **FileZilla** (FTP manual). GitHub sirve solo para guardar el proyecto; el workflow de deploy (`.github/workflows/deploy-bluehost.yml.example`) queda como opción futura si más adelante quieres automatizar.
- **Documentación**: `scripts/php/README.md` explica cómo desplegar los PHP de formularios y configurar `db_config.php` en el servidor.
- **.htaccess**: `public/.htaccess` define reglas para la API de contenido en Bluehost (rewrite a content.php, team-members.php, etc.).
- **Variables de entorno**: El front usa `PUBLIC_API_BASE` para apuntar al dominio donde está el sitio/API (por ejemplo el dominio en Bluehost). Para el build de producción se usa en `.env` o en GitHub Actions.

---

## Checklist para cada deploy

### 1. Preparar el build

- [ ] En la raíz del proyecto: `npm ci` (o `npm install`).
- [ ] **Build con BD (recomendado para deploy):** En `.env` pon **`DATABASE_URL`** con la URL de la BD del servidor (ej. `mysql://usuario:password@host:3306/nombre_bd`). Ejecuta **`npm run build:with-db`** (comprueba que DATABASE_URL esté configurada y luego ejecuta el build). Así se generan `dist/index.html` y las páginas completas de condiciones; al hacer clic en "Learn More" se ve el contenido, no un redirect. Si no tienes `DATABASE_URL`, usa `npm run build` (el build termina con stub y hay `index.html`), pero las rutas de condiciones quedarán en redirect.
- [ ] Revisar que `dist/` se generó correctamente (incluye `index.html` en la raíz, `api/`, assets, etc.).
- [ ] **Variable de entorno del build**: En `.env` debe estar `PUBLIC_API_BASE` con la URL final del sitio (ej. `https://www.wholeselfnm.com`). Así los formularios y la API de contenido apuntan al dominio correcto.

**Si ves 403 al entrar al sitio:** Falta `index.html` en la raíz. Ejecuta `npm run build` (o `npm run build:with-db`) y sube de nuevo todo el contenido de `dist/`.

### 2. Subir el contenido del build a Bluehost (FileZilla)

- [ ] Conectar con **FileZilla** al servidor Bluehost (datos FTP de cPanel).
- [ ] Subir **todo el contenido** de la carpeta local `dist/` a la carpeta del sitio en el servidor (ej. `public_html/` o `public_html/wholeself/` según la configuración del cliente).  
  - Subir los archivos y carpetas que hay dentro de `dist/`, no la carpeta `dist` en sí (así la raíz del sitio tendrá `index.html`, `api/`, etc.).
- [ ] Si ya existía un deploy anterior, puedes sobrescribir; o borrar el contenido anterior de esa carpeta y luego subir el nuevo.

*(En el futuro, si quieres automatizar, existe la plantilla `.github/workflows/deploy-bluehost.yml.example` para deploy vía GitHub Actions.)*

### 3. PHP de formularios en el servidor (solo cuando cambien o primera vez)

Los scripts de formularios están en `scripts/php/` y **no** van dentro de `dist/`. Se suben aparte a la carpeta de la API en el servidor:

- [ ] En el servidor, carpeta **`api/forms/`** (dentro de la misma raíz que el sitio, ej. `public_html/wholeself/api/forms/` o `public_html/api/forms/` según tu estructura):
  - [ ] Subir: `contact-form.php`, `contact.php`, `referral.php`, `i-need-help.php`, `loved-one-needs-help.php`, `send_form_notification.php`.
- [ ] En esa misma carpeta debe existir **`db_config.php`** (nunca en el repo). Si es la primera vez: copiar `db_config.example.php` → `db_config.php` y rellenar:
  - [ ] MySQL: `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`.
  - [ ] Notificaciones: `NOTIFY_EMAIL_1`, `NOTIFY_EMAIL_2`.
  - [ ] Resend: `RESEND_API_KEY`, `NOTIFY_FROM_RESEND` (ver sección Resend más abajo).
  - [ ] **Importante:** La primera línea del archivo debe ser exactamente `<?php` (sin espacio ni BOM antes). Si no, `content.php` puede devolver el contenido del archivo como texto y el botón Crisis Resources (y otras páginas desde API) fallarán con "Unexpected token '/'" al parsear JSON.
- [ ] Comprobar que las tablas de formularios existen en la BD (migraciones en `scripts/migrations/`, ej. `001_create_form_tables.sql`) y que el usuario MySQL tiene permisos de **INSERT** (y SELECT) sobre esas tablas.
- [ ] **Contenido de páginas (home, crisis-resources, etc.):** Ejecutar `scripts/migrations/004_create_page_content.sql` en la misma BD. Luego, en phpMyAdmin, ejecutar **`extra/json-to-bd/page_content_data.sql`** para cargar las filas (home, crisis-resources, services, etc.). Si no se hace, la API devolverá "Failed to load content" y el sitio usará JSON estático (funciona pero verás avisos en consola).
- [ ] **Augushub (editor que guarda contenido):** En el servidor, en la carpeta **`api/`** (junto a `content.php`), copiar **`content_api_config.sample.php`** como **`content_api_config.php`**, poner una **CONTENT_API_KEY** real y en **CONTENT_API_CORS_ORIGINS** los orígenes de augushub.com. Ver `docs/CONTENIDO-DESDE-BD-Y-AUGUSHUB-BLUEHOST.md`.

### 4. Comprobar en vivo

- [ ] Abrir el sitio en el navegador y navegar por las páginas principales.
- [ ] Si ves errores de CORS apuntando a **ajamoment.com**: el JS fue generado con la URL antigua. Haz **build de nuevo** con `PUBLIC_API_BASE=https://www.wholeselfnm.com` en `.env`, luego **vuelve a subir** el contenido de `dist/`. CORS se configura en el servidor que recibe la petición; aquí la solución es que el sitio llame a su propio dominio (mismo origen = no CORS).
- [ ] Probar al menos un formulario (contacto, referido, etc.) y verificar:
  - [ ] Que no hay error en consola y que la petición va a la URL correcta (`PUBLIC_API_BASE` + `/api/forms/...`).
  - [ ] Que llega el correo de notificación a los destinatarios configurados en `db_config.php` (y que el remitente es el esperado con la nueva cuenta de Resend si aplica).

### 5. Credenciales y cuentas (Resend – cambio a auguslabs@gmail.com)

Ver sección siguiente.

---

## Cambio de Resend a la cuenta auguslabs@gmail.com

Todo el envío y la configuración de correo de los formularios pasan a la cuenta de Resend asociada a **auguslabs@gmail.com**. No hace falta tocar código del repositorio; solo configuración en Resend y en el servidor.

### Qué cambiar

1. **En Resend (cuenta auguslabs@gmail.com)**  
   - [ ] Iniciar sesión en [resend.com](https://resend.com) con **auguslabs@gmail.com**.  
   - [ ] Crear una **API Key** (API Keys → Create). Copiar la clave (empieza por `re_`).  
   - [ ] **Remitente (“From”)**:  
     - Para **pruebas**: puedes usar `onboarding@resend.dev` (ya permitido por Resend).  
     - Para **producción** con el dominio del cliente: en Resend verifica el dominio (ej. wholeselfnm.com) y luego usa un correo de ese dominio, ej. `noreply@wholeselfnm.com` o `forms@wholeselfnm.com`.

2. **En el servidor (Bluehost) – archivo `db_config.php`**  
   El archivo está en la carpeta **`api/forms/`** del servidor (no en el repo). Ahí se definen las constantes de Resend:

   - [ ] **`RESEND_API_KEY`**: Sustituir por la nueva API Key de la cuenta auguslabs@gmail.com (la que empieza por `re_`).  
   - [ ] **`NOTIFY_FROM_RESEND`**:  
     - Si usas dominio verificado (recomendado en producción): poner ese correo, ej. `noreply@wholeselfnm.com`.  
     - Si usas solo pruebas: `onboarding@resend.dev`.

   No hace falta cambiar `NOTIFY_EMAIL_1` ni `NOTIFY_EMAIL_2` a menos que quieras que las notificaciones lleguen a otros correos; esos son los **destinatarios** del aviso. El **remitente** y la **cuenta** desde la que se envía es lo que controlas con la API Key y `NOTIFY_FROM_RESEND`.

### Resumen de variables en `db_config.php` (solo servidor)

| Variable             | Qué es                         | Acción para auguslabs@gmail.com |
|----------------------|--------------------------------|----------------------------------|
| `RESEND_API_KEY`     | API Key de Resend              | Poner la nueva key de la cuenta auguslabs@gmail.com |
| `NOTIFY_FROM_RESEND` | Correo “From” del aviso        | Dominio verificado (ej. noreply@wholeselfnm.com) o `onboarding@resend.dev` para pruebas |
| `NOTIFY_EMAIL_1`     | Destinatario 1 del aviso       | Opcional: dejar o cambiar según quién deba recibir los avisos |
| `NOTIFY_EMAIL_2`     | Destinatario 2 del aviso       | Opcional: igual que arriba |

Después de guardar `db_config.php` en el servidor, los próximos envíos de formularios saldrán ya con la cuenta auguslabs@gmail.com (vía la nueva API Key y el “From” que hayas puesto).

---

## Referencias rápidas

- **Contenido desde BD y Augushub (qué crear en Bluehost):** `docs/CONTENIDO-DESDE-BD-Y-AUGUSHUB-BLUEHOST.md` — qué es Augushub, scripts de migración y datos (`004_create_page_content.sql`, `page_content_data.sql`), y config para que el editor guarde en wholeselfnm.com (`content_api_config.php`).
- Subida: **FileZilla** (FTP). GitHub = solo guardar el proyecto.
- PHP de formularios y credenciales: `scripts/php/README.md`.
- Plantilla de configuración en servidor: `scripts/php/db_config.example.php` (Resend: `RESEND_API_KEY`, `NOTIFY_FROM_RESEND`).
- Variables de entorno del proyecto: `.env.example` (`PUBLIC_API_BASE`, etc.).
