# Rates — Logos de aseguradoras editables (mensaje para el editor)

La sección **Insurance** de la página **Rates** ya expone en la API un campo de **imagen (logo)** por cada aseguradora. El front usa esa URL cuando está definida; si no, sigue mostrando el logo por convención de nombre (archivos estáticos). El editor debe implementar un componente que permita subir o elegir la imagen y guardar la URL en ese campo.

---

## Nota para el editor: cómo cargar las imágenes en tu interfaz

**Problema:** Si en el editor las imágenes de los logos de aseguradoras no se ven, suele ser porque la API devuelve solo un **path** (ej. `/uploads/insurance/aetna.svg`), no una URL completa.

**Qué tener en cuenta:**

1. **La API devuelve siempre un path**, nunca una URL absoluta. Ejemplos:
   - `logoUrl: "/uploads/insurance/aetna.svg"`
   - `logoUrl: "/uploads/insurance/ambetter.png"`
   - Si no hay logo: `logoUrl: ""`

2. **Para mostrarlas en tu interfaz** tenés que construir la URL completa:
   - **Origen del sitio** = el dominio donde está el sitio y la API (ej. `https://www.wholeselfnm.com`).
   - **URL de la imagen** = origen + path.  
     Si `logoUrl` es `"/uploads/insurance/aetna.svg"`, la URL para el `<img src="...">` debe ser:  
     `https://www.wholeselfnm.com/uploads/insurance/aetna.svg`

3. **Fórmula recomendada:**  
   `imageSrc = logoUrl ? (logoUrl.startsWith('http') ? logoUrl : origin + (logoUrl.startsWith('/') ? logoUrl : '/' + logoUrl)) : ''`  
   (Si `logoUrl` ya empieza por `http` o `https`, usalo tal cual; si no, es path → anteponé el origen del sitio.)

4. **Rutas unificadas (ajuste reciente):** Todas las imágenes del sitio (hero y logos de insurance) usan la base **`/uploads/`**:
   - Hero: `/uploads/hero/home.webp`, `/uploads/hero/rates.webp`, `/uploads/hero/services.webp`
   - Logos de aseguradoras: `/uploads/insurance/<archivo>.<ext>` (ej. `aetna.svg`, `united-healthcare.png`)

5. **Al guardar desde el editor:** Si permitís subir una nueva imagen, guardá en `logoUrl` el **path** que devuelva vuestro endpoint de subida (ej. `/uploads/insurance/nombre-del-archivo.png`), no la URL absoluta. Así el sitio y el editor siguen usando la misma convención.

Resumen: **path en la API → en el editor convertilo a URL absoluta con el origen del sitio para el `src` de la imagen.**

---

## Cómo cargamos las imágenes en el front (sitio)

- **Qué guardamos en BD / qué devuelve la API:** Solo un **path** (ruta relativa al sitio), por ejemplo `/uploads/logo-aetna.png` o `banner-rates.webp`. No guardamos la URL absoluta (no `https://www.wholeselfnm.com/...`).
- **Cómo mostramos el logo en Rates (Insurance):** Si `providerList[i].logoUrl` tiene valor, hacemos `src = pathWithBase(logoUrl)` (añadimos solo el base path del sitio, ej. `/redesigned` si aplica). El navegador pide la imagen al **mismo origen** que la página (p. ej. `https://www.wholeselfnm.com/redesigned/uploads/logo-aetna.png`). Es el **mismo principio que el hero de Home o Services**: la API devuelve un path; el front construye la URL final con el **origen del sitio** (`window.location.origin`) para que la imagen cargue bien (evitar 404 en rutas como `/es/rates`).
- **Hero (Home, Services, Rates):** La API devuelve `hero.backgroundImage` como path (ej. `/banner-rates.webp`). Nosotros hacemos `imageSrc = origin + path` (con `origin = window.location.origin`) para que el `<img>` tenga una URL absoluta y cargue desde el mismo dominio.

Conclusión: **las imágenes (hero y logos de insurance) están “guardadas” como path en la BD; el front las carga desde el mismo dominio del sitio (origen + path).**

---

## Qué debe hacer el editor para que se vean las imágenes

Cuando el editor hace **GET** a la API de Rates, recibe `content.insurance.providerList[].logoUrl` como **string** (path, puede estar vacío). Para **mostrar** esa imagen en el panel del editor:

1. **Construir la URL absoluta de la imagen:**  
   Si `logoUrl` ya es una URL completa (empieza por `http://` o `https://`), usarla tal cual.  
   Si no, es un path: **hay que prefijar el origen del sitio** (el mismo dominio que sirve la API y los archivos), por ejemplo:
   - `origin = 'https://www.wholeselfnm.com'` (o la URL base del sitio en producción).
   - `imageSrc = logoUrl ? (logoUrl.startsWith('http') ? logoUrl : origin + (logoUrl.startsWith('/') ? logoUrl : '/' + logoUrl)) : ''`
2. Usar esa `imageSrc` en el `src` del `<img>` en el editor.

Si el panel del editor corre en **otro dominio** (p. ej. Augushub en su propio dominio), las imágenes del sitio están en `https://www.wholeselfnm.com`; por tanto el editor **debe** usar ese origen para montar la URL de la imagen. Sin eso, el navegador no puede cargar la imagen (CORS o path incorrecto) y no se verá.

Resumen para el editor: **mismo criterio que el hero de Home: la API devuelve un path; para mostrarlo en el editor hay que convertir ese path en URL absoluta usando el origen del sitio (donde está la API y los assets).**

---

## Contrato API (Rates — Insurance)

- **GET** `.../api/content/rates` devuelve, dentro de `content.insurance`:
  - **`providerList`**: array de objetos `{ name: { en, es }, logoUrl: string }`.
  - Cada ítem es una aseguradora: `name` es el nombre por idioma; **`logoUrl`** es la URL del logo (vacía si aún no se ha subido).

- **PUT** `.../api/content/rates` acepta el mismo `content.insurance.providerList`: array de `{ name: { en, es }, logoUrl: string }`. Al guardar, el backend persiste por locale `{ name: "<nombre para ese idioma>", logoUrl: "<url>" }`.

- Comportamiento del sitio: si `logoUrl` tiene valor, se muestra esa imagen; si está vacía, se usa el fallback por nombre en **`/uploads/insurance/`** (ej. `/uploads/insurance/aetna.svg`).

---

## Qué decirle al editor (Augushub)

Puedes enviar algo como:

> En la página **Rates**, en la sección **Insurance**, la lista de aseguradoras ya está conectada a la API con un campo de **imagen (logo)** por cada una.
>
> - **Dónde está el campo:** En el JSON de Rates, `content.insurance.providerList` es un array. Cada elemento tiene:
>   - `name`: `{ en: "...", es: "..." }` (nombre de la aseguradora).
>   - **`logoUrl`**: string con la **ruta** del logo (path relativo al sitio, ej. `/uploads/insurance/aetna.svg`; vacío si no hay imagen). **Todas las imágenes usan ahora la base `/uploads/`** (logos en `/uploads/insurance/`, hero en `/uploads/hero/`).
>
> - **Por qué no se ven las imágenes en el editor:** La API devuelve solo el **path**, no la URL absoluta. Para mostrar la imagen en el panel hay que construir la URL completa: **origen del sitio + path**. Por ejemplo: si el sitio/API está en `https://www.wholeselfnm.com`, la imagen con `logoUrl: "/uploads/insurance/aetna.svg"` debe mostrarse como `https://www.wholeselfnm.com/uploads/insurance/aetna.svg`. Si en el editor no hacéis esa conversión (path → URL absoluta con el dominio del sitio), el navegador no puede cargar la imagen y no se verá.
>
> - **Qué implementar:** (1) Al cargar los datos (GET rates), para cada `providerList[i].logoUrl` que tenga valor, construir `imageSrc = origenDelSitio + logoUrl` (si logoUrl no empieza por `http`) y usar ese `imageSrc` en el `src` de la previsualización del logo. (2) Permitir subir/seleccionar imagen y guardar la **ruta** resultante en `providerList[i].logoUrl` al hacer PUT. Así las imágenes se verán en el editor y en la web.

---

## URL del JSON (por entorno)

| Entorno   | URL |
|-----------|-----|
| Producción (wholeselfnm.com) | `https://www.wholeselfnm.com/api/content/rates` |
| Local | `http://localhost:4321/api/content/rates` (o el puerto que uses) |

Al abrir esa URL (GET) verás `content.insurance.providerList` con `name` y `logoUrl` por cada aseguradora.
