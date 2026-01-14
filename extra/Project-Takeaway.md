# Project Takeaway - Smooth Page Transitions

## Problema Identificado

**Síntoma**: Al navegar entre páginas, toda la aplicación se recargaba completamente, causando:
- Parpadeo visual (flash of white)
- Recarga del Header y Footer innecesaria
- Pérdida de estado del menú de navegación
- Experiencia de usuario no fluida

**Causa raíz**: Navegación tradicional del navegador (full page reload) en lugar de navegación del lado del cliente (client-side navigation).

## Solución Implementada: Astro View Transitions

### Conceptos Técnicos Clave

#### 1. **View Transitions API (Browser API)**
- API nativa del navegador que permite transiciones animadas entre cambios de estado
- Astro implementa View Transitions automáticamente cuando se usa `<ViewTransitions />`
- Crea una "snapshot" del DOM antes y después de la transición
- Permite animar solo elementos específicos mientras otros permanecen estáticos

**Documentación**: [MDN View Transitions API](https://developer.mozilla.org/en-US/docs/Web/API/View_Transitions_API)

#### 2. **transition:persist (Astro Directive)**
```astro
<Header client:load transition:persist="header" />
```
- **Qué hace**: Marca elementos que deben persistir entre navegaciones
- **Cómo funciona**: Astro mantiene estos elementos en el DOM durante las transiciones
- **Resultado**: El elemento no se desmonta/remonta, evitando recargas

**Documentación**: [Astro View Transitions](https://docs.astro.build/en/guides/view-transitions/)

#### 3. **transition:name (Astro Directive)**
```astro
<main transition:name="main-content">
```
- **Qué hace**: Asigna un nombre único al elemento para las transiciones
- **Cómo funciona**: Permite aplicar animaciones CSS específicas usando `::view-transition-new(name)` y `::view-transition-old(name)`
- **Resultado**: Control granular sobre qué elementos se animan y cómo

#### 4. **data-astro-transition-scroll="false"**
```html
<a href="/page" data-astro-transition-scroll="false">
```
- **Qué hace**: Previene el scroll automático después de la navegación
- **Por qué es importante**: Permite control manual del scroll y transiciones más suaves

### Implementación Técnica

#### Estructura del Layout
```astro
<Header client:load transition:persist="header" />
<main transition:name="main-content">
  <slot />
</main>
<Footer client:load transition:persist="footer" />
```

**Análisis**:
- `client:load`: Hidrata el componente React en el cliente
- `transition:persist`: Header/Footer no se recargan
- `transition:name`: Main tiene animación personalizada
- `<slot />`: Contenido que cambia entre páginas

#### CSS para Animaciones
```css
::view-transition-old(main-content) {
  animation: fade-out 0.2s ease-out;
}

::view-transition-new(main-content) {
  animation: fade-in 0.3s ease-in;
}
```

**Conceptos**:
- `::view-transition-old`: Estado anterior del elemento nombrado
- `::view-transition-new`: Estado nuevo del elemento nombrado
- **Pseudo-elementos del navegador**: Creados automáticamente por View Transitions API

#### Manejo del Estado del Menú

**Problema**: El menú se cerraba al navegar porque el componente se remontaba.

**Solución**: 
- `sessionStorage` para persistir estado entre navegaciones
- `useEffect` con dependencia vacía `[]` para restaurar estado al montar
- Listener de `astro:page-load` para mantener estado después de transiciones

**Conceptos React**:
- **Component Lifecycle**: `useEffect` con `[]` = componentDidMount
- **Event Listeners**: `astro:page-load` es un evento custom de Astro
- **State Persistence**: `sessionStorage` vs `localStorage` (sesión vs persistente)

### Conceptos Técnicos para Profundizar

#### 1. **Single Page Application (SPA) Navigation**
- **Qué es**: Aplicación que no recarga la página completa
- **Cómo funciona**: JavaScript intercepta navegación y actualiza DOM dinámicamente
- **Astro approach**: Híbrido - SSG con client-side navigation opcional

**Recursos**:
- [React Router Documentation](https://reactrouter.com/)
- [Astro View Transitions Guide](https://docs.astro.build/en/guides/view-transitions/)

#### 2. **CSS Animations vs Transitions**
- **Transitions**: Cambios automáticos entre estados (hover, focus)
- **Animations**: Secuencias de cambios con keyframes
- **View Transitions**: Combina ambos para cambios de página

**Recursos**:
- [MDN CSS Animations](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Animations)
- [MDN CSS Transitions](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Transitions)

#### 3. **React Component Hydration**
- **Qué es**: Proceso de "activar" componentes React en HTML pre-renderizado
- **client:load**: Hidrata inmediatamente al cargar
- **Por qué importante**: Permite interactividad en componentes React dentro de Astro

**Recursos**:
- [Astro Component Hydration](https://docs.astro.build/en/guides/client-side-scripts/)
- [React Hydration](https://react.dev/reference/react-dom/client/hydrateRoot)

#### 4. **Browser History API**
- **pushState/replaceState**: Cambian URL sin recargar
- **popstate event**: Detecta navegación con botones atrás/adelante
- **Astro usa esto**: Para navegación sin recarga

**Recursos**:
- [MDN History API](https://developer.mozilla.org/en-US/docs/Web/API/History_API)

### Lecciones Aprendidas

1. **Evitar `onClick` con `stopPropagation` en enlaces de navegación**
   - Interfiere con View Transitions
   - Mejor dejar que Astro maneje la navegación

2. **`transition:persist` es crítico para elementos que no deben cambiar**
   - Sin esto, React remonta componentes = pérdida de estado

3. **View Transitions API es nativa del navegador**
   - No requiere librerías adicionales
   - Funciona con cualquier framework que lo soporte

4. **CSS `view-transition-name` permite control granular**
   - Puedes animar elementos específicos
   - Otros elementos pueden permanecer estáticos

### Próximos Pasos de Aprendizaje

1. **Profundizar en View Transitions API**
   - Entender el ciclo de vida completo
   - Aprender a crear transiciones más complejas

2. **React State Management**
   - Cómo mantener estado entre navegaciones
   - Context API vs sessionStorage

3. **Performance Optimization**
   - Lazy loading de componentes
   - Code splitting con View Transitions

4. **Accessibility**
   - Asegurar que transiciones no afecten screen readers
   - `prefers-reduced-motion` media query

### Referencias Técnicas

- [Astro View Transitions](https://docs.astro.build/en/guides/view-transitions/)
- [MDN View Transitions API](https://developer.mozilla.org/en-US/docs/Web/API/View_Transitions_API)
- [React useEffect Hook](https://react.dev/reference/react/useEffect)
- [Browser History API](https://developer.mozilla.org/en-US/docs/Web/API/History_API)

---

## Problema de Z-Index y Stacking Context en Modales (iOS 13+)

### Problema Identificado

**Síntoma**: En la página de investment, al hacer clic en el botón "Verify Insurance Coverage" (segundo botón en la sección CTA inferior), el modal de seguros no se mostraba correctamente en iPhone 13, aunque funcionaba bien en iPhone 7.

**Comportamiento observado**:
- El modal aparecía pero el footer se superponía al contenido
- El botón quedaba debajo del footer
- El problema era específico de iOS 13+ (Safari más reciente)

**Causa raíz**: Problemas de stacking context en Safari iOS 13+. Cuando un modal se renderiza dentro de componentes anidados (dentro de `main` > `InvestmentCTASection` > `InsuranceModal`), Safari crea nuevos stacking contexts que pueden interferir con el z-index, especialmente en versiones más recientes del navegador.

### Solución Implementada: React Portal

#### Conceptos Técnicos Clave

#### 1. **Stacking Context (CSS)**
- **Qué es**: Un contexto de apilamiento que determina el orden de elementos en el eje Z
- **Cómo se crea**: Se crea automáticamente con `position: fixed/absolute`, `transform`, `opacity < 1`, `z-index`, etc.
- **Problema**: Cada elemento padre con estas propiedades crea un nuevo contexto
- **Resultado**: Los z-index solo funcionan dentro de su propio stacking context

**Documentación**: [MDN Stacking Context](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_positioned_layout/Understanding_z-index/Stacking_context)

#### 2. **React Portal (createPortal)**
```tsx
import { createPortal } from 'react-dom';

return createPortal(modalContent, document.body);
```

- **Qué hace**: Renderiza un componente React fuera de su jerarquía normal del DOM
- **Cómo funciona**: Crea el elemento directamente en el nodo especificado (generalmente `document.body`)
- **Resultado**: El modal está en el nivel más alto del DOM, evitando problemas de stacking context

**Documentación**: [React Portal](https://react.dev/reference/react-dom/createPortal)

#### 3. **Z-Index Strategy**
- **Antes**: `z-50` (igual que header y otros elementos)
- **Después**: `z-[100]` para el modal
- **Razón**: Asegurar que el modal esté por encima de todos los elementos de la página

### Implementación Técnica

#### Estructura del Modal con Portal
```tsx
export default function InsuranceModal({ isOpen, onClose, ... }) {
  // ... lógica del componente ...

  if (!isOpen || typeof window === 'undefined') return null;

  const modalContent = (
    <>
      {/* Backdrop con z-[100] */}
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100]" />
      
      {/* Modal con z-[100] */}
      <div className="fixed inset-0 z-[100] flex items-center justify-center">
        {/* Contenido del modal */}
      </div>
    </>
  );

  // Renderizar usando Portal directamente en el body
  return typeof window !== 'undefined' 
    ? createPortal(modalContent, document.body)
    : null;
}
```

**Análisis**:
- `typeof window !== 'undefined'`: Verificación para SSR (Server-Side Rendering)
- `createPortal(modalContent, document.body)`: Renderiza en el body, fuera de la jerarquía normal
- `z-[100]`: Z-index alto para estar por encima de todo

#### Jerarquía del DOM

**Antes (sin Portal)**:
```
<body>
  <main>
    <InvestmentCTASection>
      <InsuranceModal>  <!-- Stacking context anidado -->
        <div z-50>...</div>
      </InsuranceModal>
    </InvestmentCTASection>
  </main>
  <footer>  <!-- Puede crear su propio stacking context -->
</body>
```

**Después (con Portal)**:
```
<body>
  <main>
    <InvestmentCTASection>
      <!-- Modal ya no está aquí -->
    </InvestmentCTASection>
  </main>
  <footer>
  <!-- Modal renderizado directamente aquí -->
  <div z-[100]>...</div>  <!-- Fuera de cualquier stacking context problemático -->
</body>
```

### Conceptos Técnicos para Profundizar

#### 1. **Stacking Context en Navegadores Modernos**
- **iOS 13+ Safari**: Maneja stacking contexts de manera más estricta
- **Diferencias entre navegadores**: Chrome, Firefox, Safari tienen comportamientos ligeramente diferentes
- **Solución universal**: Portals evitan el problema en todos los navegadores

**Recursos**:
- [MDN Understanding CSS z-index](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_positioned_layout/Understanding_z-index)
- [Stacking Context Explained](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_positioned_layout/Understanding_z-index/Stacking_context)

#### 2. **React Portal vs Render Normal**
- **Render normal**: Componente se renderiza donde está en el árbol React
- **Portal**: Componente se renderiza donde especifiques en el DOM real
- **Ventajas del Portal**: 
  - Evita problemas de overflow/positioning
  - Mejor para modales, tooltips, dropdowns
  - No afecta la jerarquía de componentes React (props, context, etc.)

**Recursos**:
- [React Portal Documentation](https://react.dev/reference/react-dom/createPortal)
- [When to Use Portals](https://react.dev/reference/react-dom/createPortal#usage)

#### 3. **Z-Index Best Practices**
- **Estrategia de capas**: Definir rangos de z-index para diferentes tipos de elementos
  - Base: 0-10
  - Dropdowns: 20-30
  - Sticky headers: 40-50
  - Modales: 90-100
- **Evitar valores arbitrarios**: Usar un sistema consistente
- **Documentar**: Mantener un archivo de referencia de z-index

### Lecciones Aprendidas

1. **Los modales siempre deben usar Portals**
   - Evita problemas de stacking context
   - Funciona consistentemente en todos los navegadores
   - Especialmente importante en iOS 13+ (Safari)

2. **Z-index solo funciona dentro de su stacking context**
   - Aumentar z-index no siempre soluciona el problema
   - A veces necesitas cambiar la estructura del DOM (Portal)

3. **Probar en múltiples dispositivos y navegadores**
   - El problema solo aparecía en iPhone 13, no en iPhone 7
   - Diferentes versiones de Safari manejan stacking contexts diferente

4. **Verificar `typeof window !== 'undefined'` en SSR**
   - `document.body` no existe en el servidor
   - Importante para frameworks como Astro que hacen SSR

### Próximos Pasos de Aprendizaje

1. **Profundizar en Stacking Context**
   - Entender todas las formas en que se crea un stacking context
   - Aprender a debuggear problemas de z-index

2. **React Portal Patterns**
   - Crear un hook personalizado para modales
   - Manejar múltiples modales con Portals

3. **CSS Layers (Future)**
   - Nueva especificación CSS para manejar z-index de manera más predecible
   - `@layer` para definir capas de estilo

### Referencias Técnicas

- [React Portal](https://react.dev/reference/react-dom/createPortal)
- [MDN Stacking Context](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_positioned_layout/Understanding_z-index/Stacking_context)
- [CSS Z-Index Explained](https://developer.mozilla.org/en-US/docs/Web/CSS/z-index)
- [iOS Safari Stacking Context Issues](https://webkit.org/blog/7929/designing-websites-for-iphone-x/)

---

## Problema Crítico: Modal del Equipo - Z-Index y Bloqueo de Scroll

### Problema Identificado

**Síntoma**: En la página de Team, el modal que muestra la información detallada de los miembros del equipo tenía dos problemas críticos:

1. **Modal quedaba por debajo del header y footer**
   - A pesar de usar React Portal y `z-[100]`, el modal seguía apareciendo detrás del header (`z-[80]`)
   - El contenido del modal se solapaba con la barra de navegación en desktop
   - El footer también se superponía al modal

2. **Scroll de fondo activo cuando el modal está abierto**
   - Aunque se usaba `document.body.style.overflow = 'hidden'`, el scroll de la página de fondo seguía funcionando
   - Esto causaba que hubiera dos scrolls activos simultáneamente:
     - El scroll del contenido del modal (correcto)
     - El scroll de la página de fondo (incorrecto)
   - En móvil, esto era especialmente problemático porque el usuario podía hacer scroll en la página de fondo mientras intentaba hacer scroll en el modal

**Causa raíz**:
1. **Z-index insuficiente**: Aunque `z-[100]` debería ser suficiente, el header tenía `z-[80]` pero estaba en un contexto diferente. Necesitábamos un z-index mucho más alto.
2. **`overflow: hidden` no es suficiente**: En algunos navegadores (especialmente móviles), `overflow: hidden` en el body no previene completamente el scroll, especialmente si hay elementos con `position: fixed` o si el usuario está haciendo scroll con gestos táctiles.

### Solución Implementada: Portal + Z-Index Muy Alto + Bloqueo Completo de Scroll

#### 1. **React Portal con Z-Index Muy Alto**

```tsx
import { createPortal } from 'react-dom';

const modalContent = (
  <>
    {/* Backdrop con z-index muy alto */}
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-[9999]" />
    
    {/* Modal con z-index muy alto */}
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 md:p-6 pointer-events-none">
      {/* Contenido del modal */}
    </div>
  </>
);

// Renderizar usando Portal directamente en el body
return createPortal(modalContent, document.body);
```

**Por qué `z-[9999]`**:
- El header tiene `z-[80]`, pero necesitamos estar MUY por encima para evitar cualquier conflicto
- Usar un valor muy alto (9999) asegura que el modal esté por encima de cualquier elemento futuro
- Es una práctica común para modales críticos que deben estar siempre visibles

#### 2. **Bloqueo Completo de Scroll con `position: fixed`**

**El problema con `overflow: hidden`**:
```tsx
// ❌ NO SUFICIENTE - No funciona en todos los casos
document.body.style.overflow = 'hidden';
```

**Por qué falla**:
- En móviles, el scroll puede seguir funcionando con gestos táctiles
- Si hay elementos con `position: fixed`, pueden crear nuevos contextos de scroll
- Algunos navegadores ignoran `overflow: hidden` en ciertas situaciones

**Solución: `position: fixed` + Guardar posición de scroll**:
```tsx
if (isOpen) {
  // 1. Guardar la posición de scroll actual
  const scrollY = window.scrollY;
  const body = document.body;
  const html = document.documentElement;
  
  // 2. Bloquear scroll completamente usando position fixed
  body.style.position = 'fixed';
  body.style.top = `-${scrollY}px`;  // Mantener la posición visual
  body.style.width = '100%';
  body.style.overflow = 'hidden';
  
  // 3. También bloquear en html para mayor compatibilidad
  html.style.overflow = 'hidden';
  
  // 4. Guardar la posición de scroll para restaurarla después
  body.setAttribute('data-scroll-y', scrollY.toString());
}
```

**Cómo funciona**:
1. **`position: fixed`**: Fija el body en su posición actual, previniendo cualquier scroll
2. **`top: -${scrollY}px`**: Mantiene la posición visual del contenido (sin saltos)
3. **Guardar posición**: Almacena dónde estaba el scroll para restaurarlo después
4. **Bloquear en `html` también**: Algunos navegadores usan el scroll del `html` en lugar del `body`

**Restaurar scroll al cerrar**:
```tsx
else {
  // Restaurar scroll
  const body = document.body;
  const html = document.documentElement;
  const scrollY = body.getAttribute('data-scroll-y');
  
  // Restaurar estilos
  body.style.position = '';
  body.style.top = '';
  body.style.width = '';
  body.style.overflow = '';
  html.style.overflow = '';
  
  // Restaurar posición de scroll
  if (scrollY) {
    window.scrollTo(0, parseInt(scrollY, 10));
    body.removeAttribute('data-scroll-y');
  }
}
```

#### 3. **Padding-Top en Desktop para Evitar Solapamiento**

```tsx
<div className="relative flex items-center w-full max-w-5xl md:pt-28 pointer-events-auto">
```

- `md:pt-28`: Agrega padding-top solo en desktop (md breakpoint)
- Evita que el modal se solape con la barra de navegación
- El valor `28` (7rem) es suficiente para la altura del header + menú

### Implementación Completa

```tsx
export function TeamMemberModal({ isOpen, onClose, ... }) {
  // ... lógica del componente ...

  // Navegación con teclado y bloqueo de scroll
  useEffect(() => {
    if (isOpen) {
      // Guardar posición de scroll
      const scrollY = window.scrollY;
      const body = document.body;
      const html = document.documentElement;
      
      // Bloquear scroll completamente
      body.style.position = 'fixed';
      body.style.top = `-${scrollY}px`;
      body.style.width = '100%';
      body.style.overflow = 'hidden';
      html.style.overflow = 'hidden';
      
      // Guardar posición
      body.setAttribute('data-scroll-y', scrollY.toString());
    } else {
      // Restaurar scroll
      const body = document.body;
      const html = document.documentElement;
      const scrollY = body.getAttribute('data-scroll-y');
      
      body.style.position = '';
      body.style.top = '';
      body.style.width = '';
      body.style.overflow = '';
      html.style.overflow = '';
      
      if (scrollY) {
        window.scrollTo(0, parseInt(scrollY, 10));
        body.removeAttribute('data-scroll-y');
      }
    }

    return () => {
      // Cleanup: asegurar que el scroll se restaure si el componente se desmonta
      if (isOpen) {
        // ... mismo código de restauración ...
      }
    };
  }, [isOpen]);

  if (!isOpen || !member || typeof window === 'undefined') {
    return null;
  }

  const modalContent = (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-[9999]" />
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 md:p-6 pointer-events-none">
        <div className="relative flex items-center w-full max-w-5xl md:pt-28 pointer-events-auto">
          {/* Contenido del modal */}
        </div>
      </div>
    </>
  );

  return createPortal(modalContent, document.body);
}
```

### Conceptos Técnicos Clave

#### 1. **Por qué `position: fixed` funciona mejor que `overflow: hidden`**

- **`overflow: hidden`**: Solo oculta las barras de scroll, pero el scroll puede seguir funcionando programáticamente o con gestos
- **`position: fixed`**: Fija el elemento en su posición, previniendo completamente cualquier movimiento
- **Combinación**: Usar ambos (`position: fixed` + `overflow: hidden`) es la solución más robusta

#### 2. **Guardar y Restaurar Posición de Scroll**

**Problema**: Si simplemente bloqueamos el scroll, cuando lo restauramos, la página salta a la parte superior.

**Solución**:
1. Guardar `window.scrollY` antes de bloquear
2. Usar `top: -${scrollY}px` para mantener la posición visual
3. Al restaurar, usar `window.scrollTo(0, scrollY)` para volver a la posición exacta

#### 3. **Z-Index Muy Alto para Modales Críticos**

**Estrategia de Z-Index**:
- Base: 0-10
- Dropdowns: 20-30
- Sticky headers: 40-50 (header: z-[80])
- Modales normales: 90-100
- **Modales críticos**: 9999 (siempre por encima de todo)

**Por qué no usar valores intermedios**:
- Si usas `z-[200]`, y luego agregas un elemento con `z-[300]`, el modal queda por debajo
- Usar `z-[9999]` asegura que el modal esté siempre por encima, incluso si se agregan nuevos elementos

### Lecciones Aprendidas

1. **`overflow: hidden` NO es suficiente para bloquear scroll en móviles**
   - Siempre usar `position: fixed` + guardar posición de scroll
   - Especialmente importante en dispositivos táctiles

2. **Z-index alto no siempre es suficiente**
   - Necesitas React Portal para evitar stacking contexts
   - Y un z-index MUY alto (9999) para estar seguro

3. **Siempre restaurar el estado al cerrar**
   - Limpiar estilos del body
   - Restaurar posición de scroll
   - Hacerlo también en el cleanup del useEffect

4. **Probar en móvil es crítico**
   - El problema del scroll doble solo se notaba en móvil
   - Los gestos táctiles se comportan diferente al scroll con mouse

5. **Padding-top en desktop para evitar solapamiento**
   - El header sticky puede solaparse con el modal
   - Agregar padding-top solo en desktop resuelve el problema

### Comparación: Antes vs Después

**Antes (NO funcionaba)**:
```tsx
// ❌ Z-index insuficiente
<div className="fixed inset-0 z-50 ...">

// ❌ Solo overflow: hidden (no suficiente)
document.body.style.overflow = 'hidden';

// ❌ Sin padding-top (se solapaba con header)
<div className="relative flex items-center ...">
```

**Después (Funciona perfectamente)**:
```tsx
// ✅ Z-index muy alto
<div className="fixed inset-0 z-[9999] ...">

// ✅ Position fixed + guardar posición
body.style.position = 'fixed';
body.style.top = `-${scrollY}px`;
body.setAttribute('data-scroll-y', scrollY.toString());

// ✅ Padding-top en desktop
<div className="relative flex items-center ... md:pt-28">

// ✅ React Portal
return createPortal(modalContent, document.body);
```

### Referencias Técnicas

- [MDN position: fixed](https://developer.mozilla.org/en-US/docs/Web/CSS/position#fixed)
- [Preventing Body Scroll on Modal Open](https://css-tricks.com/preventing-a-grid-blowout/)
- [React Portal Documentation](https://react.dev/reference/react-dom/createPortal)
- [Z-Index Stacking Context](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_positioned_layout/Understanding_z-index/Stacking_context)

---

## Problema de Hidratación: Módulos de Node.js en Código del Cliente

### Problema Identificado

**Síntoma**: Los botones del Header (menú móvil y botón de Crisis Resources) dejaron de funcionar completamente. No respondían a clics y la aplicación no se hidrataba correctamente.

**Error en consola**:
```
Error: Module "fs/promises" has been externalized for browser compatibility. 
Cannot access "fs/promises.readFile" in client code.
```

**Causa raíz**: El archivo `src/data/utils/versionHistory.ts` importa módulos de Node.js (`fs/promises`, `fs`, `path`) que solo están disponibles en el servidor. Aunque este archivo estaba diseñado para uso solo en servidor, se estaba importando indirectamente a través de `contentService.ts`, que a su vez es usado por componentes React que se ejecutan en el cliente (`Header.tsx`, `CrisisResourcesModal.tsx`).

**Cadena de importación problemática**:
```
Header.tsx (cliente)
  → contentService.ts
    → versionHistory.ts (importa fs/promises) ❌
```

**Error de build en producción**:
```
Error: Module "fs/promises" has been externalized for browser compatibility. 
Cannot access "fs/promises.readFile" in client code.
```

### Solución Implementada

#### 1. **Renombrar archivo con sufijo `.server.ts` (Solución Final)**
```bash
# Renombrar el archivo para que Astro/Vite lo trate como código solo de servidor
git mv src/data/utils/versionHistory.ts src/data/utils/versionHistory.server.ts
```

**Por qué funciona**:
- El sufijo `.server.ts` le dice explícitamente a Astro/Vite que este archivo es **solo para servidor**
- Vite **nunca** intentará incluir este módulo en el bundle del cliente
- Es la solución más robusta y recomendada por Astro para código de servidor

#### 2. **Actualizar importación dinámica**
```typescript
// contentService.ts
export async function saveContentVersion(...) {
  // Solo ejecutar en el servidor (Node.js)
  if (typeof window !== 'undefined' || typeof process === 'undefined') {
    throw new Error('saveContentVersion can only be called on the server');
  }
  
  // Importación dinámica del módulo .server.ts
  // El sufijo .server.ts asegura que nunca se incluya en el bundle del cliente
  const versionHistoryModule = await import('../utils/versionHistory.server');
  return await versionHistoryModule.saveVersion(pageId, content, author, comment);
}
```

**Ventajas del sufijo `.server.ts`**:
- Astro/Vite automáticamente excluye estos archivos del bundle del cliente
- No requiere configuración adicional en `vite.config` o `astro.config`
- Es la forma estándar y recomendada de marcar código solo de servidor en Astro
- Previene errores de build en producción

#### 3. **Configuración de Vite en `astro.config.mjs` (Adicional, pero no necesaria con .server.ts)**
```javascript
vite: {
  ssr: {
    // Externalizar módulos de Node.js para que no se incluyan en el bundle del cliente
    // Nota: Con .server.ts esto es redundante pero no hace daño
    external: ['fs/promises', 'fs', 'path'],
  },
}
```

**Nota**: Con el sufijo `.server.ts`, esta configuración es redundante pero no hace daño mantenerla como medida de seguridad adicional.

### Conceptos Técnicos Clave

#### 1. **Separación Cliente/Servidor en Astro**
- **Server-Side**: Código que se ejecuta durante el build o en el servidor (Node.js)
- **Client-Side**: Código que se ejecuta en el navegador (JavaScript)
- **Problema**: Módulos de Node.js (`fs`, `path`, `crypto`, etc.) no existen en el navegador
- **Solución**: Separar código de servidor del código del cliente

**Documentación**: [Astro Server-Side Rendering](https://docs.astro.build/en/guides/server-side-rendering/)

#### 2. **Importación Estática vs Dinámica**
```typescript
// ❌ Importación estática - se analiza en tiempo de build
import { saveVersion } from '../utils/versionHistory';

// ✅ Importación dinámica - solo se carga cuando se ejecuta
const { saveVersion } = await import('../utils/versionHistory');
```

**Diferencia**:
- **Estática**: Vite analiza el módulo durante el build, incluso si no se usa
- **Dinámica**: Vite solo procesa el módulo si se ejecuta la función
- **Resultado**: Los módulos de servidor no se incluyen en el bundle del cliente

#### 3. **Verificación de Entorno**
```typescript
if (typeof window !== 'undefined') {
  // Estamos en el navegador (cliente)
}

if (typeof process !== 'undefined') {
  // Estamos en Node.js (servidor)
}
```

**Uso**:
- Verificar antes de usar APIs de Node.js
- Lanzar errores descriptivos si se intenta usar en el cliente
- Prevenir que código de servidor llegue al bundle del cliente

### Recomendaciones para Paneles de Administración de Contenido

#### 1. **Arquitectura de Separación Cliente/Servidor**

**✅ Hacer**:
- Mantener código de servidor (lectura/escritura de archivos, APIs de Node.js) en archivos separados
- Usar importación dinámica para módulos de servidor
- Crear una capa de API/endpoints para operaciones de servidor
- Usar funciones de servidor solo en:
  - Archivos `.astro` (server-side por defecto)
  - API routes (si se usa SSR)
  - Build scripts

**❌ Evitar**:
- Importar módulos de Node.js directamente en componentes React
- Usar `fs`, `path`, `crypto` en código que se hidrata en el cliente
- Mezclar lógica de servidor y cliente en el mismo archivo

#### 2. **Estructura Recomendada para CMS/Admin Panel**

```
src/
├── data/
│   ├── services/
│   │   ├── contentService.ts          # ✅ Usado en cliente y servidor (solo lectura)
│   │   └── contentAdminService.ts     # ⚠️ Solo servidor (escritura, versionHistory)
│   ├── utils/
│   │   ├── versionHistory.server.ts   # ⚠️ Solo servidor (fs/promises) - usar .server.ts
│   │   └── metadataUtils.ts           # ✅ Cliente y servidor (utilidades puras)
│   └── api/                            # 🔄 Endpoints para admin panel
│       ├── content.ts                  # API routes para CRUD
│       └── versions.ts                # API routes para versiones
├── components/
│   ├── admin/                          # Componentes del panel de admin
│   │   ├── ContentEditor.tsx           # ✅ Cliente (UI)
│   │   └── VersionHistory.tsx        # ✅ Cliente (UI)
│   └── layout/
│       └── Header.tsx                  # ✅ Cliente (no debe importar admin)
```

#### 3. **Patrón de API para Operaciones de Servidor**

**Opción A: API Routes (Recomendado para SSR)**
```typescript
// src/pages/api/content/[pageId].ts (Astro API route)
export async function POST({ request, params }) {
  const { pageId } = params;
  const content = await request.json();
  
  // Usar funciones de servidor aquí
  const { saveContentVersion } = await import('@/data/services/contentAdminService');
  await saveContentVersion(pageId, content);
  
  return new Response(JSON.stringify({ success: true }), {
    headers: { 'Content-Type': 'application/json' }
  });
}
```

**Opción B: Funciones de Servidor con Importación Dinámica**
```typescript
// contentService.ts (usado en cliente)
export async function getPageContent(pageId: string) {
  // Solo lectura - seguro para cliente
  const contentModule = await import(`../content/pages/${pageId}.json`);
  return contentModule.default;
}

// contentAdminService.ts (solo servidor)
export async function savePageContent(pageId: string, content: ContentPage) {
  // Verificar que estamos en servidor
  if (typeof window !== 'undefined') {
    throw new Error('savePageContent can only be called on the server');
  }
  
  // Importación dinámica de módulos de servidor
  const { saveVersion } = await import('../utils/versionHistory');
  const fs = await import('fs/promises');
  
  // Lógica de escritura...
}
```

#### 4. **Checklist para Preparar Panel de Administración**

**Antes de implementar**:

- [ ] **Separar servicios de lectura y escritura**
  - `contentService.ts` → Solo lectura (cliente y servidor)
  - `contentAdminService.ts` → Escritura (solo servidor)

- [ ] **Mover código de servidor a archivos dedicados con sufijo `.server.ts`**
  - `versionHistory.server.ts` → Solo servidor (usar sufijo `.server.ts`)
  - Funciones que usan `fs`, `path`, etc. → Solo servidor con sufijo `.server.ts`

- [ ] **Usar importación dinámica para módulos de servidor**
  - `await import('../utils/versionHistory.server')` en lugar de `import`
  - Solo dentro de funciones que verifican `typeof window === 'undefined'`
  - El sufijo `.server.ts` asegura que nunca se incluya en el bundle del cliente

- [ ] **Configurar Vite para externalizar módulos de Node.js**
  ```javascript
  vite: {
    ssr: {
      external: ['fs/promises', 'fs', 'path', 'crypto'],
    },
  }
  ```

- [ ] **Crear API routes para operaciones de escritura**
  - Endpoints `/api/content/*` para CRUD
  - Endpoints `/api/versions/*` para historial
  - Validación y autenticación en cada endpoint

- [ ] **Validar en tiempo de desarrollo**
  - Verificar que no hay importaciones estáticas de módulos de Node.js en componentes React
  - Probar que la hidratación funciona correctamente
  - Verificar que los botones y eventos funcionan

#### 5. **Estrategia de Migración Gradual**

**Fase 1: Preparación (Actual)**
- ✅ Separar `contentService.ts` (lectura) de funciones de escritura
- ✅ Renombrar `versionHistory.ts` a `versionHistory.server.ts` (sufijo `.server.ts`)
- ✅ Actualizar importación dinámica para usar `versionHistory.server`
- ✅ Configurar Vite para externalizar módulos de Node.js (redundante pero seguro)
- ✅ Verificar que la hidratación funciona y el build de producción no falla

**Fase 2: API Layer**
- Crear endpoints API para operaciones de escritura
- Implementar autenticación/autorización
- Validar datos antes de guardar

**Fase 3: Admin Components**
- Crear componentes React para edición (solo UI)
- Conectar componentes con API endpoints
- Implementar versionHistory UI

**Fase 4: Integración Completa**
- Panel de administración completo
- Sistema de permisos
- Auditoría y logs

### Lecciones Aprendidas

1. **Usar sufijo `.server.ts` para código solo de servidor**
   - Astro/Vite automáticamente excluye estos archivos del bundle del cliente
   - Es la forma más robusta y recomendada de marcar código de servidor
   - No requiere configuración adicional, funciona automáticamente

2. **Nunca importar módulos de Node.js en componentes React**
   - Incluso con importación dinámica, Vite puede analizar el módulo
   - Mejor: Usar sufijo `.server.ts` para separar completamente código de servidor

3. **Verificar cadena de importaciones**
   - Un módulo puede importar otro que importa Node.js
   - Usar herramientas para rastrear dependencias
   - Renombrar archivos problemáticos a `.server.ts`

4. **Configurar Vite correctamente desde el inicio**
   - `ssr.external` es útil pero redundante con `.server.ts`
   - El sufijo `.server.ts` es la solución más robusta

5. **Separar responsabilidades claramente**
   - Servicios de lectura → Cliente y servidor (sin sufijo)
   - Servicios de escritura → Solo servidor (usar `.server.ts`)
   - Utils de servidor → Solo servidor (usar `.server.ts`)

5. **Probar hidratación después de cambios**
   - Los errores de hidratación pueden ser silenciosos
   - Verificar que los botones funcionan después de cambios

### Próximos Pasos para Panel de Administración

1. **Crear capa de API**
   - Endpoints REST para CRUD de contenido
   - Autenticación con tokens
   - Validación con Zod

2. **Separar servicios**
   - `contentService.ts` → Solo lectura
   - `contentAdminService.ts` → Escritura (solo servidor)

3. **Implementar autenticación**
   - Sistema de login para administradores
   - Protección de endpoints API
   - Manejo de sesiones

4. **UI de administración**
   - Componentes React para edición
   - Editor de texto enriquecido
   - Preview de cambios

5. **Sistema de versiones**
   - UI para ver historial
   - Rollback de versiones
   - Comparación de cambios

### Referencias Técnicas

- [Astro Server-Side Rendering](https://docs.astro.build/en/guides/server-side-rendering/)
- [Vite SSR External](https://vitejs.dev/guide/ssr.html#ssr-externals)
- [Node.js fs/promises](https://nodejs.org/api/fs.html#fs-promises-api)
- [Dynamic Imports in JavaScript](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/import)
- [Astro API Routes](https://docs.astro.build/en/guides/endpoints/)

---

## Panel de Administración "Easy to Change" - Demo Local

### Estado Actual: Fase de Desarrollo y Estructura

**Nota Importante**: Estamos desarrollando el panel de administración "Easy to Change" como un **demo local primero** mientras armamos la estructura completa del sistema. Esta es una fase de desarrollo y prototipado.

### Objetivo del Panel

El panel de administración "Easy to Change" (ETOCHA) está diseñado para permitir la edición de contenido del sitio web de forma sencilla, separando completamente el contenido (JSON) de la presentación (componentes).

### Arquitectura Actual

#### Estructura de Carpetas

```
etocha/                          # Carpeta portátil del panel
├── config/
│   └── project.json            # Configuración del proyecto (páginas, nombre, etc.)
├── images/
│   ├── easytochange-logo-mobil.webp
│   └── easytochange-logo-desktop.webp
└── README.md

src/
├── components/admin/            # Componentes del panel
│   ├── AdminLayout.tsx         # Layout principal (2x2 grid)
│   ├── ContentEditor.tsx       # Router de editores
│   ├── HomeEditor.tsx          # Editor para página Home
│   ├── PageNavigation.tsx      # Navegación de páginas
│   ├── EasyToChangeLogo.tsx    # Logo del panel
│   └── ...
├── pages/admin/
│   ├── login.astro             # Página de login
│   └── dashboard.astro         # Dashboard principal
└── data/
    └── config/
        └── project.json        # Copia para Vite (importación)
```

#### Características Implementadas (Demo)

1. **Sistema de Login**
   - Página de login sin header/footer del sitio principal
   - Formulario básico (sin validación real aún)
   - Redirección directa al dashboard

2. **Dashboard con Layout 2x2**
   - **Fila 1**: Logo ETOCHA (1/5) | Nombre del Proyecto (4/5)
   - **Fila 2**: Navegación de Páginas (1/5) | Editor de Contenido (4/5)
   - Responsive: En móvil, navegación horizontal con scroll oculto

3. **Editor de Contenido para Home**
   - Visualización de todos los campos editables
   - Hero Section (headline, description, background image)
   - Value Propositions (4 elementos)
   - CTA Section (título y 3 CTAs)
   - **Nota**: Actualmente solo muestra contenido (lectura), edición pendiente

4. **Sistema de Colores**
   - Azul (#07549b) como color principal
   - Amarillo (#fbae17) para hover y acentos
   - Iconos Hero Icons en gris

### Limitaciones Actuales (Demo Local)

#### ⚠️ **Importante: Esta es una fase de desarrollo**

1. **Sin Autenticación Real**
   - El login redirige directamente sin validación
   - No hay sistema de sesiones
   - No hay protección de rutas

2. **Solo Lectura de Contenido**
   - Los editores muestran el contenido actual
   - No hay capacidad de edición aún
   - Los cambios no se guardan

3. **Carga de Datos en Cliente**
   - Uso de importación estática de JSONs
   - Funciona para demo, pero no es escalable
   - Pendiente: API layer para operaciones de servidor

4. **Sin Validación de Datos**
   - No hay validación de formularios
   - No hay reCAPTCHA (deferido)
   - No hay validación de permisos

### Próximas Fases (Pendientes)

#### Fase 1: Autenticación y Seguridad
- [ ] Implementar autenticación real
- [ ] Sistema de sesiones
- [ ] Protección de rutas del panel
- [ ] Integración de reCAPTCHA
- [ ] Sistema de roles y permisos

#### Fase 2: API Layer
- [ ] Crear endpoints API para CRUD de contenido
- [ ] Separar servicios de lectura y escritura
- [ ] Implementar validación con Zod
- [ ] Sistema de versiones de contenido

#### Fase 3: Editor Funcional
- [ ] Campos editables en los editores
- [ ] Guardado de cambios
- [ ] Preview de cambios
- [ ] Historial de versiones

#### Fase 4: Editores para Otras Páginas
- [ ] Services Editor
- [ ] Investment Editor
- [ ] Team Editor
- [ ] Contact Editor
- [ ] What to Expect Editor

### Consideraciones Técnicas

#### Separación Cliente/Servidor

**Problema Identificado**: Los editores necesitan cargar contenido en el cliente, pero las operaciones de escritura deben ser en el servidor.

**Solución Actual (Demo)**:
- Importación estática de JSONs en componentes React
- Funciona para visualización, pero no para edición

**Solución Futura**:
- API routes para todas las operaciones de escritura
- `contentService.ts` → Solo lectura (cliente y servidor)
- `contentAdminService.ts` → Escritura (solo servidor)
- Endpoints `/api/content/*` para CRUD

#### Portabilidad del Panel

El panel está diseñado para ser portátil:
- Carpeta `etocha/` contiene toda la configuración
- Fácil de copiar a otros proyectos
- Configuración en `etocha/config/project.json`

### Lecciones Aprendidas (Hasta Ahora)

1. **Importación Estática vs Dinámica**
   - Para demo local: Importación estática funciona bien
   - Para producción: Necesitamos API layer

2. **Layout Responsive**
   - Navegación horizontal en móvil con scroll oculto
   - Logo responsivo (móvil vs desktop)
   - Títulos que se ajustan al espacio disponible

3. **Sistema de Colores Consistente**
   - Usar colores del logo (azul y amarillo)
   - Mantener consistencia en todo el panel

4. **Estructura Modular**
   - Separar editores por página
   - ContentEditor como router
   - Fácil agregar nuevos editores

### Notas para Desarrollo Futuro

1. **No usar este panel en producción aún**
   - Es un demo/prototipo
   - Falta autenticación y seguridad
   - No hay validación de datos

2. **Preparar para migración a API**
   - La estructura actual facilita agregar API layer
   - Los componentes están listos para conectar con endpoints

3. **Mantener portabilidad**
   - La carpeta `etocha/` debe mantenerse independiente
   - Configuración en JSON para fácil migración

### Referencias

- Carpeta del panel: `etocha/`
- Componentes: `src/components/admin/`
- Configuración: `etocha/config/project.json`
- Documentación del panel: `etocha/README.md`

---

## Problema: React.cloneElement con client:only en Astro

### Problema Identificado

**Síntoma**: Al hacer clic en diferentes páginas del panel de administración (por ejemplo, "Contact"), el `ContentEditor` siempre mostraba el contenido de "Home" en lugar del contenido correspondiente a la página seleccionada.

**Error en logs de consola**:
```
[AdminLayout] Rendering ContentEditor with pageId: contact
[ContentEditor] pageId recibido: undefined -> currentPageId: home
```

**Causa raíz**: `React.cloneElement` no funciona correctamente cuando se usa con componentes que tienen la directiva `client:only="react"` en Astro. Las props pasadas mediante `cloneElement` no se propagan correctamente al componente hijo, resultando en que el componente recibe `undefined` para las props que deberían haber sido pasadas.

**Arquitectura problemática**:
```tsx
// dashboard.astro
<AdminLayout client:only="react" ...>
  <ContentEditor client:only="react" language="en" />
</AdminLayout>

// AdminLayout.tsx
{React.isValidElement(children) 
  ? React.cloneElement(children, { pageId: selectedPage })
  : children
}
```

**Problema**: `ContentEditor` recibía `pageId: undefined` a pesar de que `AdminLayout` intentaba pasar `pageId: selectedPage`.

### Solución Implementada

#### Cambio de Arquitectura: Renderizado Directo

**Antes (No funcionaba)**:
```tsx
// AdminLayout recibía ContentEditor como children
<AdminLayout>
  <ContentEditor />
</AdminLayout>

// AdminLayout intentaba clonar y pasar props
React.cloneElement(children, { pageId: selectedPage })
```

**Después (Funciona)**:
```tsx
// AdminLayout importa y renderiza ContentEditor directamente
import { ContentEditor } from './ContentEditor';

// AdminLayout renderiza directamente con props
<ContentEditor 
  pageId={selectedPage}
  language={language}
  key={`content-editor-${selectedPage}`}
/>
```

**Cambios específicos**:
1. `AdminLayout` ahora importa `ContentEditor` directamente
2. `ContentEditor` se renderiza como componente directo, no como `children`
3. Las props (`pageId`, `language`) se pasan directamente sin usar `cloneElement`
4. Se eliminó el uso de `children` para `ContentEditor` en `dashboard.astro`

### Conceptos Técnicos Clave

#### 1. **React.cloneElement con client:only**

**Problema**:
- `client:only="react"` le dice a Astro que renderice el componente completamente en el cliente
- Cuando Astro procesa componentes con `client:only`, crea un "wrapper" especial
- `React.cloneElement` no puede acceder correctamente a las props de estos componentes envueltos
- Resultado: Las props pasadas mediante `cloneElement` se pierden o llegan como `undefined`

**Documentación**: [Astro Client Directives](https://docs.astro.build/en/reference/directives-reference/#client-directives)

#### 2. **Renderizado Directo vs cloneElement**

**cloneElement (Problemático con client:only)**:
```tsx
// ❌ No funciona correctamente con client:only
{React.isValidElement(children) 
  ? React.cloneElement(children, { pageId: selectedPage })
  : children
}
```

**Renderizado Directo (Recomendado)**:
```tsx
// ✅ Funciona correctamente
<ContentEditor 
  pageId={selectedPage}
  language={language}
/>
```

**Diferencia**:
- **cloneElement**: Intenta modificar props de un elemento React existente
- **Renderizado directo**: Crea el componente con las props correctas desde el inicio
- **Resultado**: Las props se pasan correctamente sin problemas de hidratación

#### 3. **client:only vs client:load**

**client:only**:
- Renderiza el componente completamente en el cliente
- No hay renderizado en el servidor
- Útil para componentes que dependen de APIs del navegador
- **Limitación**: Puede tener problemas con `cloneElement`

**client:load**:
- Renderiza en el servidor primero, luego hidrata en el cliente
- Mejor para SEO y primera carga
- **Ventaja**: Funciona mejor con `cloneElement` en algunos casos

**Para nuestro caso**:
- Usamos `client:only` porque el panel de admin no necesita SEO
- Solución: Renderizado directo en lugar de `cloneElement`

### Implementación Técnica

#### Estructura Antes (Problemática)
```tsx
// dashboard.astro
<AdminLayout client:only="react" ...>
  <ContentEditor client:only="react" language="en" />
</AdminLayout>

// AdminLayout.tsx
export function AdminLayout({ children, ... }) {
  const [selectedPage, setSelectedPage] = useState('home');
  
  return (
    <div>
      {/* Navegación */}
      <PageNavigation onPageSelect={setSelectedPage} />
      
      {/* Área de contenido - PROBLEMA AQUÍ */}
      {React.isValidElement(children) 
        ? React.cloneElement(children, { pageId: selectedPage })
        : children
      }
    </div>
  );
}
```

#### Estructura Después (Funcional)
```tsx
// dashboard.astro
<AdminLayout 
  client:only="react"
  projectName={projectName}
  pages={pages}
  activePageId="home"
  language="en"
/>

// AdminLayout.tsx
import { ContentEditor } from './ContentEditor';

export function AdminLayout({ 
  projectName, 
  pages, 
  activePageId,
  language = 'en' 
}) {
  const [selectedPage, setSelectedPage] = useState(activePageId || 'home');
  
  return (
    <div>
      {/* Navegación */}
      <PageNavigation onPageSelect={setSelectedPage} />
      
      {/* Área de contenido - SOLUCIÓN */}
      <ContentEditor 
        pageId={selectedPage}
        language={language}
        key={`content-editor-${selectedPage}`}
      />
    </div>
  );
}
```

### Lecciones Aprendidas

1. **Evitar `React.cloneElement` con `client:only`**
   - No funciona de manera confiable en Astro
   - Mejor: Renderizar componentes directamente con props

2. **Renderizado directo es más predecible**
   - Las props se pasan correctamente
   - No hay problemas de hidratación
   - Código más simple y fácil de entender

3. **Verificar props en componentes hijos**
   - Agregar logs temporales para verificar qué props se reciben
   - Si recibes `undefined`, el problema está en cómo se pasan las props

4. **Alternativas a `cloneElement`**
   - Renderizado directo (recomendado)
   - React Context para pasar datos
   - Props drilling (paso directo de props)

### Cuándo Usar Cada Enfoque

#### ✅ **Renderizado Directo** (Recomendado)
```tsx
// Cuando conoces el componente que necesitas renderizar
<ContentEditor pageId={selectedPage} language={language} />
```
**Usar cuando**:
- Conoces el componente específico que necesitas
- Las props son conocidas en tiempo de desarrollo
- Trabajas con `client:only` en Astro

#### ⚠️ **React.cloneElement** (Usar con precaución)
```tsx
// Cuando necesitas modificar props de un componente genérico
{React.isValidElement(children) 
  ? React.cloneElement(children, { pageId: selectedPage })
  : children
}
```
**Usar cuando**:
- El componente hijo es genérico y puede variar
- Funciona mejor con `client:load` (no `client:only`)
- Necesitas modificar props de componentes que ya están renderizados

#### ✅ **React Context** (Para datos compartidos)
```tsx
// Para pasar datos a múltiples componentes anidados
const PageContext = createContext();
<PageContext.Provider value={{ pageId: selectedPage }}>
  {children}
</PageContext.Provider>
```
**Usar cuando**:
- Necesitas pasar datos a múltiples niveles de componentes
- Quieres evitar props drilling
- Los datos cambian frecuentemente

### Referencias Técnicas

- [Astro Client Directives](https://docs.astro.build/en/reference/directives-reference/#client-directives)
- [React.cloneElement](https://react.dev/reference/react/cloneElement)
- [React Context API](https://react.dev/learn/passing-data-deeply-with-context)
- [Astro Component Hydration](https://docs.astro.build/en/guides/client-side-scripts/)

---

## Importancia de un Agente/IA para Crear y Ejecutar Páginas en Procesos de Rediseño

### Contexto: Creación de la Página Fellowship Program

Durante el proceso de creación de la página del Fellowship Program, se evidenció la necesidad crítica de tener un agente o sistema de IA que pueda crear y ejecutar cada página de manera sistemática y completa durante procesos de rediseño o expansión del sitio web.

### Problema Identificado

**Síntoma**: Al crear una nueva página (Fellowship Program), se requirieron múltiples iteraciones y ajustes para:
- Crear la estructura JSON de contenido
- Implementar el componente React
- Crear la página Astro
- Agregar enlaces en el footer
- Ajustar colores y estilos según la paleta
- Corregir errores de tipos TypeScript
- Restaurar archivos cuando se perdían cambios

**Causa raíz**: La creación de páginas nuevas requiere múltiples archivos coordinados y cambios en varios lugares del proyecto, lo que hace que sea fácil olvidar pasos o que los cambios se pierdan durante el proceso.

### Lecciones Aprendidas del Proceso

#### 1. **Estructura Multi-Archivo Requiere Coordinación**

Al crear una nueva página, se necesitan múltiples archivos:
```
src/
├── pages/
│   └── fellowship.astro              # Página principal
├── components/
│   └── fellowship/
│       ├── FellowshipContent.tsx     # Componente React
│       └── index.ts                  # Exportaciones
├── data/
│   └── content/
│       ├── pages/
│       │   └── fellowship.json       # Contenido
│       └── shared/
│           └── footer.json          # Actualizar enlaces
```

**Problema**: Si falta un archivo o hay un error en uno, toda la página falla.

**Solución con Agente**: Un agente puede crear todos los archivos necesarios de manera coordinada y verificar que todo esté conectado correctamente.

#### 2. **Consistencia en Estructura y Estilos**

**Problema**: Cada página debe seguir:
- La misma estructura JSON (meta, seo, content)
- Los mismos patrones de componentes
- La misma paleta de colores
- Los mismos patrones de navegación

**Solución con Agente**: Un agente puede:
- Usar plantillas consistentes basadas en páginas existentes
- Aplicar automáticamente la paleta de colores correcta
- Seguir los patrones establecidos en el proyecto
- Mantener consistencia en toda la aplicación

#### 3. **Gestión de Cambios y Restauraciones**

**Problema**: Durante el desarrollo, los archivos pueden:
- Perderse o revertirse accidentalmente
- Tener errores que requieren corrección
- Necesitar ajustes basados en feedback

**Solución con Agente**: Un agente puede:
- Mantener un registro de todos los cambios realizados
- Restaurar archivos completos cuando sea necesario
- Aplicar correcciones de manera sistemática
- Verificar que todos los archivos estén presentes y correctos

#### 4. **Validación y Verificación Automática**

**Problema**: Errores comunes que pueden pasar desapercibidos:
- Tipos TypeScript incorrectos (LocalizedText vs string)
- Enlaces rotos en el footer
- Iconos no disponibles en iconHelper
- Imports incorrectos

**Solución con Agente**: Un agente puede:
- Validar tipos TypeScript antes de crear archivos
- Verificar que todos los iconos estén disponibles
- Comprobar que los enlaces sean correctos
- Ejecutar linters y verificaciones automáticamente

### Proceso Ideal con Agente para Rediseño

#### Fase 1: Análisis y Planificación
1. **Analizar estructura existente**
   - Revisar páginas similares (ej: services.astro como referencia)
   - Identificar patrones de componentes
   - Extraer paleta de colores y estilos

2. **Crear plan de implementación**
   - Listar todos los archivos necesarios
   - Definir estructura JSON requerida
   - Identificar componentes a crear o reutilizar

#### Fase 2: Creación Coordinada
1. **Crear estructura JSON**
   - Generar archivo JSON con estructura completa
   - Incluir todos los campos necesarios (meta, seo, content)
   - Validar formato y tipos

2. **Crear componentes React**
   - Generar componente principal con props correctas
   - Usar tipos TypeScript apropiados
   - Seguir patrones de componentes existentes

3. **Crear página Astro**
   - Generar página con imports correctos
   - Usar layout base apropiado
   - Conectar con componentes React

4. **Actualizar navegación y enlaces**
   - Agregar enlaces en footer
   - Actualizar menús si es necesario
   - Verificar rutas

#### Fase 3: Aplicación de Estilos y Tema
1. **Aplicar paleta de colores**
   - Identificar tema de la página (café, azul, etc.)
   - Aplicar colores consistentemente
   - Ajustar contrastes y accesibilidad

2. **Verificar iconos y assets**
   - Agregar iconos necesarios a iconHelper
   - Verificar que todos los iconos estén disponibles
   - Asegurar que las imágenes existan

#### Fase 4: Validación y Corrección
1. **Validar tipos y sintaxis**
   - Ejecutar TypeScript compiler
   - Verificar que no haya errores de linting
   - Comprobar imports y exports

2. **Verificar funcionalidad**
   - Probar que la página se carga correctamente
   - Verificar que los enlaces funcionan
   - Comprobar que los componentes se renderizan

3. **Aplicar correcciones**
   - Corregir errores encontrados
   - Ajustar estilos si es necesario
   - Aplicar feedback del usuario

### Beneficios de un Agente para Rediseño

#### 1. **Velocidad y Eficiencia**
- Crea múltiples archivos simultáneamente
- No olvida pasos del proceso
- Aplica cambios de manera coordinada

#### 2. **Consistencia**
- Sigue patrones establecidos automáticamente
- Mantiene estructura uniforme en todas las páginas
- Aplica estilos de manera consistente

#### 3. **Reducción de Errores**
- Valida tipos antes de crear archivos
- Verifica que todos los componentes estén conectados
- Detecta problemas antes de que causen errores

#### 4. **Documentación Automática**
- Mantiene registro de todos los cambios
- Documenta decisiones de diseño
- Facilita restauración si es necesario

#### 5. **Escalabilidad**
- Puede crear múltiples páginas en paralelo
- Facilita rediseños completos del sitio
- Permite iteraciones rápidas

### Recomendaciones para Implementar un Agente de Rediseño

#### 1. **Plantillas y Patrones**
- Crear plantillas para diferentes tipos de páginas
- Documentar patrones de componentes
- Mantener ejemplos de referencia

#### 2. **Validación Automática**
- Integrar TypeScript checking
- Ejecutar linters automáticamente
- Verificar imports y exports

#### 3. **Sistema de Restauración**
- Mantener backups de archivos creados
- Permitir restauración rápida
- Registrar historial de cambios

#### 4. **Feedback Loop**
- Aplicar correcciones basadas en feedback
- Iterar rápidamente sobre cambios
- Aprender de cada implementación

### Ejemplo: Proceso de Creación de Fellowship Program

**Con Agente (Ideal)**:
1. ✅ Analizar estructura de services.astro
2. ✅ Crear fellowship.json con estructura completa
3. ✅ Crear FellowshipContent.tsx con tipos correctos
4. ✅ Crear fellowship.astro con imports correctos
5. ✅ Actualizar footer.json automáticamente
6. ✅ Agregar StarIcon a iconHelper
7. ✅ Aplicar tema café consistentemente
8. ✅ Validar todos los tipos TypeScript
9. ✅ Verificar que todo funciona
10. ✅ Documentar cambios realizados

**Sin Agente (Realidad)**:
1. ⚠️ Crear archivos uno por uno
2. ⚠️ Encontrar errores de tipos después
3. ⚠️ Olvidar actualizar footer
4. ⚠️ Perder archivos y tener que restaurarlos
5. ⚠️ Múltiples iteraciones de corrección
6. ⚠️ Ajustes manuales de colores

### Conclusión

Tener un agente o sistema de IA para crear y ejecutar páginas durante procesos de rediseño es **crítico** para:
- **Eficiencia**: Reduce tiempo de desarrollo significativamente
- **Calidad**: Asegura consistencia y reduce errores
- **Escalabilidad**: Permite crear múltiples páginas rápidamente
- **Mantenibilidad**: Facilita actualizaciones y correcciones

El proceso de creación de la página Fellowship Program demostró que, aunque es posible crear páginas manualmente, tener un agente que coordine todos los archivos, valide tipos, y aplique estilos de manera consistente sería invaluable para procesos de rediseño completos.

### Referencias del Proceso

---

## Problema: Página de Team No Carga - Error de Hidratación y Cache de Vite

### Problema Identificado

**Síntoma**: Al hacer clic en la pestaña "Team" en el menú de navegación, la página mostraba únicamente el mensaje "Loading team members..." y nunca cargaba el contenido. No se mostraban los miembros del equipo, el hero section, ni ningún otro contenido.

**Errores en la consola del navegador**:
1. **HTTP 504 (Outdated Optimize Dep)**: Error al cargar `react-dom.js` - dependencias optimizadas desactualizadas
2. **Error de hidratación de Astro Island**: 
   ```
   [astro-island] Error hydrating
   TypeError: Failed to fetch dynamically imported module: 
   http://localhost:4321/src/components/team/index.ts
   ```

**Causa raíz**: 
- El cache de Vite (`node_modules/.vite`) contenía dependencias optimizadas desactualizadas
- Vite no podía cargar dinámicamente el módulo `src/components/team/index.ts` debido a referencias obsoletas en el cache
- Esto impedía que Astro hidratara correctamente el componente `TeamSection` en el cliente

### Solución Implementada

#### 1. **Limpiar Cache de Vite**

El problema principal era el cache desactualizado de Vite. La solución fue eliminar el directorio de cache:

```powershell
# Eliminar cache de Vite
Remove-Item -Recurse -Force node_modules\.vite
```

**Por qué funciona**: Al eliminar el cache, Vite reconstruye todas las dependencias optimizadas desde cero, eliminando referencias obsoletas que causaban el error 504.

#### 2. **Corrección de Import Faltante**

También se corrigió un import faltante en `TeamSection.tsx`:

```typescript
// Antes (causaba error si no había miembros)
import { TeamHeroCollage } from './TeamHeroCollage';
// TeamHero no estaba importado pero se usaba en el estado de "no miembros"

// Después (corregido)
import { TeamHeroCollage } from './TeamHeroCollage';
import { TeamHero } from './TeamHero'; // ✅ Agregado
```

#### 3. **Mejora en la Estrategia de Carga de Datos**

Se mejoró `teamService.ts` para manejar mejor la carga en cliente vs servidor:

```typescript
async function loadTeamData(): Promise<TeamMember[]> {
  // En servidor (Astro): usar import estático
  if (typeof window === 'undefined') {
    const data = await import('../content/pages/team.json');
    // ...
  }
  
  // En cliente (React): usar fetch desde public
  if (typeof window !== 'undefined') {
    const response = await fetch('/team.json');
    // ...
  }
}
```

**Beneficio**: Esta estrategia asegura que los datos se carguen correctamente tanto en el servidor (durante el build) como en el cliente (durante la hidratación).

### Conceptos Técnicos Clave

#### 1. **Cache de Vite y Optimización de Dependencias**

**Qué es**: Vite optimiza las dependencias de `node_modules` durante el desarrollo para mejorar el rendimiento. Estas dependencias optimizadas se guardan en `node_modules/.vite`.

**Cuándo se desactualiza**:
- Cuando se actualizan dependencias en `package.json`
- Cuando se hacen cambios significativos en el código
- Cuando hay problemas con imports dinámicos
- Después de actualizar Node.js o herramientas de build

**Síntomas de cache desactualizado**:
- Error HTTP 504 (Outdated Optimize Dep)
- Errores de "Failed to fetch dynamically imported module"
- Componentes que no se hidratan correctamente
- Errores de importación que no tienen sentido

**Solución estándar**: Limpiar el cache y reiniciar el servidor de desarrollo.

#### 2. **Hidratación de Componentes en Astro**

**Qué es**: La hidratación es el proceso donde Astro "activa" componentes React en el cliente después de que el HTML inicial se ha renderizado en el servidor.

**Cómo funciona**:
1. Astro renderiza el HTML en el servidor
2. El HTML se envía al navegador
3. Astro carga el JavaScript del componente (usando `client:load`, `client:visible`, etc.)
4. React "hidrata" el componente, conectando el HTML estático con la lógica interactiva

**Qué puede fallar**:
- Si el módulo JavaScript no se puede cargar (error 504, 404, etc.)
- Si hay un error de sintaxis en el componente
- Si hay un problema con imports o dependencias
- Si el cache de Vite está desactualizado

**Resultado del fallo**: El componente no se hidrata, quedando en su estado inicial (por ejemplo, "Loading...").

#### 3. **Import Dinámico vs Estático**

**Import Estático** (en servidor):
```typescript
// Funciona en servidor (Astro build time)
const data = await import('../content/pages/team.json');
```

**Fetch** (en cliente):
```typescript
// Funciona en cliente (navegador)
const response = await fetch('/team.json');
const data = await response.json();
```

**Por qué importar JSON dinámicamente falla en cliente**: 
- Los imports dinámicos de archivos JSON desde `src/` no están disponibles en el navegador
- Los archivos en `src/` se procesan durante el build, no se sirven directamente
- Los archivos en `public/` se copian tal cual y están disponibles vía HTTP

**Solución híbrida**: Usar import en servidor, fetch en cliente.

### Implementación Técnica

#### Proceso de Solución

1. **Identificar el problema**:
   - Revisar errores en consola del navegador
   - Verificar que el componente se está intentando hidratar
   - Confirmar que el módulo existe y está exportado correctamente

2. **Limpiar cache de Vite**:
   ```powershell
   Remove-Item -Recurse -Force node_modules\.vite
   ```

3. **Reiniciar servidor de desarrollo**:
   ```bash
   npm run dev
   ```

4. **Verificar que funciona**:
   - La página carga correctamente
   - Los componentes se hidratan
   - No hay errores en la consola

#### Verificación de Archivos

**Archivo**: `src/components/team/index.ts`
```typescript
export { TeamHero } from './TeamHero';
export { TeamMemberCard } from './TeamMemberCard';
export { TeamGrid } from './TeamGrid';
export { LanguageFilter } from './LanguageFilter';
export { TeamSection } from './TeamSection';
export { TeamMemberModal } from './TeamMemberModal';
```

**Archivo**: `src/pages/team.astro`
```astro
---
import BaseLayout from '@/layouts/BaseLayout.astro';
import { TeamSection } from '@/components/team';
---

<BaseLayout title="Team - Whole Self Counseling">
  <TeamSection client:load photoType="rounded-decorative" variant="v3" />
</BaseLayout>
```

### Lecciones Aprendidas

1. **El cache de Vite puede causar problemas inesperados**
   - Cuando algo no funciona y no tiene sentido, limpiar el cache es el primer paso
   - Especialmente después de actualizar dependencias o hacer cambios grandes

2. **Los errores de hidratación suelen ser problemas de carga de módulos**
   - Si un componente no se hidrata, verificar que el módulo se puede cargar
   - Revisar la consola del navegador para errores de red o importación

3. **Import estático vs fetch según el contexto**
   - Servidor (Astro): usar `import` estático
   - Cliente (React): usar `fetch` desde `public/`
   - Esto asegura que funcione en ambos entornos

4. **Verificar imports faltantes**
   - Si un componente usa otro componente, asegurarse de que está importado
   - Los linters pueden no detectar todos los casos, especialmente en estados condicionales

5. **Reiniciar el servidor después de limpiar cache**
   - Limpiar el cache no es suficiente, hay que reiniciar el servidor
   - Esto permite que Vite reconstruya las dependencias optimizadas

### Cuándo Limpiar el Cache de Vite

**Limpiar cache cuando**:
- ✅ Aparece error "Outdated Optimize Dep" (HTTP 504)
- ✅ Errores de "Failed to fetch dynamically imported module"
- ✅ Componentes no se hidratan correctamente
- ✅ Después de actualizar dependencias en `package.json`
- ✅ Después de cambios significativos en la estructura del proyecto
- ✅ Cuando los errores no tienen sentido y no hay cambios recientes en el código

**No es necesario limpiar cuando**:
- ❌ Solo hay errores de sintaxis en tu código
- ❌ Solo hay errores de lógica en tu código
- ❌ Los errores son claros y tienen sentido (por ejemplo, variable no definida)

### Comandos Útiles

**Limpiar cache de Vite**:
```powershell
# Windows PowerShell
Remove-Item -Recurse -Force node_modules\.vite

# Linux/Mac
rm -rf node_modules/.vite
```

**Reiniciar servidor de desarrollo**:
```bash
# Detener servidor (Ctrl+C)
# Luego reiniciar
npm run dev
```

**Verificar que el cache se limpió**:
```powershell
# Verificar que no existe
Test-Path node_modules\.vite  # Debe retornar False
```

### Referencias Técnicas

- [Vite Dependency Pre-Bundling](https://vitejs.dev/guide/dep-pre-bundling.html)
- [Astro Component Hydration](https://docs.astro.build/en/guides/client-side-scripts/)
- [Astro Client Directives](https://docs.astro.build/en/reference/directives-reference/#client-directives)
- [MDN: Dynamic Imports](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/import)
- [Vite Troubleshooting](https://vitejs.dev/guide/troubleshooting.html)

---

### Referencias del Proceso

- **Página de referencia**: `src/pages/services.astro`
- **Componente de referencia**: `src/components/services/ConditionsSection.tsx`
- **Estructura JSON**: `src/data/content/pages/services.json`
- **Paleta de colores**: `src/styles/theme-colors.ts`
- **Iconos disponibles**: `src/components/services/iconHelper.tsx`

---

**Fecha**: 2024-2025
**Tecnologías**: Astro, React, View Transitions API, CSS Animations, React Portal, Node.js, Vite SSR, Tailwind CSS, Hero Icons
**Estado**: Demo Local - Desarrollo de Estructura
