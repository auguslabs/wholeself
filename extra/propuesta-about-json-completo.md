# Propuesta: Estructura Completa para `about.json`

## 🔍 Análisis del Estado Actual

### ❌ Lo que tiene ahora (BÁSICO):

```json
{
  "content": {
    "hero": {
      "title": {
        "en": "About Us",
        "es": "Acerca de Nosotros"
      }
    },
    "sections": []  // ← VACÍO
  }
}
```

**Problemas**:
- ❌ Hero solo tiene `title`, falta `subtitle`, `description`, `backgroundImage`
- ❌ `sections` está vacío (no hay contenido)
- ❌ No hay información sobre la organización
- ❌ No hay valores, misión, historia
- ❌ No hay CTAs

---

## ✅ Lo que debería tener (COMPLETO):

### Comparación con otras páginas:

**`home.json`** tiene:
- Hero completo (headline, description, backgroundImage)
- valuePropositions (4 items)
- ctaSection (3 CTAs)

**`what-to-expect.json`** tiene:
- Hero (title, subtitle)
- intro (texto introductorio)
- sections (6 secciones con contenido detallado)
- ctaSection

---

## 📋 Estructura Propuesta para `about.json`

Basado en la información de Whole Self Counseling, la página "About" debería incluir:

### 1. **Hero Completo**
- `title`: "About Us" / "Acerca de Nosotros"
- `subtitle`: Tagline o descripción breve
- `description`: Texto introductorio sobre la organización
- `backgroundImage`: Imagen de fondo (opcional)

### 2. **Secciones de Contenido**

#### Sección 1: **Misión/Our Mission**
- Título: "Our Mission" / "Nuestra Misión"
- Descripción: Texto sobre la misión de Whole Self Counseling
- Enfoque en valores abolicionistas y prácticas decoloniales

#### Sección 2: **Valores/Our Values**
- Título: "Our Values" / "Nuestros Valores"
- Lista de valores principales:
  - Abolitionist values
  - Decolonial healing practices
  - Social justice
  - Community-centered care
  - BIPOC-focused

#### Sección 3: **Nuestro Enfoque/Our Approach**
- Título: "Our Approach" / "Nuestro Enfoque"
- Descripción del enfoque terapéutico
- Prácticas específicas

#### Sección 4: **Historia/Our Story** (opcional)
- Título: "Our Story" / "Nuestra Historia"
- Cómo comenzó Whole Self Counseling
- Fundadora y visión

#### Sección 5: **Comunidad/Our Community**
- Título: "Who We Serve" / "A Quién Servimos"
- Enfoque en comunidades BIPOC, LGBTQIA+, etc.

### 3. **CTA Section**
- Links a:
  - Conocer el equipo (`/team`)
  - Contactar (`/contact`)
  - Ver servicios (`/services`)

---

## 📝 Estructura JSON Propuesta

```json
{
  "meta": {
    "pageId": "about",
    "lastUpdated": "2024-01-15T10:00:00Z",
    "version": 1
  },
  "seo": {
    "title": {
      "en": "About - Whole Self Counseling",
      "es": "Acerca de - Whole Self Counseling"
    },
    "description": {
      "en": "Learn about our mission, values, and approach to decolonial healing practices",
      "es": "Conoce nuestra misión, valores y enfoque de prácticas de sanación decoloniales"
    }
  },
  "content": {
    "hero": {
      "title": {
        "en": "About Us",
        "es": "Acerca de Nosotros"
      },
      "subtitle": {
        "en": "A therapy collective built by, for, and staffed by people of color",
        "es": "Un colectivo de terapia construido por, para y dirigido por personas de color"
      },
      "description": {
        "en": "Whole Self Counseling is grounded in abolitionist values and decolonial healing practices that challenge oppressive systems and affirm the full humanity of our communities.",
        "es": "Whole Self Counseling está fundamentado en valores abolicionistas y prácticas de sanación decoloniales que desafían los sistemas opresivos y afirman la humanidad plena de nuestras comunidades."
      },
      "backgroundImage": "/banner-hero-section.webp",
      "backgroundImageAlt": {
        "en": "About Whole Self Counseling",
        "es": "Acerca de Whole Self Counseling"
      }
    },
    "intro": {
      "text": {
        "en": "We are a therapy collective committed to providing culturally-rooted, socially-just mental health care to our communities.",
        "es": "Somos un colectivo de terapia comprometido con brindar atención de salud mental con raíces culturales y justicia social a nuestras comunidades."
      }
    },
    "sections": [
      {
        "id": "mission",
        "title": {
          "en": "Our Mission",
          "es": "Nuestra Misión"
        },
        "icon": "HeartIcon",
        "content": {
          "description": {
            "en": "Whole Self Counseling empowers people of color to radically improve relationships with themselves and the world around them in order to live with authenticity and joy.",
            "es": "Whole Self Counseling empodera a las personas de color para mejorar radicalmente las relaciones consigo mismas y con el mundo que las rodea para vivir con autenticidad y alegría."
          }
        }
      },
      {
        "id": "values",
        "title": {
          "en": "Our Values",
          "es": "Nuestros Valores"
        },
        "icon": "ShieldCheckIcon",
        "content": {
          "description": {
            "en": "Our practice is grounded in core values that guide everything we do:",
            "es": "Nuestra práctica está fundamentada en valores fundamentales que guían todo lo que hacemos:"
          },
          "items": [
            {
              "title": {
                "en": "Abolitionist Values",
                "es": "Valores Abolicionistas"
              },
              "description": {
                "en": "We challenge oppressive systems and work toward transformative justice.",
                "es": "Desafiamos los sistemas opresivos y trabajamos hacia la justicia transformativa."
              }
            },
            {
              "title": {
                "en": "Decolonial Healing",
                "es": "Sanación Decolonial"
              },
              "description": {
                "en": "We honor traditional healing practices and center non-Western approaches to wellness.",
                "es": "Honramos las prácticas de sanación tradicionales y centramos enfoques no occidentales del bienestar."
              }
            },
            {
              "title": {
                "en": "Social Justice",
                "es": "Justicia Social"
              },
              "description": {
                "en": "We view mental health work as integral to social justice and community liberation.",
                "es": "Vemos el trabajo de salud mental como integral a la justicia social y la liberación comunitaria."
              }
            },
            {
              "title": {
                "en": "Community-Centered",
                "es": "Centrado en la Comunidad"
              },
              "description": {
                "en": "We are built by, for, and staffed by people of color, serving our communities with cultural humility.",
                "es": "Somos construidos por, para y dirigidos por personas de color, sirviendo a nuestras comunidades con humildad cultural."
              }
            }
          ]
        }
      },
      {
        "id": "approach",
        "title": {
          "en": "Our Approach",
          "es": "Nuestro Enfoque"
        },
        "icon": "SparklesIcon",
        "content": {
          "description": {
            "en": "We integrate evidence-based therapeutic approaches with culturally-responsive practices:",
            "es": "Integramos enfoques terapéuticos basados en evidencia con prácticas culturalmente receptivas:"
          },
          "items": [
            {
              "title": {
                "en": "Culturally-Rooted Therapy",
                "es": "Terapia con Raíces Culturales"
              },
              "description": {
                "en": "Therapy that honors your cultural identity and lived experiences.",
                "es": "Terapia que honra tu identidad cultural y experiencias vividas."
              }
            },
            {
              "title": {
                "en": "Trauma-Informed Care",
                "es": "Atención Informada sobre Trauma"
              },
              "description": {
                "en": "Understanding how trauma impacts the whole person and healing holistically.",
                "es": "Entendiendo cómo el trauma impacta a toda la persona y sanando holísticamente."
              }
            },
            {
              "title": {
                "en": "Strength-Based",
                "es": "Basado en Fortalezas"
              },
              "description": {
                "en": "Recognizing and building upon your inherent strengths and resilience.",
                "es": "Reconociendo y construyendo sobre tus fortalezas inherentes y resiliencia."
              }
            }
          ]
        }
      },
      {
        "id": "community",
        "title": {
          "en": "Who We Serve",
          "es": "A Quién Servimos"
        },
        "icon": "UserGroupIcon",
        "content": {
          "description": {
            "en": "We specialize in serving:",
            "es": "Nos especializamos en servir a:"
          },
          "items": [
            {
              "title": {
                "en": "BIPOC Communities",
                "es": "Comunidades BIPOC"
              },
              "description": {
                "en": "Black, Indigenous, and People of Color seeking culturally-affirming therapy.",
                "es": "Personas Negras, Indígenas y de Color que buscan terapia culturalmente afirmativa."
              }
            },
            {
              "title": {
                "en": "LGBTQIA+ Individuals",
                "es": "Personas LGBTQIA+"
              },
              "description": {
                "en": "Affirming care for LGBTQIA+ individuals and their families.",
                "es": "Atención afirmativa para personas LGBTQIA+ y sus familias."
              }
            },
            {
              "title": {
                "en": "Immigrant Communities",
                "es": "Comunidades Inmigrantes"
              },
              "description": {
                "en": "Supporting immigrant families navigating cultural transitions and challenges.",
                "es": "Apoyando a familias inmigrantes navegando transiciones y desafíos culturales."
              }
            }
          ]
        }
      }
    ],
    "ctaSection": {
      "title": {
        "en": "Ready to Begin Your Journey?",
        "es": "¿Listo para Comenzar tu Viaje?"
      },
      "subtitle": {
        "en": "Connect with our team and learn more about how we can support you.",
        "es": "Conéctate con nuestro equipo y aprende más sobre cómo podemos apoyarte."
      },
      "ctas": [
        {
          "id": "meet-team",
          "title": {
            "en": "Meet Our Team",
            "es": "Conoce Nuestro Equipo"
          },
          "description": {
            "en": "Get to know our compassionate therapists",
            "es": "Conoce a nuestros terapeutas compasivos"
          },
          "link": "/team",
          "icon": "UserGroupIcon"
        },
        {
          "id": "contact-us",
          "title": {
            "en": "Contact Us",
            "es": "Contáctanos"
          },
          "description": {
            "en": "Reach out with questions or to schedule",
            "es": "Escríbenos con preguntas o para programar"
          },
          "link": "/contact",
          "icon": "EnvelopeIcon"
        },
        {
          "id": "our-services",
          "title": {
            "en": "Our Services",
            "es": "Nuestros Servicios"
          },
          "description": {
            "en": "Explore our therapeutic approaches",
            "es": "Explora nuestros enfoques terapéuticos"
          },
          "link": "/services",
          "icon": "SparklesIcon"
        }
      ]
    }
  }
}
```

---

## 🎯 Resumen: ¿Por qué es "básico" ahora?

### ❌ Estado Actual (Básico):
- Solo `hero.title`
- `sections` vacío
- Sin información sobre la organización
- Sin valores, misión, enfoque
- Sin CTAs

### ✅ Estado Propuesto (Completo):
- Hero completo (title, subtitle, description, backgroundImage)
- Intro con texto contextual
- 4 secciones con contenido:
  1. Misión
  2. Valores (4 items)
  3. Enfoque (3 items)
  4. Comunidad (3 items)
- CTA Section con 3 enlaces

---

## 📊 Comparación con Otras Páginas

| Elemento | `about.json` (actual) | `about.json` (propuesto) | `home.json` | `what-to-expect.json` |
|---------|:---------------------:|:------------------------:|:-----------:|:---------------------:|
| Hero completo | ❌ | ✅ | ✅ | ✅ |
| Intro | ❌ | ✅ | ❌ | ✅ |
| Secciones | 0 | 4 | 0 | 6 |
| CTAs | ❌ | ✅ | ✅ | ✅ |
| Contenido útil | ❌ | ✅ | ✅ | ✅ |

---

**Conclusión**: El `about.json` actual es "básico" porque solo tiene la estructura mínima sin contenido real. La propuesta lo convierte en una página completa y útil que informa a los visitantes sobre la organización, sus valores y su enfoque.
