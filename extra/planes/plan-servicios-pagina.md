# Plan de Desarrollo - Página de Servicios

## Resumen
Plan para desarrollar una página de servicios moderna, visual y fácil de usar que muestre los servicios de Whole Self Counseling con iconografía, categorías, descripciones breves y llamados a la acción para reservar consultas.

---

## 1. Investigación y Referencias

### Mejores Prácticas Identificadas

**Diseño:**
- Layout limpio y minimalista con mucho espacio en blanco
- Colores calmantes y profesionales (alineados con la paleta existente)
- Tipografía legible con buen contraste
- Diseño responsive (móvil primero)

**Iconografía:**
- Iconos consistentes en estilo
- Representación visual de cada servicio
- Iconos alineados con la estética de la marca
- Uso de iconos SVG para mejor calidad

**Organización:**
- Categorización clara de servicios
- Navegación intuitiva
- Descripciones concisas (2-3 líneas máximo)
- CTAs prominentes y visibles

**Referencias de Agencias Similares:**
- BetterHelp: Diseño limpio con servicios claramente categorizados
- Talkspace: Uso efectivo de iconos y descripciones breves
- GoodTherapy: Organización por categorías con CTAs claros

---

## 2. Estructura de Categorías Propuesta

### Categorización de Servicios

Los 11 servicios se organizarán en **3-4 categorías** para facilitar la navegación:

#### **Categoría 1: Evaluación y Consulta**
- Consultation
- Psychiatric Diagnostic Evaluation
- Treatment Plan Development

#### **Categoría 2: Psicoterapia Individual**
- Individual Psychotherapy
- Psychotherapy for crisis

#### **Categoría 3: Psicoterapia Familiar y Grupal**
- Family Psychotherapy, without patient
- Family Psychotherapy, conjoint psychotherapy, with patient present
- Group Psychotherapy, other than multiple-family group

#### **Categoría 4: Servicios de Apoyo y Comunitarios**
- EAP Session
- Peer support services
- Comprehensive community support services

**Alternativa (si prefieres menos categorías):**
- **Evaluación y Planificación** (3 servicios)
- **Psicoterapia** (5 servicios: individual, crisis, familiar, grupal)
- **Servicios de Apoyo** (3 servicios)

---

## 3. Diseño Visual Propuesto

### Layout General

```
┌─────────────────────────────────────────┐
│  Hero Section (Título + Subtítulo)     │
└─────────────────────────────────────────┘
┌─────────────────────────────────────────┐
│  Introducción breve (1-2 párrafos)      │
│  "Our services include, but not limited │
│   to, the following:"                   │
└─────────────────────────────────────────┘
┌─────────────────────────────────────────┐
│  CATEGORÍA 1                            │
│  ┌──────┐ ┌──────┐ ┌──────┐            │
│  │ Icon │ │ Icon │ │ Icon │            │
│  │Title │ │Title │ │Title │            │
│  │Desc  │ │Desc  │ │Desc  │            │
│  └──────┘ └──────┘ └──────┘            │
└─────────────────────────────────────────┘
┌─────────────────────────────────────────┐
│  CATEGORÍA 2                            │
│  ┌──────┐ ┌──────┐                      │
│  │ Icon │ │ Icon │                      │
│  │Title │ │Title │                      │
│  │Desc  │ │Desc  │                      │
│  └──────┘ └──────┘                      │
└─────────────────────────────────────────┘
┌─────────────────────────────────────────┐
│  CATEGORÍA 3                            │
│  ┌──────┐ ┌──────┐ ┌──────┐            │
│  │ Icon │ │ Icon │ │ Icon │            │
│  │Title │ │Title │ │Title │            │
│  │Desc  │ │Desc  │ │Desc  │            │
│  └──────┘ └──────┘ └──────┘            │
└─────────────────────────────────────────┘
┌─────────────────────────────────────────┐
│  CATEGORÍA 4                            │
│  ┌──────┐ ┌──────┐ ┌──────┐            │
│  │ Icon │ │ Icon │ │ Icon │            │
│  │Title │ │Title │ │Title │            │
│  │Desc  │ │Desc  │ │Desc  │            │
│  └──────┘ └──────┘ └──────┘            │
└─────────────────────────────────────────┘
┌─────────────────────────────────────────┐
│  CTA Section                            │
│  "Ready to get started?"                │
│  [I Need Help] [My Loved One Needs Help]│
└─────────────────────────────────────────┘
```

### Diseño de Tarjetas de Servicio

**Opción A: Grid de Tarjetas (Recomendada)**
- Grid responsive: 1 columna (móvil), 2 columnas (tablet), 3 columnas (desktop)
- Tarjeta con:
  - Icono en la parte superior (60x60px o 80x80px)
  - Título del servicio (h3)
  - Descripción breve (2-3 líneas, ~100-150 caracteres)
  - Hover effect: ligera elevación y cambio de color de fondo
  - Bordes redondeados y sombra sutil

**Opción B: Lista con Iconos Laterales**
- Lista vertical con iconos a la izquierda
- Más compacta, menos visual

**Recomendación: Opción A (Grid de Tarjetas)**

### Paleta de Colores

Usar la paleta existente del proyecto:
- **Fondo de tarjetas:** `white` o `blueGreen-50`
- **Hover:** `blueGreen-100` o `tealBlue-100`
- **Iconos:** `tealBlue-500`, `navy-500`, `blueGreen-500` (rotar colores)
- **Texto:** `navy-900` para títulos, `gray-700` para descripciones
- **Categorías:** Badge o título de sección con `tealBlue-600`

---

## 4. Iconografía

### Estrategia de Iconos

**Opción 1: Iconos de Librería (Recomendada)**
- Usar librería como **Heroicons**, **Lucide**, o **Phosphor Icons**
- Ventajas: Consistencia, múltiples estilos, fácil de implementar
- Estilo recomendado: Outline o Duotone

**Opción 2: Iconos Personalizados SVG**
- Crear iconos personalizados en `public/icons/services/`
- Ventajas: Únicos, alineados con marca
- Desventajas: Requiere diseño y tiempo

**Recomendación: Opción 1 (Heroicons o Lucide) con posibilidad de personalizar después**

### Mapeo de Iconos por Servicio

| Servicio | Icono Sugerido |
|----------|----------------|
| Consultation | `ChatBubbleLeftRight` o `UserGroup` |
| Psychiatric Diagnostic Evaluation | `ClipboardDocumentCheck` o `DocumentMagnifyingGlass` |
| Individual Psychotherapy | `User` o `Heart` |
| Psychotherapy for crisis | `ExclamationTriangle` o `ShieldExclamation` |
| Family Psychotherapy, without patient | `Users` o `Home` |
| Family Psychotherapy, conjoint | `UserGroup` o `Users` |
| Group Psychotherapy | `UserGroup` o `RectangleGroup` |
| EAP Session | `Briefcase` o `BuildingOffice` |
| Peer support services | `HandRaised` o `UserCircle` |
| Comprehensive community support | `GlobeAmericas` o `MapPin` |
| Treatment Plan Development | `ClipboardDocumentList` o `DocumentText` |

---

## 5. Descripciones de Servicios

### Estructura de Descripciones

Cada servicio tendrá una descripción breve de **2-3 líneas máximo** (~100-150 caracteres):

**Ejemplo:**
```json
{
  "name": {
    "en": "Individual Psychotherapy",
    "es": "Psicoterapia Individual"
  },
  "description": {
    "en": "One-on-one therapy sessions tailored to your unique needs and goals. A safe space to explore, heal, and grow at your own pace.",
    "es": "Sesiones de terapia individual adaptadas a tus necesidades y objetivos únicos. Un espacio seguro para explorar, sanar y crecer a tu propio ritmo."
  }
}
```

### Contenido a Desarrollar

Se necesitará crear descripciones breves para los 11 servicios en inglés y español. Estas descripciones deben:
- Ser claras y accesibles
- Evitar jerga médica excesiva
- Enfatizar el enfoque centrado en el cliente
- Ser consistentes en tono y estilo

---

## 6. Llamado a la Acción (CTA)

### Estrategia de CTAs

**Ubicación 1: Al final de la página (Recomendada)**
- Sección completa dedicada a CTAs
- Título: "Ready to get started?" / "¿Listo para comenzar?"
- Dos botones grandes:
  - "I Need Help" → `/contact/i-need-help`
  - "My Loved One Needs Help" → `/contact/loved-one-needs-help`
- Opcional: Incluir el tercer formulario "I Need to Make a Referral" como enlace secundario

**Ubicación 2: Sticky CTA (Opcional)**
- Botón flotante en la esquina inferior derecha
- Aparece al hacer scroll
- Texto: "Book a Consultation" / "Reservar Consulta"

**Recomendación: Ubicación 1 (Sección al final) + considerar sticky CTA para móvil**

### Diseño de CTA Section

```
┌─────────────────────────────────────────┐
│  "Ready to get started?"                │
│  "We're here to support you on your     │
│   healing journey."                     │
│                                         │
│  ┌──────────────┐  ┌──────────────┐   │
│  │ I Need Help  │  │ My Loved One │   │
│  │              │  │ Needs Help   │   │
│  └──────────────┘  └──────────────┘   │
│                                         │
│  [I Need to Make a Referral] (link)    │
└─────────────────────────────────────────┘
```

---

## 7. Estructura de Datos JSON

### Archivo: `src/data/content/pages/services.json`

```json
{
  "meta": {
    "pageId": "services",
    "lastUpdated": "2024-01-15T10:00:00Z",
    "version": 1
  },
  "seo": {
    "title": {
      "en": "Services - Whole Self Counseling",
      "es": "Servicios - Whole Self Counseling"
    },
    "description": {
      "en": "Our comprehensive therapeutic services",
      "es": "Nuestros servicios terapéuticos integrales"
    }
  },
  "content": {
    "hero": {
      "title": {
        "en": "Our Services",
        "es": "Nuestros Servicios"
      },
      "subtitle": {
        "en": "Comprehensive therapeutic support",
        "es": "Apoyo terapéutico integral"
      }
    },
    "intro": {
      "text": {
        "en": "Our services include, but not limited to, the following:",
        "es": "Nuestros servicios incluyen, pero no se limitan a, lo siguiente:"
      }
    },
    "categories": [
      {
        "id": "evaluation",
        "title": {
          "en": "Evaluation & Consultation",
          "es": "Evaluación y Consulta"
        },
        "services": [
          {
            "id": "consultation",
            "name": {
              "en": "Consultation",
              "es": "Consulta"
            },
            "description": {
              "en": "Initial consultation to understand your needs and determine the best path forward for your healing journey.",
              "es": "Consulta inicial para entender tus necesidades y determinar el mejor camino para tu viaje de sanación."
            },
            "icon": "ChatBubbleLeftRight"
          },
          {
            "id": "psychiatric-evaluation",
            "name": {
              "en": "Psychiatric Diagnostic Evaluation",
              "es": "Evaluación Diagnóstica Psiquiátrica"
            },
            "description": {
              "en": "Comprehensive assessment to understand your mental health needs and develop an appropriate treatment approach.",
              "es": "Evaluación integral para entender tus necesidades de salud mental y desarrollar un enfoque de tratamiento apropiado."
            },
            "icon": "ClipboardDocumentCheck"
          },
          {
            "id": "treatment-plan",
            "name": {
              "en": "Treatment Plan Development",
              "es": "Desarrollo de Plan de Tratamiento"
            },
            "description": {
              "en": "Collaborative creation of a personalized treatment plan that aligns with your goals and values.",
              "es": "Creación colaborativa de un plan de tratamiento personalizado que se alinea con tus objetivos y valores."
            },
            "icon": "ClipboardDocumentList"
          }
        ]
      },
      {
        "id": "individual-therapy",
        "title": {
          "en": "Individual Psychotherapy",
          "es": "Psicoterapia Individual"
        },
        "services": [
          {
            "id": "individual-psychotherapy",
            "name": {
              "en": "Individual Psychotherapy",
              "es": "Psicoterapia Individual"
            },
            "description": {
              "en": "One-on-one therapy sessions tailored to your unique needs and goals. A safe space to explore, heal, and grow at your own pace.",
              "es": "Sesiones de terapia individual adaptadas a tus necesidades y objetivos únicos. Un espacio seguro para explorar, sanar y crecer a tu propio ritmo."
            },
            "icon": "User"
          },
          {
            "id": "crisis-psychotherapy",
            "name": {
              "en": "Psychotherapy for crisis",
              "es": "Psicoterapia para crisis"
            },
            "description": {
              "en": "Immediate support during difficult times. Crisis intervention to help you navigate challenging moments with care and understanding.",
              "es": "Apoyo inmediato durante momentos difíciles. Intervención en crisis para ayudarte a navegar momentos desafiantes con cuidado y comprensión."
            },
            "icon": "ExclamationTriangle"
          }
        ]
      },
      {
        "id": "family-group",
        "title": {
          "en": "Family & Group Therapy",
          "es": "Terapia Familiar y Grupal"
        },
        "services": [
          {
            "id": "family-without-patient",
            "name": {
              "en": "Family Psychotherapy, without patient",
              "es": "Psicoterapia Familiar, sin paciente"
            },
            "description": {
              "en": "Support sessions for family members to understand and support their loved one's healing journey.",
              "es": "Sesiones de apoyo para miembros de la familia para entender y apoyar el viaje de sanación de su ser querido."
            },
            "icon": "Users"
          },
          {
            "id": "family-conjoint",
            "name": {
              "en": "Family Psychotherapy, conjoint psychotherapy, with patient present",
              "es": "Psicoterapia Familiar, psicoterapia conjunta, con paciente presente"
            },
            "description": {
              "en": "Family therapy sessions with all members present to work together on healing and understanding.",
              "es": "Sesiones de terapia familiar con todos los miembros presentes para trabajar juntos en la sanación y comprensión."
            },
            "icon": "UserGroup"
          },
          {
            "id": "group-psychotherapy",
            "name": {
              "en": "Group Psychotherapy, other than multiple-family group",
              "es": "Psicoterapia Grupal, distinta a grupo multifamiliar"
            },
            "description": {
              "en": "Therapeutic group sessions where individuals can share experiences and support each other in a safe, structured environment.",
              "es": "Sesiones de terapia grupal donde las personas pueden compartir experiencias y apoyarse mutuamente en un ambiente seguro y estructurado."
            },
            "icon": "RectangleGroup"
          }
        ]
      },
      {
        "id": "support-services",
        "title": {
          "en": "Support & Community Services",
          "es": "Servicios de Apoyo y Comunitarios"
        },
        "services": [
          {
            "id": "eap-session",
            "name": {
              "en": "EAP Session",
              "es": "Sesión EAP"
            },
            "description": {
              "en": "Employee Assistance Program sessions providing workplace mental health support and resources.",
              "es": "Sesiones del Programa de Asistencia al Empleado que brindan apoyo y recursos de salud mental en el lugar de trabajo."
            },
            "icon": "Briefcase"
          },
          {
            "id": "peer-support",
            "name": {
              "en": "Peer support services",
              "es": "Servicios de apoyo entre pares"
            },
            "description": {
              "en": "Support from individuals with lived experience who understand your journey and can provide meaningful connection and guidance.",
              "es": "Apoyo de personas con experiencia vivida que entienden tu viaje y pueden brindar conexión y orientación significativas."
            },
            "icon": "HandRaised"
          },
          {
            "id": "community-support",
            "name": {
              "en": "Comprehensive community support services",
              "es": "Servicios integrales de apoyo comunitario"
            },
            "description": {
              "en": "Holistic community-based support services that address various aspects of well-being and connection.",
              "es": "Servicios integrales de apoyo basados en la comunidad que abordan diversos aspectos del bienestar y la conexión."
            },
            "icon": "GlobeAmericas"
          }
        ]
      }
    ],
    "ctaSection": {
      "title": {
        "en": "Ready to get started?",
        "es": "¿Listo para comenzar?"
      },
      "subtitle": {
        "en": "We're here to support you on your healing journey.",
        "es": "Estamos aquí para apoyarte en tu viaje de sanación."
      },
      "primaryCTAs": [
        {
          "id": "i-need-help",
          "title": {
            "en": "I Need Help",
            "es": "Necesito Ayuda"
          },
          "link": "/contact/i-need-help",
          "color": "blueGreen"
        },
        {
          "id": "loved-one",
          "title": {
            "en": "My Loved One Needs Help",
            "es": "Mi Ser Querido Necesita Ayuda"
          },
          "link": "/contact/loved-one-needs-help",
          "color": "navy"
        }
      ],
      "secondaryCTA": {
        "id": "referral",
        "title": {
          "en": "I Need to Make a Referral",
          "es": "Necesito Hacer una Referencia"
        },
        "link": "/contact/referral",
        "text": {
          "en": "For healthcare providers and professionals",
          "es": "Para proveedores de atención médica y profesionales"
        }
      }
    }
  }
}
```

---

## 8. Componentes a Crear/Modificar

### Componentes Nuevos

1. **`src/components/services/ServicesGrid.astro`**
   - Componente principal que renderiza todas las categorías y servicios
   - Usa el grid de tarjetas
   - Responsive design

2. **`src/components/services/ServiceCard.astro`**
   - Tarjeta individual de servicio
   - Recibe: nombre, descripción, icono
   - Maneja hover effects y estilos

3. **`src/components/services/ServiceCategory.astro`**
   - Sección de categoría con título y grid de servicios
   - Opcional: Badge o título destacado

4. **`src/components/services/ServicesCTA.astro`**
   - Sección de CTAs al final de la página
   - Similar a `CTASection.astro` pero adaptado para servicios

### Componentes a Modificar

1. **`src/pages/services.astro`**
   - Actualizar para usar los nuevos componentes
   - Cargar datos desde `services.json`
   - Integrar hero, intro, grid de servicios, y CTA

---

## 9. Implementación Técnica

### Paso 1: Actualizar JSON de Contenido
- Completar `src/data/content/pages/services.json` con toda la estructura
- Agregar descripciones en inglés y español
- Definir iconos para cada servicio

### Paso 2: Crear Componente ServiceCard
- Componente reutilizable para cada tarjeta de servicio
- Props: name, description, icon
- Estilos con Tailwind usando la paleta del proyecto

### Paso 3: Crear Componente ServiceCategory
- Renderiza el título de categoría
- Renderiza grid de ServiceCards dentro de la categoría

### Paso 4: Crear Componente ServicesGrid
- Orquesta todas las categorías
- Maneja el layout general
- Responsive grid

### Paso 5: Crear Componente ServicesCTA
- Sección de CTAs específica para servicios
- Incluye los dos CTAs principales y el enlace secundario

### Paso 6: Actualizar Página Services
- Integrar todos los componentes
- Cargar datos desde JSON
- Asegurar SEO y meta tags

### Paso 7: Integrar Librería de Iconos
- Instalar Heroicons o Lucide
- Crear helper para mapear nombres de iconos a componentes
- Renderizar iconos dinámicamente

---

## 10. Consideraciones de Diseño Responsive

### Breakpoints (Tailwind)
- **Mobile (< 640px):** 1 columna de servicios
- **Tablet (640px - 1024px):** 2 columnas de servicios
- **Desktop (> 1024px):** 3 columnas de servicios

### Optimizaciones Móviles
- Iconos ligeramente más pequeños en móvil
- Espaciado reducido entre tarjetas
- CTAs en columna única en móvil
- Texto de descripciones optimizado para lectura móvil

---

## 11. Accesibilidad

### Consideraciones
- Iconos con `aria-label` descriptivos
- Contraste de colores según WCAG AA
- Navegación por teclado funcional
- Textos alternativos para todos los elementos visuales
- Estructura semántica HTML (h1, h2, section, etc.)

---

## 12. Próximos Pasos de Implementación

### Fase 1: Preparación
1. ✅ Crear estructura JSON completa
2. ✅ Definir categorías y organización
3. ✅ Escribir descripciones en inglés y español
4. ✅ Seleccionar librería de iconos

### Fase 2: Desarrollo de Componentes
1. Crear `ServiceCard.astro`
2. Crear `ServiceCategory.astro`
3. Crear `ServicesGrid.astro`
4. Crear `ServicesCTA.astro`

### Fase 3: Integración
1. Actualizar `services.astro`
2. Integrar componentes
3. Cargar datos desde JSON
4. Aplicar estilos y responsive design

### Fase 4: Refinamiento
1. Ajustar espaciados y colores
2. Optimizar hover effects
3. Probar en diferentes dispositivos
4. Revisar accesibilidad

### Fase 5: Contenido Final
1. Revisar y ajustar descripciones
2. Verificar traducciones
3. Asegurar consistencia de tono

---

## 13. Preguntas Pendientes

1. **¿Prefieres 3 o 4 categorías?** (Recomendación: 4 para mejor organización)
2. **¿Qué librería de iconos prefieres?** (Heroicons, Lucide, u otra)
3. **¿Incluimos el tercer formulario (Referral) en los CTAs principales o solo como enlace secundario?** (Recomendación: secundario)
4. **¿Quieres un sticky CTA flotante además de la sección al final?** (Opcional, recomendado para móvil)
5. **¿Algún estilo visual específico que quieras?** (Por ejemplo: tarjetas con bordes, sin bordes, con sombras, etc.)

---

## 14. Notas Finales

- **Separación de contenido y diseño:** Todo el contenido editable estará en `services.json`
- **Consistencia:** Usar la misma paleta de colores y estilos del resto del sitio
- **Tono:** Mantener el tono cálido, acogedor y centrado en el cliente
- **Flexibilidad:** La estructura JSON permite agregar/quitar servicios fácilmente
- **Escalabilidad:** Fácil agregar más categorías o servicios en el futuro

---

**Última actualización:** 2024-01-15  
**Versión del plan:** 1.0  
**Estado:** Pendiente de aprobación
