# Guía de aprendizaje: de Home y Footer al resto de secciones

**Objetivo:** Este documento es el insumo para quien (humano o agente) vaya a implementar las **demás secciones y páginas** del sitio que leerán/escribirán en la BD. Recoge lo aprendido con Home y Footer para no repetir los mismos errores y hacer la transición lo más suave posible.

**Referencias:**  
- Patrón técnico detallado: **docs/PATRON-CONTENIDO-DESDE-BD-FRONT-Y-BACK.md**  
- Regla Cursor: **.cursor/rules/patron-contenido-bd-refresh-60s.mdc**  
- Reglas API/BD: **.cursor/rules/reglas-api-bd-contenido.mdc**, **cliente-contrato-bd-api.mdc**

---

## 1. Qué tenemos ya (Home y Footer)

- **Home:** Tabla `page_home` (2 filas: `en`, `es`). Endpoint `GET/PUT /api/content/home`. El front usa `getPageContent('home', lang)` y el componente `HomeContentFromApi` hace fetch al montar, cada 60 s y al volver a la pestaña. Los cambios del editor se ven en el sitio sin hacer build.
- **Footer:** Tabla `page_shared_footer` (2 filas: `en`, `es`). Endpoint `GET/PUT /api/content/shared-footer`. El front usa `getSharedContent('footer')` y el componente `Footer` hace el mismo patrón de refetch. Todo viene de la BD; la API normaliza títulos vacíos o `"0"` en el GET para que el front siempre muestre "Navigation", "Resources" y "Fellowship Program" cuando la BD tiene vacíos.

---

## 2. Errores que cometimos y cómo los corregimos

Usar esta lista como checklist mental al añadir una nueva sección.

| Error | Dónde | Solución |
|-------|--------|----------|
| **Variable `$str` indefinida en PHP** | content.php PUT (footer) | Las closures que usan `$str` o `$loc` deben incluirlas en el `use`: `use ($navItems, $str)`. |
| **Cadena de tipos y bind_param** | content.php PUT (footer) | La cadena de tipos (ej. `'sisss...'`) debe tener **exactamente** el mismo número de caracteres que placeholders `?` en el SQL. Contar ambos y ajustar. |
| **CORS: fetch a otro dominio** | contentService (cliente) | En el cliente **no** usar `PUBLIC_API_BASE` para contenido. Usar siempre `window.location.origin` para que el fetch vaya al mismo dominio que la página. |
| **Validación Zod falla (seo vacío)** | API GET (footer) | No devolver `seo: {}`. Siempre enviar `seo: { title: { en: '', es: '' }, description: { en: '', es: '' } }` como mínimo. |
| **Footer no se actualizaba en el sitio** | Footer.tsx | El componente debe hacer fetch en el cliente (no solo usar el dato del build). Implementar refetch al montar + cada 60 s + en `window` `focus`, y mostrar `liveData ?? initialData`. |
| **Títulos vacíos o "0" en BD** | API GET (footer) | Opción A: migración SQL que rellene `nav_title`, `resources_title`, `link4_label`. Opción B: en content.php, tras construir `$content`, normalizar esos campos si están vacíos o son `"0"` antes de `json_encode`. |
| **No ver por qué fallaba el guardado** | content.php PUT | En el `catch` del PUT, hacer `error_log('[content.php PUT] ' . $e->getMessage() . ' in ' . $e->getFile() . ':' . $e->getLine())` y devolver el mensaje en el JSON de error para depuración. |

---

## 3. Paso a paso para una nueva sección (tabla → editor + front)

Seguir este orden **sección por sección**, **tabla por tabla**, sin saltar pasos.

### 3.1 Diseño y contrato

1. Definir el **pageId** (ej. `services`, `rates`, `what-to-expect` o un bloque compartido como `shared-header`).
2. Definir el **shape del JSON** que el editor y el front usarán: `content` con qué claves (ej. `hero`, `sections`, `faqs`). Mantener nombres en **camelCase** y coherentes con el resto del sitio.
3. Documentar en el repo (o en **docs/LISTO-PARA-EDITOR-FOOTER-Y-HOME.md** u otro doc de contrato) la URL del endpoint, el shape de `content` y los campos que el editor puede editar.

### 3.2 Base de datos

1. Crear la **tabla plana** con columnas por campo (y por idioma si aplica: a veces una columna por locale, o columnas `*_en`/`*_es`). Incluir al menos `locale` (en/es) y los campos de la sección.
2. Crear la **migración SQL** (ej. `scripts/migrations/011_create_page_rates.sql`) con:
   - `CREATE TABLE IF NOT EXISTS page_<nombre> (...);`
   - `INSERT INTO ... VALUES ('en', ...), ('es', ...) ON DUPLICATE KEY UPDATE ...;` con valores por defecto razonables (nunca dejar títulos importantes vacíos si el front los muestra; usar "Section Title" / "Título" si hace falta).
3. Ejecutar la migración en la BD que usa la API (phpMyAdmin o línea de comandos). Actualizar **scripts/migrations/README.md** con una línea que describa la nueva migración.

### 3.3 API (content.php)

1. **GET** para el nuevo `pageId`:
   - Leer de la nueva tabla por `locale` (en y es).
   - Construir `meta` (pageId, lastUpdated, version), `seo` (siempre con `title` y `description`, aunque sea vacío) y `content` según el contrato.
   - Si algún campo que el front muestra como título puede venir vacío o `"0"` de la BD, **normalizar** en PHP antes de `json_encode` (como en el footer con nav_title, resources_title, link4_label).
   - Añadir un **log** opcional: `error_log('[content.php GET ' . $pageId . '] ok');` o, si se quiere más detalle, log de un campo clave por locale.
2. **PUT** para el nuevo `pageId`:
   - Recibir `{ meta, seo, content }`, validar que existan.
   - Normalizar con helpers `$loc()` y `$str()` (o equivalentes). Toda closure que use `$str`/`$loc` debe incluirlas en `use (...)`.
   - Construir el `UPDATE` con el número correcto de placeholders `?` y una cadena de tipos con **exactamente** ese mismo número de caracteres en `bind_param`.
   - En el `catch` del bloque PUT general, ya está el `error_log` y la devolución del mensaje; no quitar eso.
3. Probar GET y PUT con curl o con el editor antes de seguir al front.

### 3.4 Servicio de contenido (front)

1. Si la sección es **compartida** (varios layouts/páginas): usar o extender `getSharedContent(type)` y mapear el tipo al pageId (ej. `shared-header` → tabla correspondiente). En el cliente la URL debe usar `window.location.origin`.
2. Si es **página concreta**: usar `getPageContent(pageId, locale)`. Ya usa mismo origen en el cliente.
3. La respuesta debe validarse con `safeValidateContentPage(data)` antes de usarla. Si el esquema Zod exige `seo.title` y `seo.description`, la API ya debe enviarlos (paso 3.3).

### 3.5 Componente que muestra la sección

1. Recibir **dato inicial** por props (del SSR o build).
2. Estado para **dato vivo**: `const [liveData, setLiveData] = useState<ContentPage | null>(null)`.
3. **Función de fetch** (useCallback) que llame a `getPageContent(pageId, lang)` o `getSharedContent(...)`, y en éxito haga `setLiveData(data)`.
4. **useEffect 1:** al montar ejecutar el fetch y programar `setInterval(fetchFn, 60_000)`; en el cleanup hacer `clearInterval`.
5. **useEffect 2:** `window.addEventListener('focus', fetchFn)` y en el cleanup `removeEventListener`.
6. Renderizar con **`const data = liveData ?? initialData`** y derivar `content` y el resto de `data`. No usar fallbacks de copy (títulos o textos inventados); si algo viene vacío, mostrarlo vacío o asegurar que la BD/API envíe el valor por defecto (migración o normalización en API).

### 3.6 Documentación y reglas

1. Actualizar el doc de contrato para el editor (URL del nuevo endpoint, shape de `content`).
2. Tener en cuenta las reglas en **.cursor/rules/patron-contenido-bd-refresh-60s.mdc** y **reglas-api-bd-contenido.mdc** en cada cambio.

---

## 4. Checklist antes de dar por cerrada una nueva sección

- [ ] Migración creada y ejecutada; tabla con filas en/es y datos por defecto coherentes.
- [ ] GET devuelve `meta`, `seo` (con title y description), `content` sin `seo: {}`.
- [ ] PUT: closures con `use ($str)`/`use ($loc)` donde haga falta; cuenta de `bind_param` correcta.
- [ ] Cliente: fetch con `window.location.origin` (no `PUBLIC_API_BASE` para contenido).
- [ ] Componente: fetch al montar + cada 60 s + en `focus`; estado liveData; render con liveData ?? initialData.
- [ ] Sin fallbacks de copy en el front; datos visibles vienen de la BD (o de la normalización en la API).
- [ ] Editor puede leer (GET) y guardar (PUT) y los cambios se ven en el sitio tras recargar o en los siguientes 60 s.
- [ ] Logs en content.php: al menos el catch del PUT registra el error; opcionalmente un log en GET por pageId para trazabilidad.

---

## 5. Logging (módulo de log) para detectar errores rápido

- **Ya existente en content.php:**
  - En el `catch` del PUT: `error_log('[content.php PUT] ' . $e->getMessage() . ' in ' . $e->getFile() . ':' . $e->getLine());` y respuesta JSON con el mensaje.
  - Opcional: en GET/PUT de `shared-footer` (y se puede replicar en otros pageId): `error_log('[content.php GET shared-footer] ...');` con un campo clave.
- **Para cada nueva sección (recomendado):**
  - **GET:** Tras construir el JSON, una línea: `error_log('[content.php GET ' . $pageId . '] ok');`. Si se quiere depurar un campo concreto, añadir algo como `' field_x=' . json_encode($content['field_x'])`.
  - **PUT:** Dentro del bloque del nuevo pageId, antes del `bind_param` o del `execute`, opcional: `error_log('[content.php PUT ' . $pageId . ']');`. No hace falta loguear todo el body; con el `catch` ya se ve el error si algo falla.
- Mantener el **mismo prefijo** `[content.php GET ...]` / `[content.php PUT ...]` para poder filtrar en el log del servidor (ej. `grep "content.php" error_log`).

Con esto, cualquier agente o desarrollador que implemente una nueva sección tiene el paso a paso y la lista de errores a evitar, alineado con lo que ya hicimos en Home y Footer.
