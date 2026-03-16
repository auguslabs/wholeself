# Logos de aseguradoras (Rates — Insurance)

Todos los logos de la sección Insurance de la página Rates se sirven desde esta carpeta.

**Ruta en la API / BD:** `content.insurance.providerList[].logoUrl` = `/uploads/insurance/<archivo>.<ext>` (ej. `/uploads/insurance/aetna.svg`).

**Archivos:** Copiados desde `public/logos/insurance/` para unificar la fuente con el resto de imágenes del sitio (hero en `uploads/hero/`). El front y la migración **020** usan esta ruta.

Al hacer `npm run build`, esta carpeta se copia a `dist/uploads/insurance/`.
