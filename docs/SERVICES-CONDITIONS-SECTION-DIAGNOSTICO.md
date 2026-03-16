# Diagnóstico: sección "Conditions We Support" no se ve

**Resumen:** Este doc describe por qué a veces no se ve la sección de condiciones ni las tarjetas de servicios, y por qué al hacer clic en una condición puede salir el error `Cannot read properties of null (reading 'link')`. **Ya está resuelto en código**; si vuelve a pasar, suele ser build/deploy antiguo o API que no usa la misma BD.

---

## 0. Lo que ya está resuelto en el código (no tocar si vuelve el error)

- **Error "Cannot read properties of null (reading 'link')":** La API a veces devuelve `content.ctaSection.secondaryCTA` como `null`. En **`ServicesCTA.tsx`** el bloque del CTA secundario solo se renderiza si `secondaryCTA` existe y tiene `link`/`href`; si es `null`, no se pinta y no hay crash. También se filtra `primaryCTAs` para quitar ítems null.
- **Conditions:** En **`ConditionsSection.tsx`** se filtran ítems null antes de usar `condition.link`.
- **Categorías sin tarjetas:** En **`ServicesGrid.tsx`** y **`ServiceCategory.tsx`** se defiende contra `categories` o `services` vacíos/null.
- **Páginas de condición (anxiety, adhd, etc.):** Se eliminaron las páginas estáticas `anxiety.astro`, `adhd.astro`, etc. Solo existen las rutas dinámicas **`services/[slug].astro`** y **`es/services/[slug].astro`**. Si en el build no hay datos de BD, se genera HTML que monta **ConditionDetailFromApi**, que en el cliente hace GET a la API y muestra la condición; **ya no hay redirect estático** ("Redirecting from /services/anxiety/ to /services"). Si quieres HTML pre-renderizado para cada condición, haz build con BD (`npm run build:with-db`).

**Si el error o el contenido roto vuelven a aparecer:** casi siempre es porque el **sitio en producción está sirviendo un build antiguo** (antes de estos cambios). Hay que volver a hacer **build** y **subir el nuevo `dist/`** al servidor.

---

## 1. Confirmar que la BD tiene los datos

Ya comprobaste el export de `page_services`: las filas `en` y `es` tienen `conditions_section_json` con título, subtítulo y 7 condiciones. **La BD está bien.**

## 2. Comprobar qué devuelve la API que usa el sitio

El front hace fetch a la **misma base URL** del sitio. Por ejemplo:

- Si entras a `https://tudominio.com/services`, el fetch es a  
  `https://tudominio.com/api/content/services?locale=en&_t=...`

Abre en el navegador **exactamente** esa URL (puedes quitar `&_t=...`):

```
https://TU-DOMINIO/api/content/services?locale=en
```

(Reemplaza `TU-DOMINIO` por el dominio real, ej. `ajamoment.com`.)

En la respuesta JSON, revisa:

- ¿Existe `content.conditionsSection`?
- ¿`content.conditionsSection.conditions` es un array con 7 ítems?

- **Si SÍ** tiene `conditionsSection` con 7 condiciones → el fallo está en el front (caché del build, otro componente, etc.).
- **Si NO** o viene vacío → la API está leyendo de **otra base de datos** o hay caché en el servidor. Hay que ejecutar la migración **023** en la **misma BD** a la que apunta `content.php` en ese servidor y, si aplica, limpiar caché (PHP opcache, CDN, etc.).

## 3. Misma BD para migración y API

La migración 023 debe ejecutarse en la **misma base de datos** que usa `public/api/content.php` en el entorno donde cargas la página (producción, staging, etc.). Si la API está en otro servidor o usa otro usuario/BD, los datos que ves en phpMyAdmin (export) pueden ser de otra BD y por eso la API sigue devolviendo vacío.

## 4. Tras cambiar la BD

- Ejecutar **023** en esa BD.
- Si el servidor usa opcache u otro caché de PHP, reiniciar PHP o el servidor web.
- Hard refresh en el navegador (Ctrl+Shift+R) o abrir la URL del paso 2 en una pestaña de incógnito.

## 5. Resumen

| Comprobación                         | Acción |
|--------------------------------------|--------|
| Export de `page_services` con datos | Ya OK |
| API devuelve `conditionsSection` con 7 ítems | Si no: ejecutar 023 en la BD que usa la API y revisar caché |
| API devuelve datos pero la página no muestra la sección | Revisar consola del navegador (errores/JS) y volver a hacer build/deploy del front |

---

## 6. Por qué puede volver a pasar (y qué revisar)

| Síntoma | Causa habitual | Qué hacer |
|--------|----------------|-----------|
| Sigue saliendo `Cannot read properties of null (reading 'link')` en consola | El **dist desplegado** es de un build anterior (sin el fix de ServicesCTA). | Hacer **build de nuevo** en el repo actual (`npm run build` o `npm run build:with-db`) y **volver a desplegar** todo el contenido de `dist/`. |
| Solo se ven los títulos de categoría (Evaluation & Consultation, etc.) sin tarjetas | La API devuelve **`content.categories` vacío o sin `services`**. | Comprobar GET `https://tudominio.com/api/content/services`: que `content.categories` (o `content.services` como fallback) tenga categorías con `title` y `services[]`. **ServicesContentFromApi** usa `content.services` como categorías si `content.categories` viene vacío. |
| Al hacer clic en una condición va a redirect o "Redirecting..." | Antes: páginas estáticas `anxiety.astro` etc. hacían `Astro.redirect` cuando no había datos en build. | **Solución aplicada:** se eliminaron esas páginas. Solo **`[slug].astro`** genera `/services/anxiety`, etc.; cuando no hay datos en build se sirve **ConditionDetailFromApi**, que carga desde la API en el cliente (sin redirect). Si sigue pasando, desplegar el `dist/` nuevo. |

**Checklist rápido cuando “vuelve” el problema:** (1) ¿El código actual tiene los fixes en ServicesCTA/ConditionsSection/ServicesGrid? (2) ¿Se hizo build después de esos cambios? (3) ¿Se desplegó ese build nuevo (dist/) al servidor donde se ve el fallo?
