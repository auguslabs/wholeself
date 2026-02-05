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
- Futuras migraciones: nombrar `002_...`, `003_...` y ejecutar en orden.

## Esquema documentado

Ver: [extra/test/esquema-bd-formularios.md](../../extra/test/esquema-bd-formularios.md)
