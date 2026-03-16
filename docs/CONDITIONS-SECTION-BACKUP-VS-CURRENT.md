# Comparación: sección "Conditions We Support" (backup vs proyecto actual)

## Carpeta revisada
- **Backup:** `C:\0. AugusLabs\Labs\websites\wholeselfnm\Bckup-wholeself-site\dist-ws`
- **Proyecto actual:** `wholeself` (src + dist)

---

## 1. Qué pasa al hacer clic en cada botón

### En el backup (dist-ws)
- Los botones son enlaces `<a href="/services/anxiety">`, `<a href="/services/adhd">`, etc. (o con prefijo `/es/` si el idioma es español, vía `withLocalePath`).
- Al hacer clic → el navegador va a esa URL (ej. `/services/anxiety/`).
- El servidor devuelve **la página completa** de esa condición: título "Anxiety Therapy - Whole Self Counseling", hero, breadcrumb, contenido "Understanding Anxiety", navegación a otras condiciones. **Funciona bien.**

### En el proyecto actual (dist generado sin BD)
- Los botones son **los mismos**: mismos componentes (ConditionsSection, ConditionCard), mismo `href` (ej. `withLocalePath('/services/anxiety', lang)` → `/services/anxiety` o `/es/services/anxiety`).
- Al hacer clic → el navegador va a la misma URL (ej. `/services/anxiety/`).
- El servidor devuelve **solo una página de redirect**: HTML que dice "Redirecting from /services/anxiety/ to /services" y hace refresh a `/services`. **No se ve la página de la condición.**

---

## 2. Dónde está la diferencia (no está en los botones)

La diferencia **no** está en la sección de los botones (Conditions We Support):

| Aspecto | Backup | Proyecto actual |
|--------|--------|------------------|
| Componente | ConditionsSection + ConditionCard | Igual |
| Enlaces | `href={withLocalePath(link, language)}` con `link` = `/services/anxiety`, etc. | Igual |
| Origen del `link` | API/BD devuelve `condition.link` (ej. `/services/anxiety`) | Igual (API/BD o stub) |

La diferencia está en **qué HTML se generó para las rutas de cada condición** en el build:

| Archivo | Backup (dist-ws) | Proyecto actual (dist sin BD) |
|---------|-------------------|-------------------------------|
| `services/anxiety/index.html` | Página completa (título, hero, contenido, navegación) | Solo redirect a `/services` |
| `services/adhd/index.html`   | Página completa | Solo redirect |
| … (resto de condiciones)     | Página completa | Solo redirect |

En el backup, ese build se hizo **con datos de la BD** (o con stub que tenía las condiciones rellenadas), así que en cada `anxiety.astro`, `adhd.astro`, etc. la variable `currentCondition` existía y se generó la página entera. En el proyecto actual, el último build se hizo **sin BD** (stub con `conditions` vacío), así que `currentCondition` fue `undefined` y cada condición generó solo el redirect.

---

## 3. Conclusión

- **La sección de los botones (Conditions We Support) es la misma** en lógica y enlaces; no hay que cambiar nada ahí.
- **El problema es el contenido de las rutas** `/services/anxiety/`, `/services/adhd/`, etc.: en el dist actual son redirects porque el build no tuvo datos de condiciones.
- **Solución aplicada (sin depender del build con BD):** Se eliminaron las páginas estáticas `anxiety.astro`, `adhd.astro`, etc. Ahora **solo** **`services/[slug].astro`** y **`es/services/[slug].astro`** generan `/services/anxiety`, `/services/adhd`, etc. Cuando el build se hace sin BD, cada ruta sirve HTML que monta **ConditionDetailFromApi**, que en el cliente hace GET a la API y muestra la condición; **ya no hay redirect** ("Redirecting from /services/anxiety/ to /services"). Opcional: si quieres HTML pre-renderizado, haz **`npm run build:with-db`** con `DATABASE_URL` y sube el `dist/`. Ver `docs/SERVICES-CONDITIONS-SECTION-DIAGNOSTICO.md`.
