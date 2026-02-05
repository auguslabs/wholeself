# Guía paso a paso: Probar la API de formularios contra tu base de datos

**Objetivo**: Verificar que la API recibe datos y los guarda en la base de datos que creaste (BanaHost u otro hosting), **antes** de conectar los formularios del sitio (Paso 7). Así aprendes el flujo y lo puedes repetir en futuros proyectos.

**Qué vas a hacer**: Ejecutar el servidor en tu computadora, configurar la conexión a tu BD remota con un archivo `.env`, y enviar una petición de prueba. Luego comprobar en phpMyAdmin que el registro se guardó.

---

## Nota para revisiones futuras: ECONNREFUSED y prueba en producción

En muchos hostings compartidos (BanaHost, Bluehost, etc.) **MySQL no acepta conexiones desde fuera del servidor**. Si en tu `.env` usas `DB_HOST=localhost` y ejecutas `npm run dev` en tu PC, la app intenta conectar a MySQL en **tu** máquina (donde no hay MySQL) y obtienes **`ECONNREFUSED`**. Aunque pongas el host remoto, el propio hosting suele bloquear conexiones remotas por seguridad.

**En ese caso**: Es normal no poder probar la API contra la BD real desde local. Puedes **validar en producción**: cuando el sitio esté desplegado en el mismo hosting que la BD, la API correrá en el servidor y usará `localhost` (o el host que proporcione el hosting) desde ahí, y la conexión sí funcionará. Sigue con el Paso 7 (conectar formularios), haz deploy, envía un formulario desde el sitio en vivo y comprueba en phpMyAdmin que el registro se guardó.

---

## Requisitos previos

- [ ] Base de datos creada en tu hosting (BanaHost, etc.) y las 4 tablas ya creadas (migración `001_create_form_tables.sql`).
- [ ] Tienes anotado: **host**, **nombre de la base de datos**, **usuario** y **contraseña** de MySQL (los usaste al crear la BD en cPanel).
- [ ] Proyecto en la rama `feature/bluehost-migration-db-forms` y dependencias instaladas (`npm install`).

---

## Paso 1 — Crear el archivo `.env` en la raíz del proyecto

1. En la **raíz** del proyecto (donde está `package.json`), crea un archivo llamado exactamente **`.env`** (con el punto al inicio).
2. **No** lo subas a Git (ya está en `.gitignore`). Solo existe en tu máquina.
3. Abre `.env` y escribe las variables de conexión a tu base de datos. Puedes usar **una de estas dos formas**:

### Opción A: Una sola variable `DATABASE_URL`

Si tu hosting te da una URL de conexión, o quieres armarla tú:

```
DATABASE_URL=mysql://USUARIO:CONTRASEÑA@HOST:3306/NOMBRE_BD
```

Sustituye:

- **USUARIO** = usuario MySQL que creaste (ej. `tuusuario_wholeself`)
- **CONTRASEÑA** = contraseña de ese usuario (cuidado: si tiene caracteres especiales como `@`, `#`, `:`, puede que tengas que usar la Opción B)
- **HOST** = normalmente `localhost` en hosting compartido; si te dieron otro, úsalo (ej. `mysql.tudominio.com`)
- **NOMBRE_BD** = nombre completo de la base de datos (ej. `tuusuario_wholeself_forms`)

Ejemplo (con valores ficticios):

```
DATABASE_URL=mysql://miusuario_ws:mipass123@localhost:3306/miusuario_wholeself_forms
```

### Opción B: Variables separadas (recomendada si la contraseña tiene símbolos raros)

```
DB_HOST=localhost
DB_USER=tu_usuario_mysql
DB_PASSWORD=tu_contraseña
DB_NAME=tu_nombre_de_la_base_de_datos
```

Ejemplo:

```
DB_HOST=localhost
DB_USER=miusuario_ws
DB_PASSWORD=mipass123
DB_NAME=miusuario_wholeself_forms
```

4. Guarda el archivo `.env`.

**Importante**: En la mayoría de hostings compartidos, el **host** es `localhost`. Si en cPanel o en el correo de bienvenida te indican otro (por ejemplo un nombre de servidor MySQL), usa ese.

---

## Paso 2 — Verificar que `.env` no se va a subir a Git

1. Abre una terminal en la raíz del proyecto.
2. Ejecuta:

   ```bash
   git status
   ```

3. En la lista de archivos **no** debe aparecer `.env`. Si aparece, no hagas `git add .env` ni lo incluyas en ningún commit. Si ya lo añadiste por error, quítalo con:

   ```bash
   git reset HEAD .env
   ```

   y asegúrate de que `.env` está en tu `.gitignore`.

---

## Paso 3 — Arrancar el servidor de desarrollo

1. En la terminal, en la raíz del proyecto, ejecuta:

   ```bash
   npm run dev
   ```

2. Espera a que diga que el servidor está listo (por ejemplo que escucha en `http://localhost:4321` o similar).
3. **Deja esa terminal abierta** (el servidor debe seguir corriendo).

---

## Paso 4 — Enviar una petición de prueba al endpoint de contacto

Vas a llamar a la API con un método POST y un JSON, como si fuera un formulario enviando nombre, email y comentario.

### Si usas PowerShell (Windows)

Abre **otra** terminal (para no cerrar el servidor) y ejecuta:

```powershell
Invoke-RestMethod -Uri "http://localhost:4321/api/forms/contact" -Method POST -ContentType "application/json" -Body '{"name":"Prueba API","email":"prueba@ejemplo.com","comment":"Este es un mensaje de prueba desde la guía."}'
```

Deberías ver en pantalla algo como: `ok : True` (o un objeto con `ok: true`).

### Si usas cmd o Git Bash (Windows) con curl

```bash
curl -X POST http://localhost:4321/api/forms/contact -H "Content-Type: application/json" -d "{\"name\":\"Prueba API\",\"email\":\"prueba@ejemplo.com\",\"comment\":\"Este es un mensaje de prueba desde la guía.\"}"
```

La respuesta esperada es algo como: `{"ok":true}`.

### Si prefieres usar el navegador (consola del desarrollador)

1. Con el servidor corriendo, abre el navegador y ve a `http://localhost:4321` (cualquier página del sitio vale).
2. Abre las herramientas de desarrollador (F12).
3. Ve a la pestaña **Consola** (Console).
4. Pega y ejecuta este código:

```javascript
fetch('/api/forms/contact', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'Prueba API',
    email: 'prueba@ejemplo.com',
    comment: 'Este es un mensaje de prueba desde la guía.'
  })
})
  .then(r => r.json())
  .then(data => console.log('Respuesta:', data))
  .catch(err => console.error('Error:', err));
```

5. En la consola deberías ver algo como: `Respuesta: { ok: true }`.

---

## Paso 5 — Revisar si hubo errores en la terminal del servidor

1. Mira la terminal donde está corriendo `npm run dev`.
2. Si la API conectó bien y guardó el dato, no debería aparecer ningún error rojo.
3. Si aparece un error (por ejemplo de conexión a MySQL, usuario o contraseña incorrectos, tabla no encontrada):
   - Copia el mensaje de error.
   - Revisa que en `.env` el **host**, **usuario**, **contraseña** y **nombre de la BD** sean exactamente los de tu hosting (sin espacios extra).
   - En muchos hostings el usuario y el nombre de la BD tienen un prefijo (ej. `miusuario_wholeself_forms`). Debe coincidir con lo que ves en cPanel → MySQL Databases.
   - Si la contraseña tiene `@`, `#`, `:`, etc., prueba usar las variables separadas (Opción B) en lugar de `DATABASE_URL`.

---

## Paso 6 — Comprobar en phpMyAdmin que el registro se guardó

1. Entra al **panel de tu hosting** (BanaHost, etc.) y abre **phpMyAdmin**.
2. En el panel izquierdo, selecciona la **base de datos** que configuraste en `.env` (ej. `wholeself_forms` o el nombre con prefijo).
3. Haz clic en la tabla **`form_contact`**.
4. Ve a la pestaña **“Examinar”** o **“Browse”**.
5. Deberías ver **una fila nueva** con:
   - `name`: Prueba API (o el nombre que hayas usado)
   - `email`: prueba@ejemplo.com (o el que hayas usado)
   - `comment`: el comentario de prueba
   - `language`: NULL (porque no lo enviaste)
   - `created_at`: fecha y hora del momento del envío

Si esa fila está ahí, **la API está recibiendo datos y guardándolos correctamente en tu BD remota**.

---

## Paso 7 — (Opcional) Probar otro endpoint

Para afianzar el concepto, puedes probar el formulario de referidos:

**PowerShell:**

```powershell
Invoke-RestMethod -Uri "http://localhost:4321/api/forms/referral" -Method POST -ContentType "application/json" -Body '{"nameCredentials":"Dr. Prueba","referralReason":"Prueba de API desde guía."}'
```

**Consola del navegador (fetch):**

```javascript
fetch('/api/forms/referral', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    nameCredentials: 'Dr. Prueba',
    referralReason: 'Prueba de API desde guía.'
  })
})
  .then(r => r.json())
  .then(data => console.log('Respuesta:', data));
```

Luego en phpMyAdmin abre la tabla **`form_referral`** y comprueba que apareció la nueva fila.

---

## Resumen del flujo (para tenerlo en cuenta en futuros proyectos)

1. **Backend (API)** lee la configuración de la BD desde **variables de entorno** (archivo `.env` en desarrollo; en el servidor, el panel del hosting o secrets).
2. **Nunca** se suben contraseñas ni URLs con credenciales al repositorio; `.env` está en `.gitignore`.
3. **Probar la API por separado** (con curl, PowerShell o fetch desde la consola) antes de conectar el frontend ayuda a aislar fallos: si esto funciona, sabes que el problema no es la conexión ni el guardado.
4. **Mismo esquema en cualquier entorno**: las mismas tablas y la misma API pueden usarse con una BD local o con una BD remota; solo cambia el `.env`.

---

## Qué hacer después de esta guía

- Si la prueba fue exitosa: sigue con el **Paso 7** del [plan de acción](plan-accion-migracion-bluehost.md) (conectar los 4 formularios del sitio a la API).
- Si algo falló: revisa el mensaje de error en la terminal del servidor y los valores de `.env`; cuando lo tengas funcionando, vuelve a hacer la comprobación en phpMyAdmin y luego continúa con el Paso 7.

**Documentos relacionados**: [Plan de acción migración Bluehost](plan-accion-migracion-bluehost.md) | [Esquema BD formularios](esquema-bd-formularios.md) | [Checklist seguridad](checklist-seguridad-secretos.md)
