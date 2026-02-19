# Plan de marketing: animación relanzamiento WholeSelf

Objetivo: crear una animación en formato **landscape** (pantalla de computadora) que funcione como carrusel automático. Cada “slide” del carrusel es una **grid de 3 columnas × 3 filas** (9 celdas) rellenada con elementos de la web (textos, frases, iconos, referencias a imágenes). Al final se muestra el **logo**. La idea es comunicar identidad, servicios, equipo y **por qué hacemos el rediseño** (enfoque emprendimiento).

---

## Especificaciones técnicas

- **Formato:** landscape (ej. 1920×1080 o 16:9).
- **Grid:** **3×3** (9 celdas por slide).
- **Estructura:** 2–3 slides en grid 3×3 por slide → transición automática → slide final con logo.
- **Contenido por celda:** textos cortos, iconos, mini-citas, nombres de secciones o thumbnails de imágenes (las imágenes reales se guardan en `animación/imagenes/`).

---

## Slide 1 — Identidad y propósito (grid 3×3)

**Mensaje central:** Quiénes somos, misión y frase emblemática.

| Col 1 | Col 2 | Col 3 |
|-------|-------|-------|
| 1. **"Healing that centers your wholeself"** (headline) | 2. **Misión y Visión** — formación con justicia social, relaciones y habilidades | 3. **"Humanizando el servicio desde el primer contacto"** (destacado) |
| 4. Imagen/thumbnail: hero (banner-hero-section) | 5. Decolonial healing · Community care · Cultural humility | 6. Culturally-rooted · Virtual & in-person · Insurance · Sliding scale |
| 7. Safe space for your healing journey | 8. Fellowship: Uplifted and Thriving Therapists | 9. How can we help you? — I need help / Loved one / Referral |

**Imagen central sugerida para el slide (opcional):** Hero del home (banner-hero-section) o ilustración “espacio seguro”.

---

## Slide 2 — Servicios y equipo (grid 3×3)

**Mensaje central:** Qué ofrecemos y quién está detrás.

| Col 1 | Col 2 | Col 3 |
|-------|-------|-------|
| 1. **Our Services** / Nuestros Servicios | 2. **Team** / Equipo — "Humanizando el servicio desde el primer contacto" | 3. **Nuevo diseño** — Accesible, claro, profesional |
| 4. Evaluation & Consultation · Individual · Family & Group | 5. Fotos equipo (thumbnails o imagen collage) | 6. Bilingüe EN/ES · Mobile-first · navy, blueGreen |
| 7. Conditions: Anxiety, ADHD, Depression, Trauma… · Immigration Evaluations | 8. Comunidad BIPOC · Fellowship | 9. Servicios · Rates · Contact · Team |

**Imagen central sugerida:** Collage fotos equipo o banner de servicios (banner-services.webp).

---

## Slide 3 — Razones del rediseño (enfoque emprendimiento) (grid 3×13)

**Mensaje central:** Por qué relanzamos el sitio: crecimiento, claridad, impacto.

| Col 1 | Col 2 | Col 3 |
|-------|-------|-------|
| **Por qué rediseñamos** | **Impacto y profesionalidad** | **Llamada a la acción** |
| 1. "Relanzamiento" / "Nuevo sitio" | 1. Primer contacto más humano | 1. "Visítanos" / "Conócenos" |
| 2. Mejor presencia digital | 2. Más confianza para clientes y referidores | 2. ajamoment.com / wholeselfnm.com |
| 3. Claridad en servicios y precios | 3. Mejor captación de clientes | 3. Contact / Consulta |
| 4. Experiencia bilingüe (EN/ES) | 4. Imagen alineada con misión (justicia social, decolonial) | 4. Logo (preview) |
| 5. Emprendimiento: crecer sin perder identidad | 5. Equipo visible y accesible | 5–6. Íconos: Phone, Envelope |
| 6. Sitio más rápido y accesible | 6. Servicios fáciles de encontrar | 7–9. CTAs: I need help, Referral, Rates |
| 7. Contenido editable (Augushub) para mantenerlo vivo | 7. Insurance, sliding scale visibles | 10–13. Frase final + logo pequeño |
| 8–9. "Innovation, resilience, community" (fellowship) | 8–9. Fellowship, formación | |
| 10–13. Celdas: repetir 1–2 razones clave o vacío | 10–13. Idem | |

**Imagen central sugerida:** Gráfico o metáfora de “crecimiento” (ej. planta, camino) o screenshot del nuevo home. Si solo hay **una** imagen central para toda la animación, aquí podría ir el logo grande o un mensaje tipo “Próximamente” / “Nuevo sitio”.

---

## Slide final — Logo

- Una sola pantalla (o celda full-width): **logo de WholeSelf** centrado.
- Opcional: tagline debajo (“Healing that centers your wholeself” o “Humanizando el servicio desde el primer contacto”).
- Fondo: color de marca (navy, blueGreen) o blanco con logo en navy.

---

## Resumen: imagen central única (alternativa)

Si prefieres **una sola imagen central** para toda la animación (no por slide):

- **Opción A:** Imagen del hero actual del home (banner-hero-section.webp) — representa “safe space” y mensaje principal.
- **Opción B:** Logo grande con fondo de color de marca — refuerza identidad.
- **Opción C:** Collage de 3–4 elementos: hero + foto equipo + icono servicios — “todo en uno”.

La grid 3×13 en cada slide puede tener en el **centro** (p. ej. columnas 1–3, filas 5–9) una celda fusionada o área destacada donde se muestre esa imagen central, y el resto de celdas con textos/iconos como en las tablas.

---

## Contenido listo para usar (copy)

- **Frase emblemática:**  
  EN: "Humanizing the service from the very first contact."  
  ES: "Humanizando el servicio desde el primer contacto."

- **Hero headline:**  
  "Healing that centers your wholeself"

- **Misión (corta):**  
  Formar y orientar a clínicos con enfoque en justicia social, relaciones y habilidades; entorno de autorreflexión, cuidado comunitario y humildad cultural.

- **Razones rediseño (emprendimiento):**  
  Mejor presencia digital, claridad en servicios y precios, experiencia bilingüe, sitio rápido y accesible, contenido editable para crecer sin perder identidad, primer contacto más humano, imagen alineada con misión.

---

## Próximos pasos

1. Copiar o exportar imágenes del sitio a `animación/imagenes/` (hero, servicios, equipo, logo).
2. Implementar `index.html` y CSS con grid 3×13, carrusel automático y slide final con logo.
3. Ajustar textos en cada celda según este plan (o variantes bilingües).
4. Opcional: añadir una celda “imagen central” por slide o una sola imagen central para toda la animación.
