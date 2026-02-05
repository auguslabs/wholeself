# Plan de acción: migración Bluehost (paso a paso)

**Uso**: Ejecutar los pasos **en orden**, uno por uno. Completar un paso, **verificar** que todo esté bien, marcar como hecho y **solo entonces** pasar al siguiente.

**Rama**: `feature/bluehost-migration-db-forms`  
**Documento de referencia**: [Plan migración Bluehost - formularios](plan-migracion-bluehost-formularios.md)

---

## Cómo usar este plan

1. Trabaja siempre en la rama `feature/bluehost-migration-db-forms`.
2. Completa **un solo paso**.
3. Revisa la sección **«Cómo verificar»** de ese paso y compruébalo.
4. Marca el paso como completado (`[x]`).
5. Haz commit si aplica (sin subir secretos; ver [checklist seguridad](checklist-seguridad-secretos.md)).
6. Pasa al siguiente paso.

---

## Paso 1 — Crear rama

- [x] **Hecho**: Rama `feature/bluehost-migration-db-forms` creada desde `main`.

**Qué hacer**:
- `git checkout main`
- `git pull origin main`
- `git checkout -b feature/bluehost-migration-db-forms`

**Cómo verificar**:
- [x] `git branch` muestra `* feature/bluehost-migration-db-forms`.
- [x] Estás trabajando en esa rama para todo lo que sigue.

---

## Paso 2 — .gitignore y .env.example

- [x] **Hecho**: `.gitignore` ignora `.env` y `.env*.local`; existe `.env.example` con nombres de variables (sin valores reales).

**Qué hacer**:
- Revisar `.gitignore`: debe tener líneas como `.env` y `.env*.local`.
- Revisar que exista `.env.example` en la raíz del proyecto con nombres de variables y valores de ejemplo (placeholders), sin claves reales.
- Si falta algo, añadirlo.

**Cómo verificar**:
- [x] `git status` no muestra `.env` aunque exista en tu disco (está ignorado).
- [x] El archivo `.env.example` existe y no contiene contraseñas ni claves reales.
- [x] Puedes hacer commit de `.env.example` sin riesgo (no tiene secretos).

---

## Paso 3 — Política de secretos documentada

- [x] **Hecho**: La política de secretos y el checklist están documentados y enlazados.

**Qué hacer** (no requiere Bluehost ni crear BD; eso es el **Paso 5**):
- Confirmar que existen y leer al menos una vez:
  - En [plan-migracion-bluehost-formularios.md](plan-migracion-bluehost-formularios.md): sección «2. Seguridad».
  - [checklist-seguridad-secretos.md](checklist-seguridad-secretos.md).

**Cómo verificar**:
- [x] Sabes dónde SÍ se guardan los secretos (`.env` local, GitHub Secrets, Bluehost).
- [x] Sabes qué NUNCA subir (código con claves, archivos `.env` con valores reales).
- [x] Usarás el checklist de seguridad antes de cada push/PR.

---

## Paso 4 — Esquema de BD y migraciones

- [x] **Hecho**: Esquema de base de datos definido para los 4 formularios; migraciones creadas y versionadas.

**Qué hacer**:
- Definir tablas (o una tabla con `form_type`) para: contacto general, referral, i-need-help, loved-one-needs-help.
- Crear scripts de migración (p. ej. SQL en `scripts/migrations/` o con un ORM) que creen esas tablas.
- Ejecutar migraciones en local para comprobar que funcionan (opcional: si tienes MySQL; si no, se ejecutan en Paso 5 en Bluehost).

**Cómo verificar**:
- [x] Existe documentación o comentarios del esquema (tablas y columnas): [esquema-bd-formularios.md](esquema-bd-formularios.md).
- [ ] Los scripts de migración se ejecutan sin error en un MySQL local o de desarrollo (o en Bluehost en Paso 5).
- [x] Las tablas definidas reflejan los campos de los 4 formularios.

---

## Paso 5 — MySQL en Bluehost / hosting (BanaHost, etc.)

- [x] **Hecho**: Base de datos y usuario MySQL creados; tablas creadas; conexión solo por variables de entorno (no en el repo).

**Qué hacer**:
- En cPanel (Bluehost, BanaHost, etc.): MySQL Databases → crear base de datos (ej. `wholeself_forms`) y usuario con permisos sobre esa BD.
- Anotar host, nombre de BD, usuario y contraseña en un lugar seguro (no en el repo).
- Ejecutar la migración `001_create_form_tables.sql` en phpMyAdmin.
- Configurar en el servidor (cuando la API esté desplegada) las variables de entorno para la conexión (ej. `DATABASE_URL` o `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`).

**Cómo verificar**:
- [x] La BD y el usuario existen en el hosting.
- [x] Las 4 tablas existen (form_contact, form_referral, form_i_need_help, form_loved_one).
- [x] Ninguna contraseña ni URL con credenciales está en el repositorio.
- [x] Tienes anotado dónde están guardadas las variables (cPanel, archivo en servidor, etc.).

---

## Paso 6 — API que recibe formularios y guarda en MySQL

- [x] **Hecho**: API implementada con Astro server endpoints que reciben los 4 formularios y persisten en MySQL.

**Qué hacer**:
- Implementar endpoints (ej. `/api/forms/contact`, `/api/forms/referral`, `/api/forms/i-need-help`, `/api/forms/loved-one-needs-help`) que reciban POST, validen y escriban en las tablas creadas en el paso 4.
- Usar variables de entorno para la conexión a la BD (nunca hardcodear).
- Decidir si la API corre en Astro (si Bluehost soporta Node) o en PHP en Bluehost.

**Implementado**:
- `src/lib/db.server.ts`: conexión MySQL (usa `DATABASE_URL` o `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`).
- `src/pages/api/forms/contact.ts` → POST `/api/forms/contact`
- `src/pages/api/forms/referral.ts` → POST `/api/forms/referral`
- `src/pages/api/forms/i-need-help.ts` → POST `/api/forms/i-need-help`
- `src/pages/api/forms/loved-one-needs-help.ts` → POST `/api/forms/loved-one-needs-help`
- Dependencia `mysql2` añadida. Conexión solo por variables de entorno.

**Cómo verificar**:
- [ ] Cada endpoint acepta POST con el payload esperado y devuelve éxito/error coherente (probar en Paso 8 con el front conectado).
- [ ] Los datos se guardan en MySQL (comprobar en BD local o en el hosting cuando esté desplegado).
- [x] No hay credenciales en el código fuente.

---

## Paso 7 — Conectar los 4 formularios del front a la API

- [x] **Hecho**: Los cuatro formularios del sitio envían datos a la API (no simulación).

**Qué hacer**:
- **ContactForm.tsx**: sustituir la simulación por `fetch` (o similar) al endpoint de contacto.
- **referral.astro**, **i-need-help.astro**, **loved-one-needs-help.astro**: que el envío del formulario haga POST al endpoint correspondiente (por `action` + `method="post"` o por JavaScript con `fetch`).

**Implementado**: ContactForm.tsx → POST `/api/forms/contact`. referral.astro, i-need-help.astro, loved-one-needs-help.astro → envío por JavaScript a sus endpoints; mensaje de éxito/error debajo del formulario. Las páginas en `/es/contact/` reutilizan el mismo componente, así que también envían a la API.

**Cómo verificar** (en producción, cuando la BD esté en el mismo servidor):
- [ ] Desde el navegador, enviar cada uno de los 4 formularios y confirmar que la petición llega a la API y se guarda en la BD.
- [ ] Mensajes de éxito/error se muestran correctamente al usuario.

---

## Paso 8 — Probar en local

- [x] **Hecho**: Pruebas en local; flujo de formularios y servidor verificados. Guardado en BD se valida en producción (Paso 10) si la BD no es accesible desde tu PC.

**Qué hacer**:
- Tener un `.env` local (copiado de `.env.example`) con valores de desarrollo (BD local o de prueba).
- Probar los 4 formularios en local: envío → API responde (éxito o error). Si la BD no es accesible desde tu máquina (ECONNREFUSED), el “guardado en BD” se comprueba en producción.
- Corregir cualquier fallo de front o de arranque antes de seguir.

**Cómo verificar**:
- [x] `npm run dev` arranca sin errores.
- [x] Los 4 formularios envían la petición (mensaje de éxito si la BD conecta; mensaje de error si no, sin romper la página).
- [x] No has subido `.env` al repo (`git status` no muestra `.env`).
- [ ] *(Opcional)* Si tienes BD local: comprobar que los datos aparecen en la BD. Si no: validar en Paso 10 en producción.

---

## Paso 9 — Deploy a Bluehost (FTP + GitHub Actions)

- [ ] **Hecho**: Deploy automático a Bluehost configurado (FTP vía GitHub Actions con secrets).

**Qué hacer**:
- Seguir [guia-deploy-bluehost.md](../planes/guia-deploy-bluehost.md).
- Crear el workflow en `.github/workflows/deploy-bluehost.yml` (a partir del `.example` si existe).
- Configurar en GitHub los secrets: `FTP_SERVER`, `FTP_USERNAME`, `FTP_PASSWORD`.
- Ajustar `server-dir` y rama que dispara el deploy (p. ej. `main` o esta rama para pruebas).
- Ejecutar el workflow y comprobar que los archivos se suben a Bluehost.

**Cómo verificar**:
- [ ] Los secrets están solo en GitHub (Settings → Secrets and variables → Actions), no en el repo.
- [ ] El workflow corre (manual o con push) y termina en éxito.
- [ ] El sitio (o la carpeta desplegada) se actualiza en Bluehost.

---

## Paso 10 — Validar en Bluehost y PR a main

- [ ] **Hecho**: Validación en el entorno de Bluehost (sin datos sensibles reales si es staging); PR a `main` abierto o merge realizado.

**Qué hacer**:
- En el sitio desplegado en Bluehost, probar los 4 formularios y que los datos se guarden en la BD de Bluehost.
- Si todo está correcto, abrir PR de `feature/bluehost-migration-db-forms` hacia `main`, revisar y hacer merge.
- Deploy a producción desde `main` (si el workflow está configurado para `main`).

**Cómo verificar**:
- [ ] En Bluehost, los formularios funcionan de punta a punta.
- [ ] No hay datos de producción sensibles usados en pruebas sin necesidad.
- [ ] PR revisado y merge a `main` (o ya mergeado).
- [ ] El sitio en producción refleja los cambios esperados.

---

## Resumen de progreso

| Paso | Descripción breve           | Estado   |
|------|----------------------------|----------|
| 1    | Crear rama                 | [x]      |
| 2    | .gitignore + .env.example  | [x]      |
| 3    | Política de secretos       | [x]      |
| 4    | Esquema BD + migraciones   | [x]      |
| 5    | MySQL en hosting (BD + tablas) | [x]      |
| 6    | API formularios → MySQL    | [x]      |
| 7    | Front → API (4 formularios)| [x]      |
| 8    | Probar en local            | [x]      |
| 9    | Deploy Bluehost (FTP/CI)   | [ ]      |
| 10   | Validar y PR a main        | [ ]      |

Cuando marques un paso como hecho, cambia el `[ ]` por `[x]` en la sección del paso y en esta tabla.

---

**Referencia**: [Plan migración Bluehost - formularios](plan-migracion-bluehost-formularios.md) | [Checklist seguridad](checklist-seguridad-secretos.md)
