# Plan de migración a Bluehost: formularios y base de datos

**Objetivo**: Migrar el sitio a Bluehost de forma segura, sin mezclar código con lo ya funcional, empezando por la base de datos de los **cuatro formularios** de contacto. Incluye reglas de seguridad para secretos y claves.

**Documentos relacionados**:
- [Ambientes de prueba](ambientes-pruebas.md) — conceptos y configuración por ambiente
- [Bases de datos y datos de prueba](bases-datos-datos-pruebas.md) — migraciones y seeds
- [Flujo de branches y deploy](flujo-branches-deploy.md) — ramas y PRs
- [Guía deploy Bluehost](../planes/guia-deploy-bluehost.md) — FTP y GitHub Actions
- [Plan panel administración](../planes/plan-panel-administracion.md) — futuro módulo de contenido

---

## 1. Rama para el proceso de migración

Se trabaja todo en una **rama dedicada** para no tocar `main` hasta que esté validado.

| Rama sugerida | Uso |
|---------------|-----|
| `feature/bluehost-migration-db-forms` | Rama principal para: BD de formularios, env/secretos, cambios para Bluehost |

**Comandos para empezar** (desde `main` actualizado):

```bash
git checkout main
git pull origin main
git checkout -b feature/bluehost-migration-db-forms
```

**Flujo**:
1. Todo el trabajo de migración (BD formularios, API, env, deploy Bluehost) se hace en esta rama.
2. Pruebas en local y, si aplica, en un entorno de staging.
3. Cuando esté estable: PR a `main` → revisión → merge.
4. Deploy a producción desde `main` (según [guia-deploy-bluehost](../planes/guia-deploy-bluehost.md)).

No hacer merge a `main` hasta tener probado en local (y opcionalmente en staging).

---

## 2. Seguridad: dónde van las claves y qué no debe subirse

Principio: **ningún secreto ni clave real va en el repositorio**. Solo nombres de variables y ejemplos sin valor.

### 2.1 Qué es un “secreto” en este proyecto

- Credenciales FTP (usuario/contraseña de Bluehost).
- Claves de reCAPTCHA (site key puede ser pública; **secret key nunca en código/repo**).
- `DATABASE_URL` o equivalente (usuario, contraseña, host de MySQL).
- Claves de API (si en el futuro se usan).
- Contraseñas del panel de administración (hash sí; contraseña en claro no).

### 2.2 Dónde SÍ se guardan los secretos

| Lugar | Uso |
|-------|-----|
| **Archivo `.env` en tu máquina** | Desarrollo local. **No se sube a Git** (ya está en `.gitignore`). |
| **GitHub → Settings → Secrets and variables → Actions** | FTP y cualquier variable que use el workflow de deploy (ej. `FTP_SERVER`, `FTP_USERNAME`, `FTP_PASSWORD`). |
| **Bluehost / cPanel** | Variables de entorno o config de producción (DB, reCAPTCHA secret, etc.), según lo que permita el hosting. |

### 2.3 Dónde NUNCA se guardan

- Dentro del código (hardcodear contraseñas, URLs con usuario/password).
- En archivos que se suban a Git: `.env`, `.env.local`, `.env.production`, etc.
- En issues, PRs, comentarios o documentación que contenga valores reales.
- En la carpeta `public/` (todo lo que está ahí se sirve al navegador).

### 2.4 Archivo `.env.example` (sí en el repo)

Un único archivo de **ejemplo** con **nombres** de variables y valores de relleno falsos:

- Nombre: `.env.example`
- Contenido: solo nombres y ejemplos como `your_database_url_here`, `your_recaptcha_secret_here`.
- Este archivo **sí se commitea** para que el equipo sepa qué variables configurar.
- En `.gitignore` deben seguir estando: `.env`, `.env*.local` (y si quieres, `.env.production` para no subir el de prod por error).

### 2.5 Checklist de seguridad antes de cada push/PR

- [ ] No hay `.env` ni `.env.local` en el commit (`git status` y revisar que no estén staged).
- [ ] No hay contraseñas, API keys ni secret keys en el código ni en comentarios.
- [ ] Las credenciales FTP solo están en GitHub Secrets (no en el repo).
- [ ] La reCAPTCHA **secret key** solo está en `.env` local o en la config del servidor (nunca en el repo).
- [ ] `DATABASE_URL` (o equivalentes) solo en `.env` local o en variables del servidor/Bluehost.

Si algo de esto falla, **no hacer push** y corregir antes.

---

## 3. Los cuatro formularios (alcance inicial)

Formularios con los que se empieza la migración y que guardaremos en BD:

| # | Formulario | Página / componente | Tipo de datos |
|---|------------|---------------------|----------------|
| 1 | **Contacto general** | `contact.astro` → `ContactForm.tsx` | nombre, email, comentario |
| 2 | **Referral** (referidos) | `contact/referral.astro` | referidor, organización, datos del cliente, motivo, etc. |
| 3 | **I need help** | `contact/i-need-help.astro` | nombre, contacto, mensaje, seguro, cómo nos conoció, etc. |
| 4 | **Loved one needs help** | `contact/loved-one-needs-help.astro` | nombre, relación, situación, contacto, etc. |

Hoy el formulario de contacto en `ContactForm.tsx` hace una simulación de envío; los otros tres están en páginas Astro con formularios HTML. El objetivo es que **los cuatro** envíen a una API que persista en base de datos (MySQL en Bluehost).

---

## 4. Base de datos: solo formularios (Fase 1)

### 4.1 Opción de BD en Bluehost

Bluehost suele ofrecer **MySQL** (p. ej. desde cPanel → MySQL Databases). Ahí se crea:

- Una base de datos (ej. `wholeself_forms`).
- Un usuario con permisos solo sobre esa BD.
- La conexión se configura con variables de entorno en el servidor (nunca en el repo).

### 4.2 Enfoque recomendado para Fase 1

1. **Esquema**  
   Definir tablas (o una tabla por tipo de formulario) para los cuatro formularios, con campos acorde a cada uno (nombre, email, mensaje, tipo de formulario, idioma, fecha, IP si se desea, etc.).

2. **Migraciones**  
   Scripts versionados que crean/alteran tablas (por ejemplo SQL en `scripts/migrations/` o usando un ORM con migraciones). Ejecutar en local primero y luego en Bluehost cuando el entorno esté listo.

3. **Seeds**  
   Datos de prueba ficticios para desarrollo local (ver [bases-datos-datos-pruebas](bases-datos-datos-pruebas.md)). Sin datos reales de usuarios.

4. **API**  
   Endpoints (por ejemplo `/api/forms/contact`, `/api/forms/referral`, etc.) que reciban el payload del formulario, validen y escriban en MySQL. Esa API puede ser:
   - Astro server endpoints (si en Bluehost se puede ejecutar Node) o
   - Un pequeño backend en PHP en Bluehost que reciba POST y guarde en MySQL.

5. **Front**  
   En la rama `feature/bluehost-migration-db-forms`:
   - `ContactForm.tsx`: sustituir la simulación por `fetch` al endpoint de contacto.
   - Los tres formularios en `.astro`: añadir `action` o JavaScript que envíe por POST a sus respectivos endpoints.

### 4.3 Variables de entorno necesarias (Fase 1)

- `DATABASE_URL` (o `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`) para MySQL.
- `PUBLIC_API_URL` o base URL del sitio para llamar a la API desde el front (si aplica).
- reCAPTCHA: `RECAPTCHA_SECRET_KEY` (solo en servidor); la site key puede ser pública pero mejor también por variable.

Todas estas en `.env` local y en la config del servidor; **nunca** en el repo. Documentar en `.env.example`.

---

## 5. Base de datos de contenido (Fase 2 – después)

Para el módulo de administración donde el cliente edita textos:

- Una segunda base de datos (o esquema) para **contenido del sitio** (páginas, textos, etc.).
- Los JSON actuales (`src/data/content/`, etc.) pueden servir de referencia del modelo de datos y luego migrarse o sincronizarse con la BD.
- Detalle en [plan-panel-administracion](../planes/plan-panel-administracion.md).

No mezclar esta Fase 2 con la rama actual; primero cerrar Fase 1 (formularios + deploy Bluehost).

---

## 6. Orden de pasos recomendado (resumen)

**Para ejecutar paso a paso con verificaciones**: usa el **[Plan de acción: migración Bluehost](plan-accion-migracion-bluehost.md)**. Ahí están los 10 pasos con checkboxes, «Qué hacer», «Cómo verificar» y la regla: completar un paso, verificar, marcar y solo entonces pasar al siguiente.

| Paso | Acción |
|------|--------|
| 1 | Crear rama `feature/bluehost-migration-db-forms` desde `main`. |
| 2 | Revisar/ajustar `.gitignore` (`.env`, `.env*.local`) y crear `.env.example` con nombres de variables (sin valores reales). |
| 3 | Documentar en esta carpeta o en un checklist la política de secretos (usar la sección 2 y el checklist 2.5). |
| 4 | Diseñar esquema de BD para los 4 formularios y crear migraciones. |
| 5 | Configurar MySQL en Bluehost (BD + usuario) y dejar la conexión solo en variables de entorno del servidor. |
| 6 | Implementar API (Astro o PHP en Bluehost) que reciba los formularios y guarde en MySQL. |
| 7 | Conectar los 4 formularios del front a la API (ContactForm.tsx + los 3 .astro). |
| 8 | Probar en local con `.env` y BD local o de desarrollo. |
| 9 | Configurar deploy a Bluehost (FTP vía GitHub Actions con secrets; ver [guia-deploy-bluehost](../planes/guia-deploy-bluehost.md)) en la misma rama o al hacer merge. |
| 10 | Validar en staging/Bluehost (sin datos reales sensibles) y luego hacer PR a `main`. |

---

## 7. Resumen de seguridad (recordatorio)

- Rama aislada: `feature/bluehost-migration-db-forms`.
- Secretos solo en: `.env` local (no en repo), GitHub Secrets, configuración del servidor Bluehost.
- Repo: solo `.env.example` con nombres de variables y valores de ejemplo no reales.
- Antes de cada push/PR: usar el checklist de la sección 2.5.

Con esto se evita colocar claves o información delicada en el repositorio y se mantiene el código actual en `main` estable mientras se desarrolla la migración.
