# Plan: Condiciones Específicas - Menú Móvil y Estrategia Completa

## Resumen
Plan completo para implementar la sección de condiciones específicas con estrategia de menú móvil que muestra submenú al hacer clic en "Services", diferenciando terminológicamente entre servicios y condiciones.

---

## 1. Cambios Realizados (Tarjetas Compactas)

### ✅ Tarjetas de Servicios Rediseñadas
- **Diseño horizontal:** Icono a la izquierda, texto a la derecha
- **Icono:** Fondo verde relleno con icono blanco, borde alrededor
- **Tamaño reducido:** Padding `p-3`, icono `w-10 h-10`, texto más compacto
- **Descripciones acortadas:** Versiones más breves y concisas
- **Grid más compacto:** Gap reducido a `gap-4`

---

## 2. Estrategia del Menú Móvil

### Comportamiento en Móvil

**Cuando el usuario hace clic en "Services" en móvil:**
- ❌ NO navega a `/services` inmediatamente
- ✅ Muestra un submenú del mismo tamaño que el menú principal
- ✅ El submenú contiene dos secciones:

#### Sección 1: "Service Types" / "Tipos de Servicios"
Lista de las 4 categorías de servicios actuales:
- Evaluation & Consultation
- Individual Psychotherapy  
- Family & Group Therapy
- Support & Community Services

Cada una enlaza a `/services#evaluation`, `/services#individual-therapy`, etc.

#### Sección 2: "Conditions We Support" / "Condiciones que Apoyamos"
Lista de condiciones específicas:
- Anxiety Therapy
- ADHD Support
- Depression Treatment
- Bipolar Disorder Support
- Trauma/PTSD Therapy
- Stress Management
- Identity/Transition Support

Cada una enlaza a su página dedicada: `/services/anxiety`, `/services/adhd`, etc.

### Terminología para Diferenciar

**Para evitar repetir "Services":**
- **Servicios actuales:** "Service Types" / "Tipos de Servicios"
- **Condiciones específicas:** "Conditions We Support" / "Condiciones que Apoyamos"

O alternativas:
- "Treatment Services" / "Servicios de Tratamiento"
- "Specialized Support" / "Apoyo Especializado"

---

## 3. Implementación del Submenú Móvil

### Componente: `ServicesSubmenu.tsx`

**Características:**
- Se muestra cuando se hace clic en "Services" en móvil
- Mismo estilo visual que MobileMenu (cajas escalonadas)
- Botón "Back" para volver al menú principal
- Dos secciones claramente diferenciadas
- Animación de entrada/salida similar al menú principal

**Estructura:**
```
┌─────────────────────────┐
│  ← Back to Menu         │
├─────────────────────────┤
│  Service Types          │
│  ┌─────────────────┐   │
│  │ Evaluation &    │   │
│  │ Consultation    │   │
│  └─────────────────┘   │
│  ┌─────────────────┐   │
│  │ Individual       │   │
│  │ Psychotherapy    │   │
│  └─────────────────┘   │
│  ...                    │
├─────────────────────────┤
│  Conditions We Support  │
│  ┌─────────────────┐   │
│  │ Anxiety Therapy │   │
│  └─────────────────┘   │
│  ┌─────────────────┐   │
│  │ ADHD Support    │   │
│  └─────────────────┘   │
│  ...                    │
└─────────────────────────┘
```

### Modificaciones a MobileMenu

1. **Detectar clic en "Services":**
   - Interceptar el clic en lugar de navegar
   - Mostrar ServicesSubmenu en su lugar

2. **Estado del submenú:**
   - `const [showServicesSubmenu, setShowServicesSubmenu] = useState(false)`
   - Cuando `showServicesSubmenu` es true, mostrar submenú en lugar de navegar

3. **Navegación:**
   - Botón "Back" cierra el submenú y vuelve al menú principal
   - Los enlaces dentro del submenú navegan normalmente

---

## 4. Estructura de Datos para el Submenú

### Agregar a `services.json`:

```json
"mobileMenu": {
  "serviceTypes": {
    "title": {
      "en": "Service Types",
      "es": "Tipos de Servicios"
    },
    "items": [
      {
        "id": "evaluation",
        "label": {
          "en": "Evaluation & Consultation",
          "es": "Evaluación y Consulta"
        },
        "href": "/services#evaluation"
      },
      {
        "id": "individual",
        "label": {
          "en": "Individual Psychotherapy",
          "es": "Psicoterapia Individual"
        },
        "href": "/services#individual-therapy"
      },
      {
        "id": "family-group",
        "label": {
          "en": "Family & Group Therapy",
          "es": "Terapia Familiar y Grupal"
        },
        "href": "/services#family-group"
      },
      {
        "id": "support",
        "label": {
          "en": "Support & Community Services",
          "es": "Servicios de Apoyo y Comunitarios"
        },
        "href": "/services#support-services"
      }
    ]
  },
  "conditions": {
    "title": {
      "en": "Conditions We Support",
      "es": "Condiciones que Apoyamos"
    },
    "items": [
      {
        "id": "anxiety",
        "label": {
          "en": "Anxiety Therapy",
          "es": "Terapia para Ansiedad"
        },
        "href": "/services/anxiety"
      },
      // ... más condiciones
    ]
  }
}
```

---

## 5. Sección de Condiciones en la Página

### Diseño de Tarjetas de Condiciones

**Mismo diseño compacto que las tarjetas de servicios:**
- Layout horizontal (icono izquierda, texto derecha)
- Icono con fondo de color (puede usar tonos diferentes para diferenciar)
- Descripción breve (1-2 líneas)
- Enlace "Learn More" / "Saber Más"

**Diferenciación visual:**
- Puede usar un color diferente (ej: tealBlue en lugar de blueGreen)
- O mantener blueGreen pero con tonos distintos

### Grid de Condiciones

- **Móvil:** 1 columna
- **Tablet:** 2 columnas  
- **Desktop:** 3-4 columnas (dependiendo del espacio)

---

## 6. Archivos a Modificar/Crear

### Modificar:
- `src/components/layout/MobileMenu.tsx` - Agregar lógica para submenú
- `src/data/content/pages/services.json` - Agregar secciones mobileMenu y conditionsSection
- `src/pages/services.astro` - Integrar ConditionsSection

### Crear:
- `src/components/layout/ServicesSubmenu.tsx` - Componente del submenú
- `src/components/services/ConditionCard.tsx` - Tarjeta de condición (similar a ServiceCard)
- `src/components/services/ConditionsSection.tsx` - Sección completa de condiciones

---

## 7. Flujo de Usuario en Móvil

1. Usuario abre menú móvil (hace clic en "menu")
2. Ve las opciones del menú principal
3. Hace clic en "Services"
4. **En lugar de navegar:** Se muestra ServicesSubmenu
5. Ve dos secciones:
   - "Service Types" con 4 categorías
   - "Conditions We Support" con 7 condiciones
6. Puede hacer clic en cualquier opción para navegar
7. O hacer clic en "Back" para volver al menú principal

---

## 8. Consideraciones de Diseño

### Submenú Móvil:
- Mismo estilo visual que MobileMenu
- Cajas escalonadas con animación
- Botón "Back" prominente en la parte superior
- Separación visual clara entre las dos secciones
- Colores consistentes con la paleta

### Tarjetas de Condiciones:
- Diseño compacto horizontal (igual que servicios)
- Iconos representativos de cada condición
- Colores diferenciados (sugerencia: usar tealBlue para condiciones)
- Hover effects sutiles

---

## 9. Ventajas de esta Estrategia

1. **No sobrecarga la página:** Información organizada en submenú
2. **Mejor UX móvil:** Acceso rápido sin navegar primero
3. **Diferenciación clara:** Terminología distinta evita confusión
4. **SEO optimizado:** Cada condición tiene su página
5. **Escalable:** Fácil agregar más condiciones o servicios
6. **Consistente:** Mismo estilo visual en toda la app

---

## 10. Próximos Pasos de Implementación

### Fase 1: Preparación
1. ✅ Rediseñar tarjetas de servicios (COMPLETADO)
2. Agregar estructura JSON para mobileMenu y conditionsSection
3. Definir iconos para cada condición

### Fase 2: Componentes de Condiciones
1. Crear ConditionCard.tsx (diseño compacto horizontal)
2. Crear ConditionsSection.tsx
3. Integrar en services.astro

### Fase 3: Submenú Móvil
1. Crear ServicesSubmenu.tsx
2. Modificar MobileMenu.tsx para interceptar clic en Services
3. Agregar lógica de navegación entre menú y submenú

### Fase 4: Páginas Dedicadas (Futuro)
1. Crear estructura base para páginas de condiciones
2. Implementar contenido básico
3. Agregar contenido detallado basado en documentos guía

---

**Última actualización:** 2024-01-15  
**Versión del plan:** 2.0  
**Estado:** Listo para implementación
