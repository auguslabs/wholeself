# Análisis Completo de Estructura del Proyecto - Portal de Contenido

**Fecha**: 2025-01-XX  
**Objetivo**: Revisar la estructura del proyecto para preparar el portal de edición de contenido (Fase 1: solo contenido, no estructura)

---

## 📋 Resumen Ejecutivo

El proyecto **Whole Self Counseling** está bien estructurado con una **separación clara entre datos y diseño**. Los archivos JSON están organizados de manera consistente y siguen un patrón definido. La arquitectura actual es **ideal** para implementar un portal de edición de contenido.

### ✅ Fortalezas Identificadas

1. **Separación clara de responsabilidades**: Datos en JSON, lógica en servicios, presentación en componentes
2. **Estructura consistente**: Todos los JSON siguen el mismo patrón (`meta`, `seo`, `content`)
3. **Localización integrada**: Sistema bilingüe (en/es) bien implementado
4. **Tipos TypeScript**: Modelos definidos para validación
5. **Servicios centralizados**: `contentService.ts` y `teamService.ts` facilitan la migración futura a API

### ⚠️ Áreas de Mejora Identificadas

1. **Inconsistencias menores** en algunos JSON (campos opcionales faltantes)
2. **Datos de equipo** en ubicación diferente (`sectionsplan/team/data.json`)
3. **Falta validación** de estructura en tiempo de desarrollo
4. **Metadatos** (`lastUpdated`, `version`) no se actualizan automáticamente

---

## 🏗️ Arquitectura Actual

### Estructura de Directorios

```
src/
├── data/
│   ├── content/
│   │   ├── pages/          # Contenido de páginas específicas
│   │   │   ├── home.json
│   │   │   ├── services.json
│   │   │   ├── investment.json
│   │   │   ├── what-to-expect.json
│   │   │   ├── contact.json
│   │   │   ├── about.json
│   │   │   └── crisis-resources.json
│   │   └── shared/         # Contenido compartido (header, footer)
│   │       ├── header.json
│   │       └── footer.json
│   ├── models/             # Tipos TypeScript
│   │   ├── ContentPage.ts
│   │   └── TeamMember.ts
│   └── services/          # Lógica de acceso a datos
│       ├── contentService.ts
│       └── teamService.ts
├── components/            # Componentes React/Astro (presentación)
├── pages/                 # Páginas Astro (routing)
└── layouts/               # Layouts base

sectionsplan/
└── team/
    └── data.json          # ⚠️ Datos de equipo (ubicación diferente)
```

### Flujo de Datos

```
┌─────────────────┐
│  JSON Files     │  (Fuente de datos)
│  src/data/      │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Services       │  (Lógica de acceso)
│  contentService │  teamService
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Components     │  (Presentación)
│  React/Astro    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Pages          │  (Routing)
│  Astro          │
└─────────────────┘
```

---

## 📊 Revisión Detallada de Archivos JSON

### 1. Estructura Base: `ContentPage`

**Ubicación**: `src/data/models/ContentPage.ts`

**Estructura definida**:
```typescript
interface ContentPage {
  meta: ContentMeta;        // Metadatos (pageId, lastUpdated, version)
  seo: SEOContent;          // SEO (title, description, keywords)
  content: Record<string, any>;  // Contenido específico por página
}
```

**✅ Evaluación**: Excelente. Estructura flexible y extensible.

---

### 2. Archivos JSON de Páginas

#### ✅ `home.json` - **BIEN ESTRUCTURADO**

```json
{
  "meta": { "pageId": "home", "lastUpdated": "...", "version": 1 },
  "seo": { "title": {...}, "description": {...} },
  "content": {
    "hero": { "headline": {...}, "description": {...}, "backgroundImage": "..." },
    "ctaSection": { "title": {...}, "ctas": [...] }
  }
}
```

**Estado**: ✅ Completo y consistente  
**Editable en Portal**: ✅ Sí (textos, imágenes, CTAs)

---

#### ✅ `services.json` - **BIEN ESTRUCTURADO**

**Estructura**:
- `hero`: Título y subtítulo
- `quickJump`: Texto de enlace rápido
- `immigrationEvaluation`: Texto de enlace
- `intro`: Texto introductorio
- `categories`: Array de categorías con servicios
- `conditionsSection`: Sección de condiciones con array de condiciones
- `ctaSection`: Sección de llamadas a la acción

**Estado**: ✅ Completo y bien organizado  
**Editable en Portal**: ✅ Sí (todos los textos, servicios, condiciones)

**Notas**:
- Estructura anidada compleja pero lógica
- Cada servicio tiene `id`, `name`, `description`, `icon`
- Condiciones tienen `id`, `name`, `description`, `icon`, `link`

---

#### ✅ `investment.json` - **BIEN ESTRUCTURADO**

**Estructura**:
- `hero`: Título y subtítulo
- `pricing`: Título y array de sesiones con precios
- `insurance`: Título, descripción, lista de proveedores, modal info
- `paymentOptions`: Título, descripción, array de opciones
- `faq`: Título y array de preguntas/respuestas
- `ctaSection`: CTAs primarios y secundarios

**Estado**: ✅ Completo  
**Editable en Portal**: ✅ Sí (precios, seguros, métodos de pago, FAQs)

**Notas**:
- `providerList` es un array simple de strings (fácil de editar)
- `faq.questions` tiene estructura clara (question/answer con en/es)

---

#### ✅ `what-to-expect.json` - **BIEN ESTRUCTURADO**

**Estructura**:
- `hero`: Título y subtítulo
- `intro`: Texto introductorio
- `sections`: Array de secciones con:
  - `id`, `title`, `icon`
  - `content.intro`
  - `content.items[]` (cada item con `title` y `description`)
- `ctaSection`: Array de CTAs

**Estado**: ✅ Completo y bien estructurado  
**Editable en Portal**: ✅ Sí (todas las secciones, items, textos)

**Notas**:
- Estructura muy clara y jerárquica
- Fácil de editar sección por sección

---

#### ✅ `contact.json` - **BIEN ESTRUCTURADO**

**Estructura**:
- `hero`: Título
- `contactInfo`: 
  - `phone`, `email` (strings simples)
  - `address` (objeto con street, city, state, zip)
  - `socialMedia` (facebook, instagram)
  - `hours` (objeto con días de la semana)
- `form`: 
  - `introText`
  - `fields` (name, email, comment con label y placeholder)
  - `submitButton`

**Estado**: ✅ Completo  
**Editable en Portal**: ✅ Sí (toda la información de contacto, formulario)

---

#### ✅ `about.json` - **BIEN ESTRUCTURADO** (Actualizado)

**Estructura**:
- `hero`: Título, subtítulo, descripción, backgroundImage
- `intro`: Texto introductorio sobre la organización
- `sections`: Array de 4 secciones:
  - `mission`: Misión de la organización
  - `values`: Valores fundamentales (4 items: Abolitionist Values, Decolonial Healing, Social Justice, Community-Centered)
  - `approach`: Enfoque terapéutico (3 items: Culturally-Rooted, Trauma-Informed, Strength-Based)
  - `community`: Comunidades que sirven (3 items: BIPOC, LGBTQIA+, Immigrant Communities)
- `ctaSection`: 3 CTAs (Meet Team, Contact Us, Our Services)

**Estado**: ✅ Completo y bien estructurado  
**Editable en Portal**: ✅ Sí (todas las secciones, valores, enfoques, CTAs)

**Notas**:
- Estructura similar a `what-to-expect.json` con secciones organizadas
- Cada sección tiene `id`, `title`, `icon`, y `content` con items
- Contenido completo sobre misión, valores y enfoque de Whole Self Counseling
- CTAs bien definidos para navegación

---

#### ✅ `crisis-resources.json` - **BIEN ESTRUCTURADO**

**Estructura**:
- `hero`: Título
- `button`: ariaLabel y title
- `categories`: Array de categorías principales:
  - `general-community`: General, Children/Adolescents, Queer Folks, BIPOC Folks
  - `specialized`: Substance Use, Domestic Violence, Elders, Crime
  - Cada categoría tiene `subcategories` con `resources[]`
  - Cada recurso tiene: `name`, `phone`, `url`, `description`, y opcionalmente `hours`, `text`, `tty`, `videoPhone`, etc.

**Estado**: ✅ Completo y muy bien estructurado  
**Editable en Portal**: ✅ Sí (todos los recursos, categorías, información de contacto)

**Notas**:
- Estructura jerárquica clara: categorías → subcategorías → recursos
- Cada recurso tiene información completa (teléfono, URL, descripción, horarios)
- Muy extenso (598 líneas), pero bien organizado
- Ideal para editor con árbol de navegación

---

#### ⚠️ `header.json` - **MINIMALISTA**

```json
{
  "meta": {...},
  "seo": { "title": {"en": "", "es": ""}, ... },
  "content": {
    "menu": {
      "label": {"en": "menu", "es": "menú"},
      "closeLabel": {"en": "✕", "es": "✕"}
    }
  }
}
```

**Estado**: ⚠️ Muy básico  
**Recomendación**: Considerar agregar más contenido editable si el menú tiene textos dinámicos

---

#### ✅ `footer.json` - **BIEN ESTRUCTURADO**

**Estructura**:
- `companyInfo`: name, tagline
- `copyright`: Texto
- `navigation`: title
- `resources`: title, items[] (con label y link)

**Estado**: ✅ Completo  
**Editable en Portal**: ✅ Sí (toda la información del footer)

---

### 3. Datos de Equipo

#### ⚠️ `sectionsplan/team/data.json` - **UBICACIÓN DIFERENTE**

**Estructura**:
```json
{
  "team_members": [
    {
      "id": "member-1",
      "photoFilename": "Alexandria-Rakes",
      "firstName": "...",
      "lastName": "...",
      "credentials": "...",
      "pronouns": "...",
      "role": "...",
      "language": "english" | "spanish" | "bilingual",
      "descriptionEn": "...",
      "descriptionEs": "...",
      "displayOrder": 1
    }
  ]
}
```

**Estado**: ⚠️ Ubicación inconsistente  
**Problemas identificados**:
1. Está en `sectionsplan/team/` en lugar de `src/data/content/`
2. El servicio `teamService.ts` busca en dos lugares:
   - `/team_members_info.json` (en public, no existe)
   - `sectionsplan/team/data.json` (fallback)
3. No sigue el patrón `ContentPage` (no tiene `meta`, `seo`)

**Recomendaciones**:
1. **Corto plazo**: Mantener estructura actual pero documentar bien
2. **Mediano plazo**: Mover a `src/data/content/team.json` y seguir patrón `ContentPage`
3. **Portal**: Crear módulo específico para edición de equipo (alta prioridad)

---

## 🔍 Análisis de Separación Datos/Diseño

### ✅ Separación Exitosa

**Datos (JSON)**:
- ✅ Ubicados en `src/data/content/`
- ✅ Sin referencias a componentes
- ✅ Sin lógica de presentación
- ✅ Estructura pura de datos

**Diseño (Componentes)**:
- ✅ Componentes en `src/components/`
- ✅ Reciben datos vía props
- ✅ No contienen datos hardcodeados
- ✅ Usan servicios para cargar datos

**Ejemplo de Separación Correcta**:

```typescript
// ✅ BIEN: Componente recibe datos
// src/pages/services.astro
const servicesData = await getPageContent('services');
const hero = servicesData.content.hero;

// ✅ BIEN: Usa función helper para localización
const title = getLocalizedText(hero.title, lang);
```

```json
// ✅ BIEN: JSON solo tiene datos
// src/data/content/pages/services.json
{
  "content": {
    "hero": {
      "title": {
        "en": "Our Services",
        "es": "Nuestros Servicios"
      }
    }
  }
}
```

### ⚠️ Áreas de Mejora

1. **Validación de Estructura**: No hay validación automática de que los JSON sigan el esquema
2. **Metadatos**: `lastUpdated` y `version` no se actualizan automáticamente
3. **Referencias**: Algunos campos tienen referencias a rutas/links que podrían validarse

---

## 🎯 Evaluación para Portal de Contenido

### ✅ Factibilidad: ALTA

El proyecto está **perfectamente preparado** para un portal de edición de contenido porque:

1. **Separación clara**: Datos y diseño están separados
2. **Estructura consistente**: Todos los JSON siguen el mismo patrón
3. **Servicios centralizados**: Fácil agregar funciones de escritura
4. **Tipos definidos**: TypeScript ayuda con validación

### 📋 Módulos del Portal (Fase 1)

#### 1. **Editor de Páginas** ✅
- Editar contenido de `home.json`, `services.json`, `investment.json`, etc.
- Editor de texto enriquecido para campos de texto
- Selector de idioma (en/es)
- Vista previa en tiempo real

#### 2. **Editor de Equipo** ✅ (ALTA PRIORIDAD)
- CRUD completo de miembros del equipo
- Subida de imágenes (fotos)
- Editor de descripciones (en/es)
- Reordenamiento (drag & drop para `displayOrder`)
- Campos: nombre, credenciales, pronombres, rol, idioma, descripciones

#### 3. **Editor de Contenido Compartido** ✅
- Footer: información de empresa, links, recursos
- Header: textos del menú (si se expande)

#### 4. **Gestor de Imágenes** ✅
- Subida de imágenes para:
  - Fotos de equipo (`/public/square/`, `/public/rounded-white/`, etc.)
  - Imágenes de banner (`banner-hero-section.webp`, etc.)
  - Logos de seguros (`/public/logos/insurance/`)
- Conversión automática a WebP
- Optimización de imágenes

### 🔒 Restricciones Fase 1

**NO editable en Fase 1**:
- ❌ Estructura de JSON (agregar/eliminar campos)
- ❌ Crear nuevas páginas
- ❌ Modificar rutas/links estructurales
- ❌ Cambiar IDs de servicios/condiciones
- ❌ Modificar estructura de componentes

**SÍ editable en Fase 1**:
- ✅ Todos los textos (títulos, descripciones, etc.)
- ✅ Imágenes (banners, fotos de equipo)
- ✅ Precios y tarifas
- ✅ Lista de seguros aceptados
- ✅ FAQs (preguntas y respuestas)
- ✅ Información de contacto
- ✅ Horarios
- ✅ Redes sociales

---

## 📝 Recomendaciones Técnicas

### ✅ 1. Validación de Esquemas - **IMPLEMENTADO**

**Estado**: ✅ Completado  
**Archivo**: `src/data/validators/contentSchemas.ts`

**Implementación**: Validación con Zod

```typescript
// Esquemas implementados
import { safeValidateContentPage, validateContentPage } from '@/data/validators/contentSchemas';

// Validación segura (no lanza error)
const validation = safeValidateContentPage(content);
if (!validation.success) {
  console.error('Errores:', validation.error);
}

// Validación estricta (lanza error si falla)
const validated = validateContentPage(content);
```

**Esquemas disponibles**:
- `ContentPageSchema` - Estructura completa de página
- `TeamMemberSchema` - Miembro del equipo
- `TeamDataSchema` - Datos completos de equipo
- `LocalizedTextSchema` - Textos bilingües
- `SEOContentSchema` - Contenido SEO
- `ContentMetaSchema` - Metadatos

**Beneficios implementados**:
- ✅ Detecta errores antes de guardar
- ✅ Autocompletado mejorado en editores
- ✅ Documentación automática de estructura
- ✅ Integrado en `contentService.ts` con validación automática

---

### ✅ 2. Actualización Automática de Metadatos - **IMPLEMENTADO**

**Estado**: ✅ Completado  
**Archivo**: `src/data/utils/metadataUtils.ts`

**Implementación**: Funciones para gestión automática de metadatos

```typescript
import { updateContentMetadata, updateContentLastUpdated } from '@/data/services/contentService';

// Actualiza lastUpdated y version
const updated = updateContentMetadata(content);

// Solo actualiza lastUpdated (sin incrementar version)
const minorUpdate = updateContentLastUpdated(content);
```

**Funciones disponibles**:
- `updateMetadata()` - Actualiza `lastUpdated` y `version`
- `updateLastUpdated()` - Solo actualiza fecha
- `incrementVersion()` - Solo incrementa versión
- `createInitialMetadata()` - Crea metadatos iniciales

**Integración**: ✅ Exportado desde `contentService.ts`

---

### ✅ 3. Normalización de Datos de Equipo - **IMPLEMENTADO**

**Estado**: ✅ Completado  
**Archivo**: `src/data/content/pages/team.json`

**Estructura normalizada**:

```json
{
  "meta": {
    "pageId": "team",
    "lastUpdated": "2024-01-15T10:00:00Z",
    "version": 1
  },
  "seo": {
    "title": { "en": "Team - Whole Self Counseling", "es": "Equipo - Whole Self Counseling" },
    "description": { "en": "...", "es": "..." }
  },
  "content": {
    "team_members": [...]
  }
}
```

**Cambios realizados**:
- ✅ Archivo movido a `src/data/content/pages/team.json`
- ✅ Estructura normalizada con `meta`, `seo`, `content`
- ✅ `teamService.ts` actualizado para usar nueva estructura
- ✅ Mantiene compatibilidad con fallbacks

---

### ✅ 4. Sistema de Versiones - **IMPLEMENTADO**

**Estado**: ✅ Completado  
**Archivo**: `src/data/utils/versionHistory.ts`

**Implementación**: Sistema completo de historial de versiones

```typescript
import { saveContentVersion, getVersionHistory, getVersionDiff } from '@/data/services/contentService';

// Guardar versión antes de actualizar
await saveContentVersion(pageId, content, 'usuario@email.com', 'Actualización de servicios');

// Obtener historial completo
const history = await getVersionHistory(pageId);

// Obtener versión específica
const version = await getVersion(pageId, 5);

// Comparar dos versiones
const diff = await getVersionDiff(pageId, 3, 5);
// Retorna: { added: [...], removed: [...], modified: [...] }
```

**Funcionalidades**:
- ✅ Guardar versiones anteriores automáticamente
- ✅ Historial persistente en `.content-history/`
- ✅ Obtener versiones específicas
- ✅ Comparar versiones (diff)
- ✅ Límite de 50 versiones por archivo (configurable)
- ✅ Metadatos: autor, comentario, timestamp

**Uso en Portal**:
```typescript
// Antes de guardar cambios
await saveContentVersion(pageId, currentContent, author, 'Backup antes de cambios');
const updated = updateContentMetadata(editedContent);
await saveContent(pageId, updated);
```

---

### ✅ 5. Validación de Referencias - **IMPLEMENTADO**

**Estado**: ✅ Completado  
**Archivo**: `src/data/utils/linkValidator.ts`

**Implementación**: Validación completa de links y rutas

```typescript
import { validateContentLinks } from '@/data/services/contentService';

// Validar todos los links en un ContentPage
const validation = validateContentLinks(content);

if (!validation.valid) {
  console.error('Links inválidos:', validation.invalidLinks);
  // validation.invalidLinks contiene:
  // [{ path: 'content.ctaSection.ctas[0].link', link: '/invalid', reason: 'Ruta interna no encontrada' }]
}
```

**Funcionalidades**:
- ✅ Extrae todos los links de un ContentPage (recursivo)
- ✅ Valida rutas internas contra lista de rutas válidas
- ✅ Valida URLs externas (http, https, mailto)
- ✅ Reporta links inválidos con ruta exacta en el JSON
- ✅ Soporta links en campos: `link`, `href`, `url`, `src`
- ✅ Detecta URLs en strings de texto

**Rutas válidas conocidas**:
- Rutas estáticas: `/`, `/home`, `/services`, `/contact`, etc.
- Rutas dinámicas: `/services/*`, `/contact/*`
- Expandible: `addValidRoute(route)` para agregar rutas dinámicas

**Resultado de validación**:
```typescript
{
  valid: boolean,
  invalidLinks: Array<{
    path: string,      // Ruta en el JSON (ej: "content.ctaSection.ctas[0].link")
    link: string,      // Link inválido
    reason: string     // Razón del error
  }>,
  validLinks: string[] // Links válidos encontrados
}
```

---

## 📊 Resumen de Implementación

| Recomendación | Estado | Archivo | Funciones Principales |
|---------------|:------:|---------|----------------------|
| 1. Validación de Esquemas | ✅ | `contentSchemas.ts` | `validateContentPage()`, `safeValidateContentPage()` |
| 2. Actualización de Metadatos | ✅ | `metadataUtils.ts` | `updateMetadata()`, `updateLastUpdated()` |
| 3. Normalización de Equipo | ✅ | `team.json` | Estructura normalizada |
| 4. Sistema de Versiones | ✅ | `versionHistory.ts` | `saveVersion()`, `getVersionDiff()` |
| 5. Validación de Referencias | ✅ | `linkValidator.ts` | `validateLinks()`, `validateLinksInObject()` |

**Todas las recomendaciones técnicas han sido implementadas.** ✅

---

## 🚀 Plan de Implementación del Portal

### Fase 1: Portal Básico de Contenido (Actual)

**Objetivo**: Permitir edición de textos e imágenes sin modificar estructura

**Módulos**:
1. ✅ Editor de páginas (textos)
2. ✅ Editor de equipo (CRUD + imágenes)
3. ✅ Gestor de imágenes
4. ✅ Editor de contenido compartido

**Tecnologías sugeridas**:
- **Backend**: Node.js + Express o Astro API Routes
- **Base de datos**: JSON files (temporal) o SQLite (para historial)
- **Frontend**: React + TypeScript
- **Editor**: Tiptap o Slate (rich text editor)
- **Autenticación**: JWT o OAuth

### Fase 2: Validación y Estructura (Futuro)

**Objetivos**:
- Validación de esquemas
- Editor de estructura (agregar/eliminar campos)
- Creación de nuevas páginas
- Sistema de versiones completo

### Fase 3: Migración a API (Futuro)

**Objetivos**:
- Migrar de JSON files a base de datos
- API REST completa
- Sincronización en tiempo real
- Multi-usuario con permisos

---

## ✅ Checklist de Preparación

### Estructura de Datos
- [x] JSON bien organizados
- [x] Separación datos/diseño clara
- [x] Tipos TypeScript definidos
- [x] Servicios centralizados
- [x] Validación de esquemas ✅ **IMPLEMENTADO**
- [x] Normalización de datos de equipo ✅ **IMPLEMENTADO**

### Recomendaciones Técnicas
- [x] Validación de esquemas con Zod ✅
- [x] Actualización automática de metadatos ✅
- [x] Normalización de datos de equipo ✅
- [x] Sistema de versiones (historial) ✅
- [x] Validación de referencias/links ✅

### Documentación
- [x] Estructura documentada
- [x] Patrones identificados
- [ ] Guía de edición para clientes (pendiente)
- [ ] API documentation (pendiente)

### Portal
- [ ] Backend API (pendiente)
- [ ] Frontend del portal (pendiente)
- [ ] Autenticación (pendiente)
- [ ] Editor de contenido (pendiente)
- [ ] Gestor de imágenes (pendiente)

---

## 📊 Resumen de Archivos JSON

| Archivo | Estado | Completo | Editable Portal | Notas |
|---------|--------|----------|-----------------|-------|
| `home.json` | ✅ | ✅ | ✅ | Estructura simple y clara |
| `services.json` | ✅ | ✅ | ✅ | Estructura compleja pero bien organizada |
| `investment.json` | ✅ | ✅ | ✅ | Múltiples secciones, bien estructurado |
| `what-to-expect.json` | ✅ | ✅ | ✅ | Estructura jerárquica clara |
| `contact.json` | ✅ | ✅ | ✅ | Información de contacto completa |
| `about.json` | ✅ | ✅ | ✅ | Completo: hero, intro, 4 secciones (misión, valores, enfoque, comunidad), CTAs |
| `crisis-resources.json` | ✅ | ✅ | ✅ | Estructura compleja pero bien organizada, recursos de crisis |
| `header.json` | ⚠️ | ⚠️ | ⚠️ | Muy básico, considerar expandir |
| `footer.json` | ✅ | ✅ | ✅ | Completo y bien estructurado |
| `team/data.json` | ⚠️ | ✅ | ✅ | Ubicación diferente, normalizar |

**Leyenda**:
- ✅ = Excelente / Completo
- ⚠️ = Necesita atención
- ❓ = No revisado en detalle

---

## 🎓 Conclusiones

### ✅ El proyecto está LISTO para el portal

La estructura actual es **excelente** para implementar un portal de edición de contenido. La separación entre datos y diseño es clara, los JSON están bien organizados, y los servicios están preparados para extensión.

### 🎯 Próximos Pasos Recomendados

1. **Inmediato**: Crear prototipo del portal con editor básico
2. **Corto plazo**: Implementar editor de equipo (alta prioridad)
3. **Mediano plazo**: Agregar validación de esquemas
4. **Largo plazo**: Migrar a base de datos con API

### 💡 Recomendación Final

**Proceder con confianza** con la implementación del portal. La arquitectura actual facilita enormemente esta tarea. El único ajuste recomendado es normalizar la ubicación de los datos de equipo, pero esto no es bloqueante para la Fase 1.

---

**Documento generado por**: Análisis Automático de Estructura  
**Última actualización**: 2025-01-XX
