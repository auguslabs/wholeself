# Estrategia: Panel de Administración "Easy to Change"

**Objetivo**: Crear un panel de administración escalable, reutilizable y con excelente UX para que los clientes puedan editar fácilmente el contenido de sus sitios web.

**Nombre del Panel**: **Easy to Change**

---

## 🎯 Visión General

### Propósito

Crear un sistema de administración de contenido que:
- ✅ Sea **fácil de usar** para clientes sin conocimientos técnicos
- ✅ Ofrezca **experiencia de usuario excepcional**
- ✅ Sea **escalable** y reutilizable en múltiples proyectos
- ✅ Permita edición **intuitiva** de contenido
- ✅ Mantenga **separación de datos e interfaz** (arquitectura limpia)

### Concepto Base

**Estructura**: `Páginas → Secciones`

- Un sitio web tiene **múltiples páginas** (Home, Services, Contact, etc.)
- Cada página tiene **múltiples secciones** (Hero, About, CTA, etc.)
- El panel permite navegar: Página → Sección → Editar contenido

---

## 🏗️ Arquitectura del Panel

### Estructura de Datos

```
Sitio Web
├── Página 1 (Home)
│   ├── Sección 1 (Hero)
│   ├── Sección 2 (About)
│   └── Sección 3 (CTA)
├── Página 2 (Services)
│   ├── Sección 1 (Hero)
│   ├── Sección 2 (Services List)
│   └── Sección 3 (FAQ)
└── Página 3 (Contact)
    ├── Sección 1 (Hero)
    └── Sección 2 (Form)
```

### Separación de Responsabilidades

**Panel Central (Easy to Change)**:
- Autenticación
- Navegación entre proyectos
- Gestión de usuarios
- Configuración general

**Panel por Proyecto**:
- Edición de contenido específico del proyecto
- Estructura de páginas y secciones
- Gestión de imágenes del proyecto
- Vista previa del sitio

---

## 🎨 Diseño de Interfaz - Versión Escritorio

### Layout: 2 Filas × 2 Columnas

```
┌─────────────────────────────────────────────────────────┐
│  [Logo]  │         Nombre del Proyecto                  │
│  (1/5)   │              (4/5)                           │
│          │                                               │
├──────────┼───────────────────────────────────────────────┤
│          │                                               │
│  Páginas │         Contenido Editable                    │
│  (1/5)   │              (4/5)                           │
│          │                                               │
│  • Home  │  [Sección seleccionada se muestra aquí]      │
│  • Serv. │                                               │
│  • What  │                                               │
│  • Inv.  │                                               │
│  • Team  │                                               │
│  • Cont. │                                               │
│          │                                               │
└──────────┴───────────────────────────────────────────────┘
```

### Primera Fila

**Columna 1 (1/5 del ancho) - Logo**:
- Logo "Easy to Change" en escala de grises/blanco y negro
- Posición: Esquina superior izquierda
- Tamaño: Cuadrado pequeño, discreto
- Funcionalidad: Click para volver al dashboard principal (si hay múltiples proyectos)

**Columna 2 (4/5 del ancho) - Nombre del Proyecto**:
- Nombre del sitio web actual
- Ejemplo: "Whole Self Counseling"
- Estilo: Grande, destacado
- Posición: Centrado o alineado a la izquierda

### Segunda Fila

**Columna 1 (1/5 del ancho) - Navegación de Páginas**:
- Lista vertical de páginas editables
- Orden: Home, Services, What to Expect, Investment, Team, Contact
- Cada elemento es clickeable
- Estado activo: Resaltar página seleccionada
- Scroll si hay muchas páginas

**Columna 2 (4/5 del ancho) - Área de Edición**:
- Muestra el contenido de la página/sección seleccionada
- Formularios de edición organizados por secciones
- Vista previa en tiempo real (opcional)
- Botones: Guardar, Cancelar, Vista Previa

---

## 📐 Especificaciones de Diseño

### Dimensiones

**Desktop (≥ 1024px)**:
- Columna izquierda (logo + navegación): `20%` (1/5)
- Columna derecha (nombre + contenido): `80%` (4/5)
- Altura: `100vh` (pantalla completa)

**Tablet (768px - 1023px)**:
- Layout adaptativo (considerar sidebar colapsable)

**Móvil (< 768px)**:
- Layout completamente diferente (hamburger menu, navegación vertical)

### Colores y Estilos

**Tema del Panel**:
- Fondo: Gris claro (`bg-gray-50` o `bg-gray-100`)
- Sidebar izquierdo: Blanco o gris muy claro
- Área de contenido: Blanco
- Acentos: Colores del proyecto o colores neutros del panel

**Logo "Easy to Change"**:
- Escala de grises o blanco y negro
- Tamaño: ~40-50px en desktop
- Posición: Padding superior e izquierdo

---

## 🔄 Flujo de Usuario

### 1. Login
```
Usuario → Ingresa credenciales → Panel principal
```

### 2. Seleccionar Página
```
Panel → Click en "Home" → Carga secciones de Home
```

### 3. Seleccionar Sección
```
Página → Click en sección → Muestra formulario de edición
```

### 4. Editar Contenido
```
Formulario → Editar campos → Guardar → Actualizar sitio
```

---

## 📦 Estructura de Archivos del Panel

```
src/
├── components/
│   └── admin/
│       ├── EasyToChangeLogo.tsx          # Logo del panel
│       ├── ProjectHeader.tsx              # Nombre del proyecto (columna 2, fila 1)
│       ├── PageNavigation.tsx             # Lista de páginas (columna 1, fila 2)
│       ├── ContentEditor.tsx               # Área de edición (columna 2, fila 2)
│       ├── SectionEditor.tsx              # Editor de sección individual
│       ├── FieldEditor.tsx                # Editor de campo individual
│       └── AdminLayout.tsx                # Layout principal del panel
├── pages/
│   └── admin/
│       ├── login.astro                    # Login (ya implementado)
│       ├── dashboard.astro                # Panel principal
│       └── editor/
│           └── [pageId].astro            # Editor de página específica
└── data/
    └── models/
        └── Project.ts                     # Modelo de proyecto
```

---

## 🎯 Funcionalidades Clave

### 1. Navegación de Páginas

**Componente**: `PageNavigation.tsx`

**Características**:
- Lista vertical de páginas
- Iconos opcionales para cada página
- Indicador de página activa
- Contador de cambios no guardados (opcional)
- Orden configurable por proyecto

**Estructura de datos**:
```typescript
interface Page {
  id: string;
  name: string;
  icon?: string;
  sections: Section[];
  order: number;
}
```

### 2. Editor de Contenido

**Componente**: `ContentEditor.tsx`

**Características**:
- Muestra todas las secciones de la página seleccionada
- Cada sección es colapsable/expandible
- Campos editables según tipo (texto, imagen, lista, etc.)
- Validación en tiempo real
- Vista previa opcional

**Estructura de datos**:
```typescript
interface Section {
  id: string;
  name: string;
  type: 'hero' | 'text' | 'list' | 'cta' | 'gallery' | etc.;
  fields: Field[];
  order: number;
}
```

### 3. Tipos de Campos Editables

**Textos**:
- Texto simple
- Texto largo (textarea)
- Texto enriquecido (rich text editor)
- Texto localizado (en/es)

**Medios**:
- Imagen (upload + preview)
- Video (URL o embed)
- Icono (selector)

**Estructurados**:
- Lista de items
- Tabla
- Objeto anidado

**Especiales**:
- Link/URL
- Email
- Teléfono
- Fecha

---

## 🔌 Integración con Proyectos

### Configuración por Proyecto

**Archivo**: `src/data/config/project.json` (por proyecto)

```json
{
  "projectId": "wholeself",
  "name": "Whole Self Counseling",
  "logo": "/logo.svg",
  "pages": [
    {
      "id": "home",
      "name": "Home",
      "icon": "home",
      "order": 1
    },
    {
      "id": "services",
      "name": "Services",
      "icon": "services",
      "order": 2
    }
  ],
  "structure": {
    "home": {
      "sections": [
        {
          "id": "hero",
          "name": "Hero Section",
          "type": "hero"
        }
      ]
    }
  }
}
```

### Mapeo de Contenido

El panel debe mapear automáticamente:
- Páginas del proyecto → Navegación del panel
- Secciones de cada página → Editor de secciones
- Campos de cada sección → Formularios de edición

---

## 🚀 Fases de Implementación

### Fase 1: Estructura Base (Actual)

- ✅ Login funcional
- ✅ Autenticación básica
- ⏳ Dashboard con layout 2x2
- ⏳ Navegación de páginas

### Fase 2: Editor Básico

- Editor de texto simple
- Editor de imágenes básico
- Guardado de cambios
- Validación básica

### Fase 3: Editor Avanzado

- Rich text editor
- Editor de listas
- Drag & drop para reordenar
- Vista previa en tiempo real

### Fase 4: Multi-proyecto

- Selección de proyecto
- Gestión de múltiples sitios
- Panel central "Easy to Change"

### Fase 5: Features Avanzadas

- Historial de versiones
- Comparación de cambios
- Rollback
- Exportar/Importar contenido

---

## 📝 Consideraciones Técnicas

### Reutilización entre Proyectos

**Estrategia**:
1. **Core del Panel**: Código genérico reutilizable
2. **Configuración por Proyecto**: JSON de configuración
3. **Temas**: Sistema de temas para personalizar apariencia
4. **Plugins**: Sistema de plugins para funcionalidades específicas

### Separación de Código

```
yes-you-change-core/          # Código genérico del panel
├── components/
├── services/
└── utils/

project-wholeself/            # Proyecto específico
├── config/
│   └── project.json          # Configuración del proyecto
└── custom-editors/           # Editores personalizados (opcional)
```

### API Centralizada (Futuro)

**Visión a largo plazo**:
- Panel centralizado en servidor
- API REST para cada proyecto
- Autenticación unificada
- Gestión centralizada de usuarios

---

## 🎨 Diseño Visual Detallado

### Primera Fila - Header

**Columna 1: Logo "Easy to Change"**
```
┌─────┐
│ ETC │  ← Logo SVG (escala de grises)
└─────┘
```
- Tamaño: 48px × 48px
- Padding: 16px desde bordes
- Hover: Ligeramente más oscuro
- Click: Navegar a dashboard principal

**Columna 2: Nombre del Proyecto**
```
Whole Self Counseling
```
- Tamaño de fuente: `text-3xl` o `text-4xl` (24-32px)
- Peso: `font-semibold` o `font-bold`
- Color: `text-gray-900`
- Alineación: Izquierda con padding
- Opcional: Subtítulo o descripción pequeña

### Segunda Fila - Contenido

**Columna 1: Navegación de Páginas**
```
┌─────────────┐
│ 📄 Home     │ ← Activo (resaltado)
│ 📄 Services │
│ 📄 What to  │
│   Expect    │
│ 📄 Investment│
│ 📄 Team     │
│ 📄 Contact  │
└─────────────┘
```

**Estilos**:
- Fondo: Blanco o `bg-gray-50`
- Cada item: Padding vertical `py-3`, padding horizontal `px-4`
- Hover: `bg-gray-100`
- Activo: `bg-blueGreen-100` o color de acento, `border-l-4 border-blueGreen-600`
- Iconos: Opcionales, tamaño pequeño
- Scroll: Si hay muchas páginas

**Columna 2: Área de Edición**
```
┌─────────────────────────────────────┐
│  [Breadcrumb: Home > Hero Section] │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ Sección: Hero               │   │
│  │                             │   │
│  │ Título: [____________]      │   │
│  │ Subtítulo: [__________]     │   │
│  │ Imagen: [Upload] [Preview]  │   │
│  │                             │   │
│  │ [Guardar] [Cancelar]        │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ Sección: About (colapsada)   │   │
│  └─────────────────────────────┘   │
└─────────────────────────────────────┘
```

**Características**:
- Scroll vertical si hay muchas secciones
- Cada sección en una tarjeta (card)
- Secciones colapsables
- Botones de acción fijos o sticky

---

## 📱 Versión Móvil (Futuro)

**Layout diferente**:
- Hamburger menu para navegación
- Navegación full-screen overlay
- Editor en pantalla completa
- Botones de acción en bottom bar

---

## 🔐 Seguridad y Permisos

### Roles en el Panel

**Admin**:
- Acceso completo
- Puede editar estructura
- Puede gestionar usuarios

**Editor**:
- Puede editar contenido
- No puede cambiar estructura
- No puede gestionar usuarios

**Viewer**:
- Solo lectura
- Puede ver contenido pero no editar

---

## 📊 Métricas de Éxito

### Experiencia de Usuario

- ✅ Tiempo para encontrar y editar contenido: < 30 segundos
- ✅ Tasa de éxito en primera edición: > 90%
- ✅ Satisfacción del cliente: Alta

### Técnicas

- ✅ Tiempo de carga del panel: < 2 segundos
- ✅ Tiempo de guardado: < 1 segundo
- ✅ Disponibilidad: > 99%

---

## 🎯 Próximos Pasos Inmediatos

### Para este Proyecto (Whole Self Counseling)

1. **Crear layout base del dashboard**:
   - Implementar estructura 2 filas × 2 columnas
   - Logo "Easy to Change" en columna 1, fila 1
   - Nombre del proyecto en columna 2, fila 1
   - Navegación de páginas en columna 1, fila 2
   - Área de edición en columna 2, fila 2

2. **Componente PageNavigation**:
   - Lista de páginas del proyecto
   - Navegación entre páginas
   - Estado activo

3. **Componente ContentEditor**:
   - Mostrar secciones de la página seleccionada
   - Formularios básicos de edición
   - Guardado de cambios

### Para Escalabilidad Futura

1. **Extraer código genérico**:
   - Crear paquete/core reutilizable
   - Sistema de configuración por proyecto
   - Temas personalizables

2. **Documentación**:
   - Guía de integración para nuevos proyectos
   - API documentation
   - Guía de usuario para clientes

---

## 📝 Notas de Diseño

### Principios de UX

1. **Simplicidad**: Menos es más
2. **Claridad**: Cada acción debe ser obvia
3. **Feedback**: Confirmar cada acción importante
4. **Consistencia**: Mismo patrón en todo el panel
5. **Accesibilidad**: WCAG 2.1 AA mínimo

### Naming Conventions

- **Componentes**: PascalCase (`PageNavigation.tsx`)
- **Archivos de datos**: kebab-case (`project-config.json`)
- **Rutas**: kebab-case (`/admin/dashboard`)
- **IDs**: kebab-case (`page-home`, `section-hero`)

---

**Última actualización**: 2025-01-XX  
**Versión**: 1.0.0
