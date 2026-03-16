# Footer: 404 en "Crisis Resources" y lógica del modal

Este documento describe el **error** que ocurría al hacer clic en "Crisis Resources" en la lista de Resources del footer, la **causa**, el **diseño esperado** y la **solución** aplicada. Es importante para mantener la coherencia entre BD, API y front.

---

## 1. El error (qué veía el usuario)

- **Dónde:** En el footer del sitio, en la columna **Resources**, al hacer clic en el enlace **"Crisis Resources"** (o "Recursos de crisis" en español).
- **Qué pasaba:** El navegador intentaba ir a una URL (por ejemplo `/crisis-resources` o `/es/crisis-resources`) y la respuesta del servidor era **404 (Página no encontrada)**.
- **Comportamiento esperado:** Al hacer clic en "Crisis Resources" debería **abrirse el modal** de recursos de crisis (el mismo que abre el botón flotante del header), no navegar a otra página.

---

## 2. Causa del error

### De dónde sale el contenido del footer

- El footer (títulos, enlaces de navegación y **lista de Resources**) viene de la **API** `GET /api/content?pageId=shared-footer`.
- La API lee de la tabla **`page_shared_footer`** (2 filas: `locale = 'en'` y `'es'`).
- La sección Resources se rellena con los campos **`link1_label`**, **`link1_link`**, **`link1_is_modal`**, y lo mismo para `link2`… hasta `link6`.
- El **primer ítem** de Resources (link1) es el que corresponde a **Crisis Resources**.

Por tanto, lo que muestra el footer depende de lo que esté guardado en la BD para ese ítem:

| Campo en BD        | Significado                          | Ejemplo que causaba el problema   |
|--------------------|--------------------------------------|-----------------------------------|
| `link1_label`      | Texto del enlace (en/es)             | "Crisis Resources" / "Recursos de crisis" |
| `link1_link`       | URL o `#` si es solo “abrir modal”  | `#` (correcto) o `/crisis-resources` (problemático) |
| `link1_is_modal`   | 1 = abrir modal, 0 = enlace normal  | 0 (problemático) o 1 (correcto)   |

### Por qué aparecía el 404

- Si en la BD el ítem de Crisis Resources tenía, por ejemplo:
  - `link1_link = '/crisis-resources'`
  - `link1_is_modal = 0`
- entonces el front interpretaba ese ítem como **enlace normal** y renderizaba:
  - `<a href="/crisis-resources">Crisis Resources</a>` (o `/es/crisis-resources` en español).
- Al hacer clic, el navegador iba a esa URL. En muchos entornos (por ejemplo producción en Bluehost) esa ruta **no existe** o no está configurada, y el servidor devolvía **404**.

Resumen: el 404 se producía porque el footer **navegaba** a una URL en lugar de **abrir el modal**, cuando la BD tenía “Crisis Resources” configurado como enlace (`/crisis-resources`) y no como modal (`is_modal = 1` o `link = '#'`).

---

## 3. Diseño esperado (intención del producto)

- **Crisis Resources** en el footer debe **siempre** comportarse igual que el botón flotante de crisis del header:
  - Al hacer clic → **abrir el modal** de recursos de crisis.
  - **No** debe llevar a una página `/crisis-resources` desde el footer.
- La página estática `/crisis-resources` (y `/es/crisis-resources`) puede existir para quien entre por URL o enlaces externos, pero el **ítem del footer** debe ser exclusivamente “abrir modal”.

Esto está reflejado en el contenido por defecto del front cuando no hay API/BD:

- En `src/data/services/contentService.ts`, el **DEFAULT_FOOTER_CONTENT** define el primer ítem de Resources como:
  - `link: '#'`
  - `isModal: true`

Es decir, el diseño por defecto es “modal”, no “enlace a página”.

---

## 4. Dónde está la lógica

| Capa        | Archivo / Origen | Qué hace |
|------------|-------------------|----------|
| **BD**     | Tabla `page_shared_footer` | Guarda `link1_label`, `link1_link`, `link1_is_modal` (y link2…link6) para la sección Resources. |
| **API**    | `public/api/content.php` (GET `pageId=shared-footer`) | Lee la tabla y devuelve `content.resources.items[]` con `label`, `link`, `isModal` por ítem. |
| **Front**  | `src/components/layout/Footer.tsx` | Recibe `content.resources.items`, recorre los ítems y para cada uno decide: **¿es botón que abre el modal de Crisis o es un enlace normal?** Según eso renderiza `<button>` (modal) o `<a href="...">` (navegación). |

La decisión crítica está en **Footer.tsx**: cómo se calcula “este ítem es Crisis Resources y debe abrir el modal”.

---

## 5. Lógica actual en el Footer (solución al 404)

Código relevante en `src/components/layout/Footer.tsx` (aprox. líneas 159–196):

```tsx
{items.map((item: any) => {
  const link = typeof item.link === 'string' ? item.link : getLocalizedText(item.link, language);
  const labelStr = getLocalizedText(item.label, language);

  // Crisis Resources siempre abre el modal (por diseño).
  // Si la BD tiene link=/crisis-resources e isModal=0, evitar 404 tratándolo como modal por etiqueta.
  const isCrisisByLabel = /crisis|recursos de crisis/i.test(labelStr);
  const isCrisisModal =
    isCrisisByLabel ||
    (Boolean(item.isModal) && (link === '#' || link === '' || (typeof link === 'string' && link.toLowerCase().includes('crisis'))));

  if (isCrisisModal) {
    return (
      <li key="crisis-resources" data-float-stop="crisis">
        <button
          onClick={() => {
            const event = new CustomEvent('openCrisisModal');
            window.dispatchEvent(event);
          }}
          className="..."
        >
          {labelStr}
        </button>
      </li>
    );
  }

  // Enlace normal (Fellowship, Immigration, Client Portal, etc.)
  const resolvedLink = withLocalePath(link, language);
  return (
    <li key={link || labelStr}>
      <a href={resolvedLink} ...>{labelStr}</a>
    </li>
  );
})}
```

### Reglas en palabras

1. **Se considera “modal de Crisis”** si se cumple **alguna** de estas condiciones:
   - **Por etiqueta:** El texto visible del ítem (`labelStr`) contiene “crisis” o “recursos de crisis” (sin importar mayúsculas/minúsculas).  
     → Así, aunque en la BD esté `link = '/crisis-resources'` e `isModal = 0`, el footer **siempre** abrirá el modal para ese ítem y no mostrará un enlace que lleve al 404.
   - **Por datos de la API:** `item.isModal === true` **y** además el `link` es `'#'`, vacío, o una cadena que contiene “crisis” (p. ej. `/crisis-resources`).  
     → Respeta la intención del editor cuando en la BD está bien configurado como modal.

2. **Si es modal de Crisis:** se renderiza un **`<button>`** que dispara el evento `openCrisisModal`. El Header (o quien escuche ese evento) abre el modal de recursos de crisis.

3. **Si no es modal de Crisis:** se renderiza un **`<a href={resolvedLink}>`** (enlace normal). Ejemplos: Fellowship, Immigration Evaluations, Client Portal.

Con esto, el ítem “Crisis Resources” en el footer **siempre** abre el modal y **nunca** lleva a una URL que pueda devolver 404 por ese clic.

---

## 6. Resumen

| Tema | Resumen |
|------|--------|
| **Error** | 404 al hacer clic en "Crisis Resources" en la lista Resources del footer. |
| **Causa** | La BD podía tener `link1_link = '/crisis-resources'` y `link1_is_modal = 0`, y el front lo trataba como enlace normal; la ruta en producción no existía o devolvía 404. |
| **Diseño** | En el footer, "Crisis Resources" debe **solo** abrir el modal, no navegar a una página. |
| **Solución** | En `Footer.tsx`, además de `item.isModal` y `link`, se usa la **etiqueta** del ítem: si el texto contiene “crisis” o “recursos de crisis”, se fuerza comportamiento de **modal** (botón + evento `openCrisisModal`), sin usar el `link` para navegar. |
| **Dónde tocar** | Lógica en `src/components/layout/Footer.tsx`. Datos en tabla `page_shared_footer` y API en `public/api/content.php` (GET shared-footer). |

Si en el futuro se añaden más ítems que deban abrir un modal (no solo Crisis), se puede extender la misma idea: detectar por `label` o por un identificador estable (p. ej. `id` de ítem) y renderizar botón + evento en lugar de `<a>`.
