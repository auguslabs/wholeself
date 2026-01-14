# Plan: Selector de Idioma - Opciones de Diseño

## 🎯 Objetivo
Implementar un selector de idioma (ES/EN) que mantenga el diseño minimalista del sitio, sea discreto pero accesible, y se integre armoniosamente con el diseño existente.

---

## 📐 Contexto del Diseño Actual

### Header Actual:
- **Logo:** Centrado, grande (h-28 md:h-36)
- **Botón "menu":** Texto simple en `tealBlue-600`, sin ícono
- **Fondo:** `bg-blueGreen-300` en header
- **Menú desktop:** Se despliega desde el centro, animación suave
- **Botón Crisis Resources:** Flotante, esquina inferior derecha, `navy-600`

### Paleta de Colores Disponible:
- `tealBlue-600` (#518399) - Color principal, usado en botones
- `blueGreen-300` (#3e9791) - Fondo del header
- `navy-600` (#274776) - Botones importantes
- Blanco con transparencia para overlays

---

## 🎨 OPCIONES DE DISEÑO

### **OPCIÓN A: Ícono Flotante Pequeño (Esquina Superior Derecha)** ⭐

**Ubicación:** `fixed top-4 right-4` (o `top-6 right-6`)

**Diseño Visual:**
```
┌─────────────────────────────────────┐
│                                     │
│                    [🌐]  ← Aquí     │
│                                     │
│         [LOGO CENTRADO]             │
│                                     │
└─────────────────────────────────────┘
```

**Características:**
- Ícono: `GlobeAmericasIcon` de Heroicons
- Tamaño: `w-5 h-5` (móvil) / `w-6 h-6` (desktop)
- Estilo: Círculo pequeño con fondo `bg-white/80 backdrop-blur-sm`
- Borde: `border border-tealBlue-200/50`
- Sombra: `shadow-md hover:shadow-lg`
- Color ícono: `text-tealBlue-600` (consistente con botón "menu")

**Comportamiento:**
- ✅ Se desvanece al hacer scroll (opacity: 0.4 cuando scroll > 50px)
- ✅ Vuelve a aparecer al detener scroll (1 segundo sin scroll)
- ✅ Vuelve a opacidad completa al hacer hover
- ✅ Al hacer clic: muestra dropdown pequeño con "English" y "Español"
- ✅ Check (✓) en el idioma activo

**Ventajas:**
- ✅ Siempre accesible
- ✅ No interfiere con el diseño
- ✅ Muy minimalista
- ✅ Comportamiento inteligente (se oculta cuando no se necesita)

**Desventajas:**
- Puede competir visualmente con el botón de Crisis Resources (pero están en esquinas opuestas)

**Z-index:** `z-50` (por encima del header pero no bloquea contenido)

---

### **OPCIÓN B: En el Header, Esquina Superior Derecha**

**Ubicación:** Dentro del header, `absolute top-2 right-4`

**Diseño Visual:**
```
┌─────────────────────────────────────┐
│                    [🌐]  ← Aquí     │
│         [LOGO CENTRADO]              │
│                                     │
│              [menu]                 │
└─────────────────────────────────────┘
```

**Características:**
- Mismo estilo que Opción A pero dentro del header
- Se mueve con el header (si el header es sticky)
- Tamaño: `w-5 h-5` (más pequeño para no competir con el logo)

**Comportamiento:**
- ✅ Siempre visible cuando el header es visible
- ✅ Se oculta si el header se oculta al hacer scroll
- ✅ Sin desvanecimiento (está en el header, no flotante)

**Ventajas:**
- ✅ Integrado en el header
- ✅ Consistente con otros controles del header
- ✅ No flotante, menos "ruido visual"

**Desventajas:**
- Puede quedar oculto si el header se oculta al hacer scroll
- Puede competir visualmente con el logo centrado

---

### **OPCIÓN C: Junto al Botón "menu" (Desktop)**

**Ubicación:** En el menú desktop, a la derecha del botón "menu" central

**Diseño Visual:**
```
┌─────────────────────────────────────┐
│                                     │
│         [LOGO CENTRADO]             │
│                                     │
│  home  services  [menu] [🌐]  team  │
│                  ↑      ↑           │
│                  aquí   aquí        │
└─────────────────────────────────────┘
```

**Características:**
- Dentro del grid del menú desktop
- Mismo estilo que el botón "menu" (texto simple o ícono pequeño)
- Tamaño: `w-5 h-5` o texto "ES/EN"

**Comportamiento:**
- ✅ Solo visible cuando el menú está abierto
- ✅ Parte de la animación del menú
- ✅ Al hacer clic: cambia idioma directamente o muestra dropdown

**Ventajas:**
- ✅ Integrado en el flujo del menú
- ✅ No añade elementos flotantes
- ✅ Consistente con el diseño del menú

**Desventajas:**
- Solo disponible cuando el menú está abierto
- En móvil no estaría disponible (el menú móvil es diferente)

---

### **OPCIÓN D: Texto Simple "ES/EN" (Ultra Minimalista)**

**Ubicación:** Esquina superior derecha, dentro del header

**Diseño Visual:**
```
┌─────────────────────────────────────┐
│                    ES/EN  ← Aquí       │
│         [LOGO CENTRADO]                │
│                                       │
└───────────────────────────────────────┘
```

**Características:**
- Solo texto: "ES" o "EN" según el idioma activo
- Estilo: `text-tealBlue-600 text-sm font-medium`
- Sin fondo, sin borde, solo texto
- Al hacer clic: cambia directamente entre ES y EN

**Comportamiento:**
- ✅ Cambio directo (sin dropdown)
- ✅ Muy minimalista
- ✅ Se desvanece al hacer scroll (opacity: 0.3)

**Ventajas:**
- ✅ Ultra minimalista
- ✅ No añade elementos visuales pesados
- ✅ Muy discreto

**Desventajas:**
- Menos obvio que es un selector de idioma
- Puede ser confuso para algunos usuarios

---

### **OPCIÓN E: Combinación - Flotante + Desvanecimiento Inteligente**

**Ubicación:** `fixed top-4 right-4` (flotante)

**Diseño Visual:**
```
┌─────────────────────────────────────┐
│                                     │
│                    [🌐]  ← Aquí     │
│         [LOGO CENTRADO]             │
│                                     │
│              [menu]                 │
│                                     │
│                          [Crisis]   │
└─────────────────────────────────────┘
```

**Características:**
- Ícono pequeño flotante
- **Comportamiento inteligente:**
  - Scroll activo: opacity 0.3 (casi invisible)
  - Sin scroll por 1s: opacity 1.0 (visible)
  - Hover: opacity 1.0 (siempre visible)
  - Scroll hacia arriba (volviendo al top): opacity 1.0 inmediatamente

**Ventajas:**
- ✅ Se oculta cuando el usuario está navegando
- ✅ Aparece cuando el usuario se detiene o vuelve arriba
- ✅ Muy discreto pero accesible

**Desventajas:**
- Puede ser difícil de encontrar si el usuario no sabe que existe

---

### **OPCIÓN F: En el Menú Móvil**

**Ubicación:** Dentro del menú móvil cuando está abierto

**Diseño Visual (Móvil):**
```
┌─────────────────────┐
│  [Menú Móvil]       │
│                     │
│  what to expect     │
│  rates              │
│  services           │
│  contact            │
│  team               │
│  home               │
│                     │
│  ─────────────      │
│  [🌐] English       │
│      Español        │
└─────────────────────┘
```

**Características:**
- Aparece como última opción en el menú móvil
- O como botón pequeño en la parte superior del menú móvil
- Solo visible en móvil

**Ventajas:**
- ✅ No interfiere con el diseño desktop
- ✅ Accesible en móvil dentro del menú

**Desventajas:**
- No disponible en desktop (necesitaría otra ubicación)
- Requiere abrir el menú para acceder

---

## 🎯 RECOMENDACIONES

### **Recomendación Principal: OPCIÓN A + Comportamiento de OPCIÓN E**

**Por qué:**
1. ✅ Siempre accesible pero discreto
2. ✅ Se oculta inteligentemente al navegar
3. ✅ No interfiere con el diseño minimalista
4. ✅ Consistente con el estilo del sitio (mismo color que botón "menu")
5. ✅ Funciona bien en desktop y móvil

### **Alternativa Ultra Minimalista: OPCIÓN D**

Si quieren algo aún más discreto, la opción D (solo texto "ES/EN") es la más minimalista posible.

---

## 📱 Consideraciones Responsive

### Desktop (> 768px):
- Ícono más grande: `w-6 h-6`
- Posición: `top-6 right-6`
- Dropdown más espacioso

### Móvil (< 768px):
- Ícono más pequeño: `w-5 h-5`
- Posición: `top-4 right-4`
- Dropdown compacto
- Considerar agregar también en el menú móvil (Opción F)

---

## 🎨 Detalles de Estilo Propuestos

### Ícono (Opción A/E):
```css
- Tamaño: w-5 h-5 (móvil) / w-6 h-6 (desktop)
- Fondo: bg-white/80 backdrop-blur-sm
- Borde: border border-tealBlue-200/50
- Sombra: shadow-md hover:shadow-lg
- Color: text-tealBlue-600
- Padding: p-2
- Border-radius: rounded-full
- Transición: transition-all duration-300
```

### Dropdown:
```css
- Fondo: bg-white
- Sombra: shadow-xl
- Borde: border border-tealBlue-200/50
- Ancho: w-32
- Border-radius: rounded-lg
- Animación: fade-in slide-in-from-top
```

### Estado Activo (idioma seleccionado):
```css
- Fondo: bg-tealBlue-50
- Texto: text-tealBlue-700 font-semibold
- Check: ✓ en color tealBlue-600
```

---

## 🔄 Comportamiento de Cambio de Idioma

### Opción 1: Cambio Inmediato (Recomendado para MVP)
- Al hacer clic en el idioma, cambia inmediatamente
- Guarda preferencia en `localStorage`
- Recarga la página o actualiza el contenido dinámicamente

### Opción 2: Con Rutas (Futuro)
- Cambia la URL: `/en/` o `/es/`
- Navegación sin recargar (usando View Transitions de Astro)
- Mejor para SEO

---

## ✅ Checklist de Implementación

- [ ] Decidir opción de diseño (A, B, C, D, E, F o combinación)
- [ ] Crear componente `LanguageSelector.tsx`
- [ ] Integrar en `Header.tsx`
- [ ] Implementar detección de idioma del navegador
- [ ] Implementar guardado en `localStorage`
- [ ] Agregar animaciones de desvanecimiento
- [ ] Probar en desktop y móvil
- [ ] Verificar accesibilidad (aria-labels, keyboard navigation)
- [ ] Conectar con sistema de contenido (actualizar textos según idioma)
- [ ] (Futuro) Implementar rutas con prefijo `/en/` y `/es/`

---

## 💡 Preguntas para Decidir

1. **¿Prefieren flotante o integrado en el header?**
   - Flotante: Opción A, E
   - Integrado: Opción B, C

2. **¿Prefieren ícono o texto?**
   - Ícono: Opción A, B, C, E, F
   - Texto: Opción D

3. **¿Quieren dropdown o cambio directo?**
   - Dropdown: Opción A, B, C, E, F
   - Directo: Opción D

4. **¿Quieren que se desvanezca al hacer scroll?**
   - Sí: Opción A, E
   - No: Opción B, C, D

5. **¿Necesitan acceso en móvil dentro del menú?**
   - Sí: Considerar Opción F además de la principal
   - No: Solo la opción principal

---

## 📝 Notas Finales

- El diseño actual es muy minimalista, así que cualquier opción debe ser discreta
- El color `tealBlue-600` ya se usa en el botón "menu", mantener consistencia
- El botón de Crisis Resources está en esquina inferior derecha, el selector de idioma en superior derecha no compite
- Considerar accesibilidad: aria-labels claros, keyboard navigation, contraste adecuado
