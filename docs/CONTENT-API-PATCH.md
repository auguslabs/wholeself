# PATCH parcial (merge) para Content API

Este proyecto expone contenido vía `public/api/content.php` (con `.htaccess` para rutas lindas).

## Objetivo

Evitar pérdida accidental de datos cuando el editor guarda contenido **parcial** (por ejemplo, enviar `[]` en una lista por un bug/carga incompleta).

## Endpoint

- **GET**: `GET /api/content/<pageId>?locale=en|es`
- **PUT**: `PUT /api/content/<pageId>` (cuerpo completo `{ meta, seo, content }`)
- **PATCH**: `PATCH /api/content/<pageId>` (cuerpo parcial `{ meta?, seo?, content? }`)

## Seguridad

`PUT/PATCH` requieren `X-API-Key: <CONTENT_API_KEY>` (o `Authorization: Bearer <...>`), configurado en `public/api/content_api_config.php`.

## Semántica de PATCH

- El servidor **carga el estado actual desde la BD**, hace **merge profundo** de objetos (solo en arrays asociativos) y luego persiste como un `PUT`.
- Las **listas** (arrays numéricos) se **reemplazan** solo si el patch las incluye explícitamente.
- `meta.version`:
  - Si el cliente envía `meta.version`, debe coincidir con la versión actual o el servidor responde `409 Version conflict`.
  - Si coincide, el servidor incrementa `meta.version` automáticamente.

## Ejemplos (curl)

### 1) Actualizar solo el título del hero en Services

```bash
curl -X PATCH "https://www.wholeselfnm.com/api/content/services" ^
  -H "Content-Type: application/json" ^
  -H "X-API-Key: YOUR_KEY" ^
  --data "{\"content\":{\"hero\":{\"title\":{\"en\":\"Our Services\",\"es\":\"Nuestros Servicios\"}}}}"
```

### 2) Actualizar providerList en Rates (tabla `insurance_provider`)

```bash
curl -X PATCH "https://www.wholeselfnm.com/api/content/rates" ^
  -H "Content-Type: application/json" ^
  -H "X-API-Key: YOUR_KEY" ^
  --data "{\"content\":{\"insurance\":{\"providerList\":[{\"name\":{\"en\":\"Aetna\",\"es\":\"Aetna\"},\"logoUrl\":\"/logos/aetna.svg\"}]}}}"
```

### 3) Concurrencia por versión

1) Leer versión actual:
`GET /api/content/services` → `meta.version`

2) Mandar PATCH con esa versión:

```bash
curl -X PATCH "https://www.wholeselfnm.com/api/content/services" ^
  -H "Content-Type: application/json" ^
  -H "X-API-Key: YOUR_KEY" ^
  --data "{\"meta\":{\"version\":1},\"content\":{\"intro\":{\"text\":{\"en\":\"...\",\"es\":\"...\"}}}}"
```

Si la versión no coincide: `409` con `{ currentVersion }`.

