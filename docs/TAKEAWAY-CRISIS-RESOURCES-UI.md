# Take away: Crisis Resources — errores de UI resueltos

Nota de los dos últimos errores que resolvimos en el módulo Crisis Resources (modal y botones de categoría), para **evitarlos en el futuro** en otros componentes que muestren contenido localizado o modales con botones.

---

## 1. Botones de categoría cerraban el modal / “volvían al inicio”

**Síntomas:** Al hacer clic en ciertos botones (Children, Queer, BIPOC, Uso de sustancias, Violencia doméstica) el modal se cerraba, se ocultaba el logo y no se mostraba la información de la categoría. El botón “General” (y otros como Immigrant Resources, Elders, Crime) sí funcionaban.

**Causas:**

1. **Propagación del clic al backdrop**  
   El clic en el botón burbujeaba hasta el `div` del backdrop, que tiene `onClick={onClose}`. En algunos casos (touch, orden del DOM o área de clic) el evento llegaba al backdrop y cerraba el modal.

2. **React error #31 — “Objects are not valid as a React child”**  
   Algunos recursos de la API tienen campos en formato localizado `{ en: '...', es: '...' }` (p. ej. `text`, `videoPhone`, `instantMessenger`). En el modal se renderizaban directamente como `{resource.text}` en lugar de usar `getLocalizedText(resource.text, language)`. React no puede renderizar un objeto como hijo → error → el árbol del componente se rompía y daba la sensación de “volver al inicio” o pantalla en blanco.

**Soluciones aplicadas:**

- **Botones:** Un solo manejador `handleSelectSubcategory(sub, onMobile)` que hace `e.preventDefault()` y `e.stopPropagation()` antes de actualizar estado. Todos los botones de categoría usan ese manejador y tienen `type="button"` para no disparar submits.
- **Campos localizados:** Cualquier campo de recurso que pueda venir como `{ en, es }` se muestra con `getLocalizedText(campo, language)`. En Crisis Resources se corrigieron `resource.text`, `resource.videoPhone` y `resource.instantMessenger` (en ambos bloques de `renderResources`: grid y lista).

**Take away para el futuro:**

- En **modales con botones dentro**: usar `type="button"` y en el `onClick` hacer `e.stopPropagation()` (y si aplica `e.preventDefault()`) para que el clic no llegue al backdrop u otros contenedores con `onClose`.
- Al **renderizar datos que vienen de la API**: si un campo puede ser texto localizado (objeto con `en`/`es`), **nunca** ponerlo directo en el JSX (`{campo}`). Siempre usar `getLocalizedText(campo, language)` (o equivalente) para obtener un string y evitar React error #31.

---

## 2. Botón “Close” + “×” redundante en la vista de detalle (móvil)

**Síntoma:** En la versión móvil, al entrar al detalle de una categoría (p. ej. “General”) aparecía un segundo botón “Close” + “×” en el header del panel deslizable, además del “×” del header principal del modal. Redundante y confuso.

**Causa:** Se había añadido un botón de cierre en el header del panel de detalle móvil para “siempre tener forma de cerrar”; el modal ya tiene un header principal con “×” visible en móvil, por lo que el segundo cierre era innecesario.

**Solución:** Se eliminó el botón “Close” + “×” del header del panel de detalle móvil. Se dejó solo el botón “Regresar” (flecha) y el título de la categoría. El cierre del modal se hace con el “×” del header principal del modal.

**Take away para el futuro:**

- En **vistas de detalle dentro de un modal (móvil)**: evitar duplicar el control de “cerrar modal” en el panel de detalle si el header principal del modal ya ofrece ese control. Mantener en el panel solo controles de navegación dentro del flujo (p. ej. “Regresar a categorías”).

---

## Resumen rápido

| Problema | Evitar en el futuro |
|----------|----------------------|
| Clic en botón cierra el modal | `type="button"` + `e.stopPropagation()` (y `e.preventDefault()` si aplica) en botones dentro del modal. |
| React #31 al mostrar datos de la API | No renderizar objetos `{ en, es }` en JSX; usar siempre `getLocalizedText(campo, language)` (o similar) para campos que puedan ser localizados. |
| Doble botón de cerrar en detalle móvil | No duplicar el cierre del modal en el panel de detalle si el header del modal ya tiene “×”. |

Referencia de código: `src/components/layout/CrisisResourcesModal.tsx` (handleSelectSubcategory, renderResources con getLocalizedText para text/videoPhone/instantMessenger, header del panel móvil sin botón Close).
