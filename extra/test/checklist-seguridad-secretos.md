# Checklist de seguridad: secretos y claves

**Usar antes de cada push y antes de abrir un PR** (especialmente en la rama de migración Bluehost).

## Regla de oro

- **Nunca** subir al repositorio: contraseñas, API keys, secret keys, URLs con credenciales, ni archivos `.env` con valores reales.

---

## Antes de cada push

- [ ] `git status` no muestra `.env`, `.env.local` ni `.env.production` como archivos a subir.
- [ ] No hay contraseñas, claves ni tokens en el código (buscar "password", "secret", "key", "token" en los archivos modificados).
- [ ] Las credenciales FTP están solo en GitHub Secrets, no en el repo.
- [ ] La reCAPTCHA **secret key** no está en el código ni en ningún archivo que se suba.
- [ ] `DATABASE_URL` (o variables de BD) no están en el código; solo en `.env` local o en la config del servidor.

---

## Dónde SÍ van los secretos

| Secreto | Dónde guardarlo |
|--------|------------------|
| FTP (Bluehost) | GitHub → Settings → Secrets and variables → Actions |
| Base de datos (MySQL) | `.env` local; en Bluehost: variables de entorno / cPanel |
| reCAPTCHA secret key | `.env` local; en servidor: variables de entorno |
| Contraseñas de admin | Hash en BD; nunca la contraseña en claro en el repo |

---

## Dónde NUNCA van

- Dentro del código fuente.
- En archivos que se suban a Git (`.env` está en `.gitignore`; verificar que no se haya hecho `git add .env`).
- En la carpeta `public/` (todo lo que está ahí es público).
- En issues, PRs, comentarios o documentación con valores reales.

---

## Si algo se subió por error

1. No hacer más push.
2. Rotar la clave/contraseña afectada (generar una nueva en el servicio correspondiente).
3. Eliminar el secreto del historial (herramientas como `git filter-branch` o BFG; si el repo es pequeño, considerar crear uno nuevo y migrar sin el commit problemático).
4. Actualizar la documentación para que el equipo use la nueva clave solo en `.env` o en GitHub Secrets.

---

**Referencia**: [Plan migración Bluehost - Sección Seguridad](plan-migracion-bluehost-formularios.md#2-seguridad-dónde-van-las-claves-y-qué-no-debe-subirse)
