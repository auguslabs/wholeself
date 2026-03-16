# Imágenes hero (Home, Services, Rates, About)

**Todas** las imágenes de fondo del hero deben vivir **aquí**, con estos nombres fijos. Así el build, la BD y el editor usan la misma ruta y no hay 404 ni conflictos.

Todas las imágenes del sitio (hero y logos de insurance) usan la misma base **`/uploads/`**: hero en `uploads/hero/`, logos de aseguradoras en `uploads/insurance/`.

---

## Dónde quedan las imágenes

| Página   | Nombre de archivo | Ruta en la BD / API   |
|----------|-------------------|------------------------|
| Home     | `home.webp`       | `/uploads/hero/home.webp` |
| Services | `services.webp`   | `/uploads/hero/services.webp` |
| Rates    | `rates.webp`      | `/uploads/hero/rates.webp` |
| About    | `about.webp`      | `/uploads/hero/about.webp` |

- **En local / repo:** `public/uploads/hero/<nombre>.webp`
- **En el servidor (después del deploy):** misma ruta respecto a la raíz del sitio, p. ej. `public_html/uploads/hero/<nombre>.webp`

---

## Build (npm run build)

Astro copia todo `public/` a `dist/`. Si los archivos están en `public/uploads/hero/`, en el servidor quedarán en `dist/uploads/hero/` y las URLs `/uploads/hero/...` funcionarán.

Si tienes una imagen en otra parte de `public/` (p. ej. `public/banner-services.webp` o `public/banner-rates.webp`), **cópiala aquí** con el nombre correcto (`services.webp`, `rates.webp`, etc.).

---

## Editor (Augushub) – cambiar o ajustar la imagen

Cuando alguien sube o cambia la imagen del hero desde el editor:

1. El editor llama a **POST /api/upload-image** con el slot (`home-hero`, `services-hero`, `rates-hero`, `about-hero`).
2. El script **`public/api/upload-image.php`** guarda el archivo en **esta misma carpeta** en el servidor: `api/../uploads/hero/` = `uploads/hero/` (mismo sitio que usa el build).
3. La API devuelve la ruta `/uploads/hero/<nombre>.webp` y se guarda en la BD.

Así, tanto el deploy estático como las subidas del editor usan **el mismo directorio** (`uploads/hero/`). No hay dos sitios distintos para las imágenes; el editor no dará problemas siempre que en la BD las rutas sean `/uploads/hero/...`.

---

## Normalización (Home, Rates, Services)

Las rutas están unificadas en **`/uploads/hero/home.webp`**, **`/uploads/hero/rates.webp`**, **`/uploads/hero/services.webp`**. En el repo, los archivos están en `public/uploads/hero/` con esos nombres. Para que la BD use estas rutas, ejecuta la migración **`scripts/migrations/019_normalize_hero_images_routes.sql`** en la misma BD que usa `public/api/content.php`.
