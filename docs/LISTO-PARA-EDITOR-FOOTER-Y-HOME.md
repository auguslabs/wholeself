# Listo para el editor — Footer y Home desde BD

**Para:** equipo del editor (Augushub)  
**De:** cliente WholeSelf  
**Objetivo:** Comunicar que el backend está listo para que el editor **lea y escriba** el contenido del **Footer** y de la **Home** desde la API. Los datos se sirven desde tablas planas en BD; el sitio público ya los consume.

---

## 1. Estamos listos

- La **Home** se lee y escribe en la tabla **`page_home`** (2 filas: `en`, `es`).  
  Endpoint: **`GET` / `PUT`** `https://<dominio-del-sitio>/api/content/home`

- El **Footer compartido** se lee y escribe en la tabla **`page_shared_footer`** (2 filas: `en`, `es`).  
  Endpoint: **`GET` / `PUT`** `https://<dominio-del-sitio>/api/content/shared-footer`

- El sitio público ya consume estos endpoints: lo que el editor guarde (PUT) se verá al recargar (o al refetch del cliente).

---

## 2. Lo que necesitamos del editor

1. **Configurar para este sitio**
   - **URL base de la API:** `https://www.wholeselfnm.com` (o el dominio donde esté desplegado el sitio). Sin barra final.
   - **URL completa por página:**
     - Home: `https://www.wholeselfnm.com/api/content/home`
     - Footer: `https://www.wholeselfnm.com/api/content/shared-footer`
   - **Clave API:** la misma que esté definida en el servidor en `content_api_config.php` → `CONTENT_API_KEY`. Enviarla en **cada PUT** en el header **`X-API-Key`**.

2. **Leer (GET)**
   - Para cargar el contenido editable: **GET** a la URL de la página (ej. `GET .../api/content/shared-footer`).
   - La respuesta es **`{ meta, seo, content }`**. Usar exactamente esa estructura para rellenar el formulario del editor y, al guardar, enviarla de vuelta en el PUT.

3. **Escribir (PUT)**
   - Al guardar: **PUT** a la **misma URL** (ej. `PUT .../api/content/shared-footer`) con:
     - **Headers:** `Content-Type: application/json`, `X-API-Key: <clave>`
     - **Body:** el mismo JSON que se usa para el GET: `{ meta, seo, content }`
   - Respuesta esperada: **200** y **`{ "ok": true }`**.

---

## 3. Forma del contenido (qué esperar y qué enviar)

### Home (`pageId=home`)

- **GET** devuelve (entre otros):  
  `content.hero` (headline, description, backgroundImage, backgroundImageAlt),  
  `content.valuePropositions.items`,  
  `content.ctaSection.ctas` (array de 3 ítems con id, title, description, link, icon).  
- **PUT:** enviar el mismo shape. Los campos `id`, `link`, `icon` en cada CTA deben ser **string** (no objeto `{ en, es }`).

### Footer (`pageId=shared-footer`)

- **GET** devuelve:
  - `content.companyInfo`: `{ name: { en, es }, tagline: { en, es } }`
  - `content.navigation`: `{ title: { en, es }, items: [ { label: { en, es }, link: string }, ... ] }` (6 ítems)
  - `content.resources`: `{ title: { en, es }, items: [ { label: { en, es }, link: string, isModal: boolean }, ... ] }` (6 ítems)
  - `content.copyright`: `{ en, es }`

- **PUT:** enviar el mismo shape.  
  - `navigation.items` y `resources.items`: arrays de 6 elementos; los que no se usen pueden tener `label` vacío y `link` vacío; en resources, `isModal` 0 o 1.

---

## 4. Pruebas rápidas (curl)

**Leer footer:**
```bash
curl -s "https://www.wholeselfnm.com/api/content/shared-footer"
```

**Guardar footer (reemplazar CLAVE por la clave real):**
```bash
curl -X PUT "https://www.wholeselfnm.com/api/content/shared-footer" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: CLAVE" \
  -d '{"meta":{"pageId":"shared-footer","lastUpdated":"2025-03-01T12:00:00Z","version":1},"seo":{},"content":{"companyInfo":{"name":{"en":"WholeSelf Counseling","es":""},"tagline":{"en":"A safe space for your healing journey","es":""}},"navigation":{"title":{"en":"Navigation","es":""},"items":[{"label":{"en":"Home","es":""},"link":"/"},{"label":{"en":"Services","es":""},"link":"/services"},{},{},{},{}]},"resources":{"title":{"en":"Resources","es":""},"items":[{"label":{"en":"Crisis Resources","es":""},"link":"#", "isModal":true},{},{},{},{},{}]},"copyright":{"en":"All rights reserved","es":""}}}'
```

Tras el PUT, un **GET** de nuevo debe devolver los datos guardados.

---

## 5. Resumen para el editor

| Qué | Detalle |
|-----|---------|
| **Estado** | Backend listo: Home y Footer se leen y escriben en BD (tablas `page_home`, `page_shared_footer`). |
| **URL base** | `https://www.wholeselfnm.com` (o el dominio del sitio). |
| **Page IDs** | `home`, `shared-footer`. |
| **Leer** | GET `{base}/api/content/{pageId}` → devuelve `{ meta, seo, content }`. |
| **Escribir** | PUT a la misma URL, header `X-API-Key`, body `{ meta, seo, content }` → 200 + `{ "ok": true }`. |
| **Qué necesitamos** | Que el editor tenga configurada la URL base y la clave API para este sitio, y que al abrir Footer/Home haga GET y al guardar haga PUT con el shape indicado. |

Cualquier duda sobre el shape exacto de `content` para una página: hacer un GET a esa página y usar ese JSON como referencia para el formulario y para el PUT.

---

## 6. Cómo comprobar que todo está bien (tras subir con FileZilla)

Sustituye `https://www.wholeselfnm.com` por tu dominio si es otro.

### Paso 1 — API devuelve datos (sin errores)

1. **Home:** abre en el navegador  
   `https://www.wholeselfnm.com/api/content/home`  
   - Debe verse un JSON con `meta`, `seo`, `content` (hero, valuePropositions, ctaSection.ctas con títulos e iconos, no "Array" ni vacío).
2. **Footer:** abre  
   `https://www.wholeselfnm.com/api/content/shared-footer`  
   - Debe verse un JSON con `content.companyInfo`, `content.navigation.items`, `content.resources.items`, `content.copyright`.

Si ves `{"ok":false,"error":"..."}` o 404/500, revisa en el servidor: que `content.php` esté en la ruta correcta (p. ej. `public_html/api/content.php` o dentro de la carpeta del sitio), que `.htaccess` reescriba a `content.php?pageId=...`, y que `api/forms/db_config.php` tenga las credenciales correctas de la BD donde están `page_home` y `page_shared_footer`.

### Paso 2 — El sitio público se ve bien

1. Abre la **home** del sitio:  
   `https://www.wholeselfnm.com/`  
   - Debe verse el hero (título, descripción, imagen si la hay), las value propositions y las **tres tarjetas CTA** con título, descripción e icono (no solo círculos en blanco).
2. Baja hasta el **footer**:  
   - Debe verse el nombre de la empresa, el título "Navigation" con enlaces (Home, Services, etc.), "Resources" con Crisis Resources, Client Portal, etc., y el copyright.

Si el footer o la home salen vacíos o con placeholders, suele ser que la variable de entorno **`PUBLIC_USE_CONTENT_FROM_BD`** no está en `true` en el entorno de build, o que el sitio está cacheando una versión vieja: prueba en una ventana de incógnito o con caché desactivada.

### Paso 3 — (Opcional) Probar que el PUT guarda

Si tienes la **clave API** (la de `content_api_config.php` en el servidor):

```bash
curl -X PUT "https://www.wholeselfnm.com/api/content/shared-footer" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: TU_CLAVE_REAL" \
  -d '{"meta":{"pageId":"shared-footer","lastUpdated":"2025-03-01T12:00:00Z","version":1},"seo":{},"content":{"companyInfo":{"name":{"en":"WholeSelf Counseling","es":""},"tagline":{"en":"Test","es":""}},"navigation":{"title":{"en":"Navigation","es":""},"items":[{"label":{"en":"Home","es":""},"link":"/"},{},{},{},{},{}]},"resources":{"title":{"en":"Resources","es":""},"items":[{"label":{"en":"Crisis Resources","es":""},"link":"#","isModal":true},{},{},{},{},{}]},"copyright":{"en":"All rights reserved","es":""}}}'
```

Debe responder **200** y `{"ok":true}`. Después abre de nuevo en el navegador  
`https://www.wholeselfnm.com/api/content/shared-footer`  
y comprueba que `content.companyInfo.tagline` tenga `"Test"` en inglés (o el cambio que hayas hecho). Si es así, el editor podrá leer y escribir igual.

### Resumen rápido

| Comprobación | Qué hacer | Si falla |
|--------------|-----------|----------|
| API Home | Abrir `/api/content/home` en el navegador | Revisar ruta de `content.php`, `.htaccess`, `db_config.php` y que exista tabla `page_home` con datos. |
| API Footer | Abrir `/api/content/shared-footer` en el navegador | Revisar que exista tabla `page_shared_footer` con filas `en` y `es`. |
| Sitio Home | Abrir la home y ver CTAs con texto | Verificar `PUBLIC_USE_CONTENT_FROM_BD=true` y que el build desplegado sea el último. |
| Sitio Footer | Ver footer con nombre, enlaces y recursos | Mismo anterior; si la API devuelve bien, el sitio debería mostrar los datos. |
| PUT | Hacer PUT con curl y clave API, luego GET | 401 = clave incorrecta; 200 + GET con datos nuevos = todo bien. |

---

## 7. Si el footer no se actualiza en el sitio (pero la API y la BD sí)

**Contexto:** Pruebas actuales en **www.ajamoment.com**; producción en **www.wholeselfnm.com**. Si en la home sí ves los cambios del editor (p. ej. headline del hero) pero en el footer no, el dominio y la API están bien; la diferencia es cómo se cargan los datos (el footer ahora usa la misma lógica que la home: fetch al montar, cada 60 s y al volver a la pestaña).

Los logs del servidor muestran que el GET devuelve el nombre actualizado; en el sitio sigues viendo "Whole Self Counseling". Entonces el fallo está en el **front**: el navegador no está usando la respuesta de la API para el footer.

**No hace falta borrar todo el servidor.** Revisa esto:

1. **Desplegar el build, no solo el código fuente**  
   El sitio debe servir los archivos **generados** (p. ej. carpeta `dist/` de Astro). Si subes solo el repo y el servidor no hace `npm run build`, el JavaScript del footer puede ser viejo y no incluir el fetch que pide `/api/content/shared-footer`.

2. **Consola del navegador (F12 → Console)** en **www.ajamoment.com** (o el dominio que uses)  
   Recarga la página y busca:
   - `[getSharedContent footer] fetch URL: https://...`  
     → Debe ser el mismo dominio (ej. `https://www.ajamoment.com/api/content/shared-footer`).
   - `[Footer] OK: liveFooterData from API...`  
     → El fetch funcionó y el footer debería mostrar lo que devuelve la API.
   - `[Footer] Fetch footer FAILED — ...`  
     → El fetch falló; mientras falle, se muestra el contenido del build. El footer vuelve a intentar a los 60 s y al volver a la pestaña.

3. **Sitio y API en dominios distintos**  
   Si el sitio está en un dominio y la API en otro, en el **build** define **`PUBLIC_API_BASE`** con la URL base de la API. En **www.ajamoment.com** sitio y API suelen ser el mismo origen, por eso la home ya se actualiza.

4. **Caché**  
   Prueba en ventana de incógnito o con "Desactivar caché" en DevTools (pestaña Network) para descartar JS o respuestas viejas.
