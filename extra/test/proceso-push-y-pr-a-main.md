# Proceso: enviar cambios a GitHub y hacer PR a main

Flujo para subir tu trabajo actual a GitHub y abrir un Pull Request contra `main`.

---

## Antes de empezar

- [ ] No tengas credenciales en lo que vas a subir: `.env`, `db_config.php` están en `.gitignore`; no los añadas.
- [ ] Revisa qué archivos vas a commitear: `git status` y, si hace falta, `git diff`.

---

## Paso 1 — Decidir la rama

**Si ya trabajaste en una rama (ej. `feature/...`):**  
Sigue en esa rama y usa su nombre en el push.

**Si estás en `main` y quieres dejar main limpio:**  
Crea una rama nueva con tus cambios antes de hacer commit:

```bash
git checkout -b feature/form-success-modal-y-docs
```

(Puedes usar otro nombre: `feature/deploy-rsync-docs`, `feature/bluehost-bd-docs`, etc.)

---

## Paso 2 — Añadir y commitear

```bash
# Ver qué está modificado/nuevo
git status

# Añadir todo lo que quieras subir (o archivos concretos)
git add .

# O solo archivos concretos, por ejemplo:
# git add src/components/contact/FormSuccessModal.tsx
# git add extra/test/probar-bd-bluehost.md extra/test/deploy-solo-cambios-rsync.md

# Commit con mensaje claro
git commit -m "feat: modal éxito formularios, docs deploy rsync y BD Bluehost"
```

Ajusta el mensaje a lo que hayas cambiado (formularios, docs, etc.).

---

## Paso 3 — Subir la rama a GitHub

Si la rama es **nueva** en el remoto:

```bash
git push -u origin feature/form-success-modal-y-docs
```

(Sustituye `feature/form-success-modal-y-docs` por el nombre de tu rama.)

Si la rama **ya existe** en GitHub y solo añades commits:

```bash
git push
```

---

## Paso 4 — Abrir el Pull Request (PR) a main

1. Entra en el repositorio en **GitHub** (ej. `https://github.com/tu-org/wholeself`).
2. Suele aparecer un aviso amarillo: **“Compare & pull request”** para la rama que acabas de subir. Haz clic ahí.
3. Si no aparece:
   - Clic en **Branches**.
   - Al lado de tu rama, botón **“New pull request”**.
4. En el PR:
   - **Base:** `main`.
   - **Compare:** tu rama (ej. `feature/form-success-modal-y-docs`).
   - Título y descripción: qué incluye el PR (modal de éxito, docs de deploy/rsync, docs de BD Bluehost, etc.).
5. Clic en **“Create pull request”**.

---

## Paso 5 — Después del PR

- Revisión (si alguien más revisa): responder comentarios y hacer nuevos commits en la misma rama; se actualiza el PR solo con `git push`.
- Cuando esté listo: en GitHub, **“Merge pull request”** (merge a `main`).
- Opcional: borrar la rama en GitHub después del merge.
- En local, volver a `main` y actualizar:

```bash
git checkout main
git pull origin main
```

---

## Resumen rápido (comandos seguidos)

```bash
# 1. Rama (si creas una nueva)
git checkout -b feature/mi-cambio

# 2. Commit
git add .
git commit -m "feat: descripción breve de los cambios"

# 3. Push
git push -u origin feature/mi-cambio

# 4. En GitHub: New pull request → base: main, compare: feature/mi-cambio → Create pull request
# 5. Tras el merge: git checkout main && git pull origin main
```

---

## Referencias en el repo

- Flujo de ramas y deploy: `extra/test/flujo-branches-deploy.md`
- Archivos que no deben subirse: `.gitignore` (`.env`, `db_config.php`, `dist/`, etc.)
