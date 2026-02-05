# Probar con la base de datos en Bluehost

Qué cambiar según **dónde** quieras probar: en el servidor (PHP en Bluehost) o desde tu PC (Node/Astro dev contra la BD de Bluehost).

---

## Resumen rápido

| Dónde corres la app | Dónde está la BD | Qué configurar |
|---------------------|------------------|----------------|
| **PHP en Bluehost** (formularios vía PHP) | Bluehost MySQL | `db_config.php` en el servidor con `DB_HOST=localhost` y credenciales de cPanel |
| **Tu PC** (Node/Astro dev o Netlify) | Bluehost MySQL | `.env` con host/usuario/password/nombre BD de Bluehost; suele requerir **Remote MySQL** en cPanel (y a veces el hosting lo bloquea) |

---

## 1. Probar en el servidor (PHP en Bluehost, BD en Bluehost)

Es el caso normal en producción: los scripts PHP están en `public_html/api/forms/` y la BD está en el mismo Bluehost.

**Qué cambiar:**

1. En **Bluehost (cPanel)** ya tienes creada la base de datos y el usuario MySQL (y las 4 tablas con `001_create_form_tables.sql`).
2. En el **servidor**, en `public_html/api/forms/`, el archivo **`db_config.php`** (no el `.example`) debe tener los datos **reales** de esa BD:

```php
<?php
define('DB_HOST', 'localhost');   // En Bluehost, MySQL es localhost para PHP en el mismo servidor
define('DB_USER', 'tuusuario_ws'); // Usuario MySQL de cPanel (ej. koxwefbs_wsnmuser)
define('DB_PASSWORD', 'tu_password_real');
define('DB_NAME', 'tuusuario_wholeself_forms'); // Nombre completo de la BD en cPanel
```

- **DB_HOST**: en Bluehost casi siempre **`localhost`** cuando el PHP corre en el mismo servidor.
- **DB_USER**, **DB_PASSWORD**, **DB_NAME**: los que creaste en cPanel → MySQL® Databases (nombre completo de usuario y de BD, con el prefijo que te asigna Bluehost).

No hace falta cambiar nada en tu proyecto local para “probar la BD en Bluehost” en este caso: subes el sitio + los PHP con `db_config.php` bien configurado y pruebas enviando un formulario desde el sitio en vivo; luego compruebas en phpMyAdmin que se insertó el registro.

---

## 2. Probar desde tu PC (Node/Astro) contra la BD en Bluehost

Aquí quieres que **tu entorno local** (por ejemplo `npm run dev` o una API Node) se conecte a la **base de datos que está en Bluehost**.

**Qué cambiar:**

Solo la configuración de conexión en tu máquina: el archivo **`.env`** en la raíz del proyecto.

### Opción A – Variables separadas (recomendada)

```env
DB_HOST=el_host_que_te_dé_bluehost
DB_USER=tu_usuario_mysql_completo
DB_PASSWORD=tu_password_mysql
DB_NAME=tu_base_de_datos_completa
DB_PORT=3306
```

### Opción B – Una sola URL

```env
DATABASE_URL=mysql://USUARIO:PASSWORD@HOST:3306/NOMBRE_BD
```

Sustituye **HOST** por el host que Bluehost indique para **conexiones remotas** (ver abajo). El resto son el usuario, contraseña y nombre de BD de cPanel.

**Importante:** En muchos planes compartidos (incluido Bluehost), **MySQL no acepta conexiones desde fuera del servidor** por defecto. Entonces:

1. **En cPanel (Bluehost):** Busca **“Remote MySQL®”** (o “Remote MySQL”).
2. Crea un host de acceso: suele ser tu IP fija o `%` (cualquier IP; menos seguro). Sin esto, la conexión desde tu PC fallará (por ejemplo `ECONNREFUSED` o “Access denied”).
3. El **host** que uses en `.env` no es `localhost`. Suele ser algo como:
   - El nombre del servidor que te muestren en Remote MySQL, o
   - `box123.bluehost.com` (el “hostname” de tu cuenta), o
   - La IP del servidor MySQL que te indiquen.

Si Bluehost no ofrece Remote MySQL o lo tiene bloqueado, **no podrás conectar desde tu PC** a esa BD. En ese caso la forma de “probar con la BD en Bluehost” es la del apartado 1: desplegar y probar en el sitio en vivo (PHP en Bluehost → MySQL en Bluehost con `localhost`).

---

## 3. Dónde se usa cada config en este proyecto

| Archivo / entorno | Qué usa | Dónde va |
|-------------------|--------|----------|
| **PHP** (contact.php, i-need-help.php, etc.) | `db_config.php` con `DB_*` | En el servidor, en `public_html/api/forms/`. No uses `.env` para PHP en Bluehost; ahí se usa solo `db_config.php`. |
| **Node / Astro** (`src/lib/db.server.ts`) | `.env`: `DATABASE_URL` o `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `DB_PORT` | Solo en tu PC o en el entorno donde corre Node (ej. Netlify). En Bluehost estático no se ejecuta Node. |

---

## 4. Checklist “probar con BD en Bluehost”

- [ ] BD y usuario MySQL creados en cPanel; tablas creadas con `001_create_form_tables.sql`.
- [ ] **Si pruebas en el servidor (PHP):** `db_config.php` en el servidor con `DB_HOST=localhost` y credenciales reales de cPanel.
- [ ] **Si pruebas desde tu PC (Node):** `.env` con host/usuario/password/nombre BD; si el host no es el servidor, configurar Remote MySQL en cPanel y usar el host que te den (y asumir que puede estar deshabilitado en shared hosting).

---

## Referencias en el repo

- **Crear BD y tablas:** `extra/test/deploy-estatico-bluehost.md` (Paso 1).
- **Config PHP de ejemplo:** `scripts/php/db_config.example.php`.
- **Probar API desde local:** `extra/test/guia-prueba-api-formularios-bd.md` (incluye la nota de que muchos hostings no permiten conexión remota a MySQL).
