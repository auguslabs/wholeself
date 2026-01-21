# Resumen: Traduccion de Home (primer idioma)

## Objetivo
Tener la pagina Home con contenido en ingles por defecto y version en espanol en `/es/`, usando JSON por idioma y manteniendo la estructura preparada para migracion futura a base de datos.

## Resultado final
- `"/"` muestra Home en ingles.
- `"/es/"` muestra Home en espanol.
- El logo y los links del header/footer respetan el idioma actual.
- Se eliminan caches en desarrollo para ver cambios en JSON inmediatamente.

## Paso a paso (resumen)
1. Separacion de contenido por idioma para Home.
2. Creacion de rutas por idioma en Astro (`/es/`).
3. Deteccion de idioma por URL.
4. Ajuste de componentes para recibir idioma y rutas con prefijo.
5. Ajuste de cache de JSON en desarrollo.

## Archivos creados
- `src/data/content/en/pages/home.json`
- `src/data/content/es/pages/home.json`
- `src/pages/[lang]/index.astro`
- `src/utils/i18n.ts`
- `extra/traduccion/guia-proceso-traduccion-sitio.md` (guia general)

## Archivos modificados
- `src/pages/index.astro`
  - Ahora carga Home por idioma con `getPageContent('home', lang)`
  - Usa `getLocaleFromPath()` para detectar idioma
  - Pasa `lang` y `ctaSection` al componente de CTA

- `src/components/home/CTASection.astro`
  - Deja de cargar JSON internamente
  - Recibe `ctaSection` y `lang` por props

- `src/data/services/contentService.ts`
  - Se agrega soporte de `locale` al cargar paginas
  - Se deshabilita cache en desarrollo (`import.meta.env.DEV`)

- `src/data/models/ContentPage.ts`
  - `LocalizedText` ahora acepta string o `{ en, es }`
  - `getLocalizedText` soporta ambos formatos

- `src/data/validators/contentSchemas.ts`
  - `LocalizedTextSchema` acepta string o `{ en, es }`

- `src/layouts/BaseLayout.astro`
  - Idioma detectado por URL
  - `<html lang>` usa idioma real
  - Pasa `initialPath` al `Header`
  - Pasa `language` al `Footer`

- `src/components/layout/Header.tsx`
  - Deteccion de idioma por ruta
  - Logo apunta a `"/"` o `"/es/"`
  - Menu cambia labels segun idioma
  - Links se construyen con prefijo `/es` cuando aplica
  - Crisis Resources carga JSON por idioma

- `src/components/layout/Footer.tsx`
  - Links con prefijo `/es` cuando aplica
  - Labels con texto en espanol cuando el idioma es `es`

## Logica implementada
### Estructura general
1. **Ruta** define idioma:
   - `/` = ingles
   - `/es/` = espanol
2. **Loader** de contenido por idioma:
   - `getPageContent('home', 'en' | 'es')`
3. **Componentes** reciben `lang` y construyen links con prefijo.

### Algoritmo (resumen)
1. Detectar idioma con `getLocaleFromPath(pathname)`.
2. Cargar JSON segun idioma:
   - `../content/en/pages/home.json`
   - `../content/es/pages/home.json`
3. Renderizar Home y UI en ese idioma.
4. Generar rutas `/es/` con `getStaticPaths()`.

## Nuevas funciones / helpers
- `getLocaleFromPath(pathname)` en `src/utils/i18n.ts`
  - Extrae idioma desde la URL
  - Fallback a ingles si no hay prefijo

## Caracteristicas tecnicas usadas
- **Astro dynamic routes**: `src/pages/[lang]/index.astro`
- **getStaticPaths** para rutas estaticas de idioma
- **JSON por idioma** para contenido largo
- **Fallback de idioma** en links y UI
- **Cache desactivado en dev** para ver cambios sin reiniciar

## Por que es la mejor opcion
- Escala a mas idiomas sin inflar un solo JSON.
- Facil migracion futura a base de datos (mismo esquema por idioma).
- Evita mezclar `en/es` en cada campo de contenido.
- Rutas limpias: default ingles en `/`, espanol en `/es/`.
- UX consistente: menu y footer se mantienen en el idioma actual.

## Nota operacional
Para ver cambios en JSON:
- Abrir `/es/`
- Si no actualiza, recargar duro o reiniciar `npm run dev`
