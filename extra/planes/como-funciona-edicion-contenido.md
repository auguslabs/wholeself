# Cómo Funciona la Edición de Contenido - Flujo Completo

## Resumen
Este documento explica cómo funciona el sistema de edición de contenido mediante archivos JSON, separando completamente el contenido del diseño.

---

## 1. Ubicación de los Archivos JSON

```
src/data/content/
├── pages/
│   ├── home.json          ← TÚ EDITAS AQUÍ
│   ├── services.json      ← TÚ EDITAS AQUÍ
│   ├── investment.json    ← TÚ EDITAS AQUÍ
│   └── contact.json       ← TÚ EDITAS AQUÍ
└── shared/
    ├── footer.json        ← TÚ EDITAS AQUÍ
    └── header.json        ← TÚ EDITAS AQUÍ
```

**Importante:** Todos los archivos JSON están en `src/data/content/`. Esta es la única carpeta que necesitas editar para cambiar el contenido del sitio.

---

## 2. Ejemplo: Cómo Editarías el Contenido

### Archivo: `src/data/content/pages/home.json`

```json
{
  "content": {
    "ctaSection": {
      "ctas": [
        {
          "title": {
            "en": "I need Help",           ← Cambias esto
            "es": "Necesito Ayuda"         ← Cambias esto
          },
          "description": {
            "en": "Take the first step...", ← Cambias esto
            "es": "Da el primer paso..."     ← Cambias esto
          }
        }
      ]
    }
  }
}
```

**Proceso:**
1. Abres el archivo JSON en tu editor
2. Cambias los textos en inglés (`"en"`) o español (`"es"`)
3. Guardas el archivo
4. Recargas la página en el navegador
5. ¡Los cambios aparecen automáticamente!

---

## 3. Cómo se Carga en los Componentes

### Antes (Hardcodeado - NO HACER ASÍ)

```astro
<!-- CTASection.astro - ANTES -->
<h2>I need Help</h2>
<p>"Take the first step at your own pace"</p>
```

**Problema:** Para cambiar el texto, necesitas editar código HTML.

### Después (Desde JSON - ASÍ ES COMO FUNCIONA)

```astro
---
// CTASection.astro - DESPUÉS
import { getPageContent, getLocalizedText } from '@/data/services/contentService';

// 1. Cargar datos del JSON
const pageData = await getPageContent('home');

// 2. Detectar idioma (por ahora inglés por defecto, luego por URL)
const lang = 'en'; // o 'es'

// 3. Extraer la sección que necesitas
const ctaSection = pageData.content.ctaSection;
---

<section>
  {ctaSection.ctas.map((cta) => (
    <a href={cta.link}>
      <h2>{getLocalizedText(cta.title, lang)}</h2>
      <p>{getLocalizedText(cta.description, lang)}</p>
    </a>
  ))}
</section>
```

**Ventaja:** El texto viene del JSON. Solo editas el JSON, no el código.

---

## 4. Flujo Visual Completo

```
┌─────────────────────────────────────┐
│  1. TÚ EDitas el JSON               │
│     src/data/content/pages/home.json │
│     Cambias textos, títulos, etc.    │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  2. Servicio carga el JSON          │
│     contentService.ts               │
│     Lee el archivo y lo parsea      │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  3. Componente recibe los datos     │
│     CTASection.astro                 │
│     Usa getPageContent('home')      │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  4. Se renderiza en la página       │
│     Los textos aparecen             │
│     según el idioma detectado      │
└─────────────────────────────────────┘
```

---

## 5. Proceso Paso a Paso Detallado

### Paso 1: Editas el JSON

```json
// src/data/content/pages/home.json
{
  "content": {
    "ctaSection": {
      "ctas": [
        {
          "title": {
            "en": "I need Help",
            "es": "Necesito Ayuda"
          },
          "description": {
            "en": "Take the first step at your own pace",
            "es": "Da el primer paso a tu propio ritmo"
          }
        }
      ]
    }
  }
}
```

**Qué haces:**
- Abres el archivo `home.json`
- Cambias el texto en `"en"` (inglés) o `"es"` (español)
- Guardas el archivo

### Paso 2: El Servicio lo Carga

```typescript
// src/data/services/contentService.ts
export async function getPageContent(pageId: string) {
  // Astro puede importar JSON directamente
  const data = await import(`@/data/content/pages/${pageId}.json`);
  return data.default; // Retorna el objeto JSON completo
}
```

**Qué hace:**
- El servicio lee el archivo JSON
- Lo convierte en un objeto JavaScript
- Lo retorna para que los componentes lo usen

### Paso 3: El Componente lo Usa

```astro
---
// En cualquier componente .astro
import { getPageContent, getLocalizedText } from '@/data/services/contentService';

const data = await getPageContent('home');
const lang = 'en'; // Se detectará automáticamente después
const cta = data.content.ctaSection.ctas[0];
---

<h2>{getLocalizedText(cta.title, lang)}</h2>
<p>{getLocalizedText(cta.description, lang)}</p>
```

**Qué hace:**
- El componente carga los datos usando `getPageContent('home')`
- Extrae la sección que necesita (`ctaSection.ctas[0]`)
- Usa `getLocalizedText()` para obtener el texto en el idioma correcto
- Lo muestra en la página

### Paso 4: Se Refleja en la Página

- Al guardar el JSON y recargar, los cambios aparecen
- No necesitas tocar código HTML/componentes
- Solo editas el JSON

---

## 6. Detección de Idioma (Futuro)

El idioma se detectará de dos formas:

### Opción 1: Por URL
```typescript
// Si la URL es /es/... entonces español
const lang = Astro.url.pathname.includes('/es') ? 'es' : 'en';
```

### Opción 2: Por Navegador
```typescript
// Detecta el idioma del navegador
const browserLang = navigator.language.startsWith('es') ? 'es' : 'en';
```

**Por ahora:** Se usará inglés (`'en'`) por defecto hasta implementar la detección automática.

---

## 7. Ejemplo Completo: Página Home

### Archivo JSON que Editas

```json
{
  "content": {
    "hero": {
      "headline": {
        "en": "A safe space for your healing journey",
        "es": "Un espacio seguro para tu viaje de sanación"
      },
      "description": {
        "en": "WholeSelf Counseling is built on...",
        "es": "WholeSelf Counseling se basa en..."
      }
    },
    "ctaSection": {
      "ctas": [
        {
          "title": {
            "en": "I need Help",
            "es": "Necesito Ayuda"
          },
          "description": {
            "en": "Take the first step at your own pace",
            "es": "Da el primer paso a tu propio ritmo"
          },
          "link": "/contact/i-need-help"
        }
      ]
    }
  }
}
```

### Componente que lo Usa

```astro
---
// index.astro
import { getPageContent, getLocalizedText } from '@/data/services/contentService';

const homeData = await getPageContent('home');
const lang = 'en';
---

<section>
  <h1>{getLocalizedText(homeData.content.hero.headline, lang)}</h1>
  <p>{getLocalizedText(homeData.content.hero.description, lang)}</p>
</section>
```

---

## 8. Ventajas del Sistema

### ✅ Separación de Responsabilidades
- **Diseño:** En componentes (`.astro`, `.tsx`)
- **Contenido:** En JSON (`*.json`)
- **Lógica:** En servicios (`contentService.ts`)

### ✅ Fácil Edición
- Solo editas JSON, no código
- No necesitas saber programación
- Cambios inmediatos al recargar

### ✅ Multiidioma
- Estructura lista para inglés y español
- Fácil agregar más idiomas después

### ✅ Migración Futura
- Fácil pasar a base de datos
- La estructura JSON se mapea directamente a tablas

### ✅ Versionado
- Puedes agregar `version` y `lastUpdated` en el JSON
- Control de cambios

---

## 9. Qué Editas TÚ vs Qué Edita el Desarrollador

### TÚ Editas (Contenido)
- ✅ `src/data/content/pages/*.json` - Todos los textos de las páginas
- ✅ `src/data/content/shared/*.json` - Footer, header, contenido compartido
- ✅ Textos, títulos, párrafos, descripciones
- ✅ Rutas de imágenes (cuando se implemente upload)

### Desarrollador Edita (Diseño y Lógica)
- ❌ Componentes `.astro` / `.tsx` - Diseño y estructura
- ❌ Servicios - Lógica de carga de datos
- ❌ Estilos - CSS/Tailwind
- ❌ Configuración del proyecto

**Regla de oro:** Si es texto que el cliente necesita cambiar, va en JSON. Si es diseño o lógica, va en código.

---

## 10. Proceso de Actualización (Resumen)

```
1. Abres: src/data/content/pages/home.json
   ↓
2. Cambias el texto en "en" o "es"
   ↓
3. Guardas el archivo (Ctrl+S)
   ↓
4. Recargas la página en el navegador (F5)
   ↓
5. ¡Los cambios aparecen automáticamente!
```

**Nota:** Si estás en desarrollo local, el servidor de Astro recarga automáticamente. Si está en producción, necesitarás hacer un build y deploy.

---

## 11. Estructura de un JSON Típico

```json
{
  "meta": {
    "pageId": "home",
    "lastUpdated": "2024-01-15T10:00:00Z",
    "version": 1
  },
  "seo": {
    "title": {
      "en": "Home - WholeSelf Counseling",
      "es": "Inicio - WholeSelf Counseling"
    },
    "description": {
      "en": "A safe space for your healing journey",
      "es": "Un espacio seguro para tu viaje de sanación"
    }
  },
  "content": {
    "hero": {
      "headline": {
        "en": "...",
        "es": "..."
      }
    },
    "sections": [
      {
        "id": "section-1",
        "title": {
          "en": "...",
          "es": "..."
        }
      }
    ]
  }
}
```

**Estructura estándar:**
- `meta`: Información sobre el archivo (no editable normalmente)
- `seo`: Metadatos para buscadores
- `content`: Todo el contenido editable de la página

---

## 12. Funciones Útiles del Servicio

### `getPageContent(pageId)`
Carga el contenido de una página específica.

```typescript
const homeData = await getPageContent('home');
```

### `getSharedContent(type)`
Carga contenido compartido (footer, header).

```typescript
const footerData = await getSharedContent('footer');
```

### `getLocalizedText(text, language)`
Obtiene el texto en el idioma correcto.

```typescript
const title = getLocalizedText(
  { en: "Hello", es: "Hola" },
  'es'
); // Retorna "Hola"
```

---

## 13. Preguntas Frecuentes

### ¿Puedo agregar nuevas secciones?
Sí, pero necesitas que el desarrollador actualice el componente para que use la nueva sección del JSON.

### ¿Qué pasa si olvido poner "en" o "es"?
El sistema usará inglés por defecto si falta algún idioma.

### ¿Puedo usar HTML en los textos?
Por ahora no, solo texto plano. Si necesitas formato, se puede implementar Markdown después.

### ¿Cómo cambio una imagen?
Por ahora, cambias la ruta en el JSON. En el futuro, habrá un sistema de upload en el panel admin.

### ¿Los cambios se guardan automáticamente?
No, debes guardar el archivo JSON manualmente. En el futuro, el panel admin guardará automáticamente.

---

## 14. Próximos Pasos

1. ✅ Crear estructura de carpetas `src/data/content/`
2. ✅ Crear archivos JSON de ejemplo para cada página
3. ✅ Crear servicio `contentService.ts`
4. ⏳ Refactorizar componentes para usar JSON
5. ⏳ Implementar detección automática de idioma
6. ⏳ Crear panel de administración (futuro)

---

## Notas Finales

- **Siempre edita ambos idiomas** (`en` y `es`) para mantener consistencia
- **Guarda frecuentemente** el archivo JSON mientras editas
- **Usa un editor con validación JSON** (VS Code, por ejemplo) para evitar errores
- **No modifiques la estructura** del JSON, solo el contenido de los textos

---

**Última actualización:** 2024-01-15
**Versión del documento:** 1.0
