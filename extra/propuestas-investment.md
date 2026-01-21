# Propuestas de Diseño - Página Investment
## WholeSelf Counseling

---

## 📌 Información Recopilada

### ✅ Contenido del Cliente (Estrategia de Contenido)
- **Ubicación**: `docs/presentation-content.txt`
- **Headline Principal**: "Your well-being is worth investing in—we make our pricing clear, accessible, and honest."
- **4 Secciones principales identificadas**:
  1. **Pricing Structure**: Individual Therapy, Group Therapy, Couples/Family Therapy - standard rates, session length, frequency options
  2. **Accepted Insurance Plans**: Complete list, how to verify coverage, out-of-network benefits
  3. **Payment Options**: Insurance billing, self-pay options, sliding scale (if offered), payment plans
  4. **Comprehensive FAQ**: Insurance coverage, out-of-pocket costs, deductibles and copays, cancellation policies

### ✅ Información del Proyecto Actual
- **Página existente**: `src/pages/investment.astro` (básica, solo hero)
- **JSON de contenido**: `src/data/content/pages/investment.json` (estructura mínima)
- **Componentes disponibles**: Card, Accordion, Button, Input
- **Sistema de colores**: blueGreen, navy, brown, lightbrown
- **Heroicons disponibles**: Ya integrados en el proyecto

### ✅ Objetivos UX Clave
- **Claridad financiera**: Información transparente y directa
- **Reducción de fricción**: Acceso fácil a precios, seguros y opciones
- **Confianza**: Transparencia total, sin sorpresas
- **Accesibilidad**: Información fácil de entender para todos
- **Logistics-first**: Prioridad a información práctica

---

## 🎨 LAS 3 PROPUESTAS

### PROPUESTA 1: Tabla de Precios + Cards Informativas ⭐ RECOMENDADA

**Concepto**: Diseño limpio y directo con tabla de precios prominente y cards para información adicional

**Características**:
- **Tabla de precios destacada** al inicio (después del hero)
  - Columnas: Tipo de terapia, Precio por sesión, Duración, Frecuencia
  - Diseño limpio con bordes sutiles
  - Responsive: se convierte en cards en móvil
- **Cards informativas** para seguros y opciones de pago
  - Grid de 2-3 columnas
  - Iconos heroicons distintivos (CreditCardIcon, ShieldCheckIcon, BanknotesIcon)
  - Información concisa y directa
- **FAQ en Accordion** al final
  - Preguntas más comunes expandibles
  - Búsqueda rápida de información
- **CTA claro** para verificar cobertura de seguro

**Ventajas**:
✅ **Máxima claridad**: Precios visibles inmediatamente
✅ **Escaneable**: Información fácil de encontrar
✅ **Profesional**: Diseño limpio y organizado
✅ **Mobile-friendly**: Tabla se adapta a cards
✅ **Puntual**: Información directa sin rodeos

**Ideal para**: Clientes que buscan información rápida y clara sobre precios

**Iconos sugeridos**:
- `CurrencyDollarIcon` - Precios
- `ShieldCheckIcon` - Seguros
- `CreditCardIcon` - Opciones de pago
- `QuestionMarkCircleIcon` - FAQ
- `CheckCircleIcon` - Verificación de cobertura

---

### PROPUESTA 2: Accordion por Categorías

**Concepto**: Secciones expandibles organizadas por categoría (similar a What to Expect)

**Características**:
- **Accordion principal** con 4 secciones:
  1. Pricing Structure (abierta por defecto)
  2. Accepted Insurance Plans
  3. Payment Options
  4. FAQ
- **Cada sección** contiene:
  - Tabla o lista de información
  - Iconos heroicons por categoría
  - Información detallada pero organizada
- **Indicadores visuales**:
  - Colores progresivos (blueGreen variaciones)
  - Badges para información importante
  - Checkmarks para beneficios incluidos
- **Navegación sticky** en desktop (opcional)

**Ventajas**:
✅ **Organizado**: Información agrupada lógicamente
✅ **No abruma**: Contenido revelado progresivamente
✅ **Consistente**: Similar a What to Expect
✅ **Accesible**: Funciona sin JS
✅ **SEO friendly**: Todo el contenido en la página

**Ideal para**: Clientes que prefieren explorar información paso a paso

**Iconos sugeridos**:
- `CurrencyDollarIcon` - Precios
- `ShieldCheckIcon` - Seguros
- `WalletIcon` - Opciones de pago
- `ChatBubbleLeftRightIcon` - FAQ

---

### PROPUESTA 3: Dashboard Visual con Tarjetas

**Concepto**: Dashboard moderno con tarjetas visuales y modales para detalles

**Características**:
- **Grid de tarjetas principales** (3-4 columnas en desktop):
  - Tarjeta "Pricing" con resumen visual
  - Tarjeta "Insurance" con lista de proveedores
  - Tarjeta "Payment Options" con iconos
  - Tarjeta "FAQ" con preguntas destacadas
- **Cada tarjeta** incluye:
  - Icono grande y colorido
  - Información resumida
  - Botón "Learn More" que abre modal o expande
- **Modales/Overlays** para información detallada:
  - Tabla completa de precios
  - Lista completa de seguros
  - Detalles de opciones de pago
- **Visual highlights**:
  - Badges para "Most Popular", "New", etc.
  - Colores distintivos por categoría
  - Animaciones sutiles al hover

**Ventajas**:
✅ **Visualmente atractivo**: Diseño moderno y profesional
✅ **Interactivo**: Exploración progresiva
✅ **No abruma**: Información resumida inicialmente
✅ **Engaging**: Diseño que invita a explorar
✅ **Reutiliza componentes**: Cards y modales existentes

**Ideal para**: Diseño moderno y visual, con exploración interactiva

**Iconos sugeridos**:
- `CurrencyDollarIcon` - Precios
- `ShieldCheckIcon` - Seguros
- `CreditCardIcon` / `WalletIcon` - Pagos
- `QuestionMarkCircleIcon` - FAQ
- `SparklesIcon` - Destacados

---

## 📊 Comparación Rápida

| Aspecto | Tabla + Cards | Accordion | Dashboard |
|---------|---------------|-----------|-----------|
| **Claridad inmediata** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ |
| **Profesionalismo** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **Facilidad de escaneo** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ |
| **Mobile-friendly** | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| **Interactividad** | ⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **Facilidad implementación** | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |
| **Puntualidad** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ |

---

## 🎯 Recomendación

### **PROPUESTA 1: Tabla de Precios + Cards** ⭐

**Razones principales**:
1. **Máxima claridad**: Los precios son lo primero que los clientes buscan - tabla visible inmediatamente
2. **Puntual y directo**: Información sin rodeos, fácil de entender
3. **Profesional**: Diseño limpio que transmite transparencia y confianza
4. **Escaneable**: Los clientes pueden encontrar información rápidamente
5. **Mobile-optimized**: La tabla se convierte en cards en móvil, manteniendo usabilidad
6. **Logistics-first**: Prioriza la información práctica que los clientes necesitan

**Estructura sugerida**:
```
1. Hero Section (con headline principal)
2. Tabla de Precios (destacada, después del hero)
3. Grid de Cards (2-3 columnas):
   - Card: Accepted Insurance Plans
   - Card: Payment Options
   - Card: How to Verify Coverage
4. FAQ Accordion (preguntas más comunes)
5. CTA Section (verificar cobertura, contactar)
```

---

## 🛠️ Detalles de Implementación - Propuesta 1

### Componentes Necesarios:

1. **PricingTable Component** (nuevo)
   - Tabla responsive
   - Se convierte en cards en móvil
   - Estilos con colores del tema

2. **InvestmentCard Component** (nuevo o reutilizar Card)
   - Cards para seguros y opciones de pago
   - Iconos heroicons
   - Información concisa

3. **InsuranceList Component** (opcional)
   - Lista de proveedores de seguros
   - Badges o checkmarks
   - Link para verificar cobertura

4. **PaymentOptionsGrid Component** (opcional)
   - Grid de opciones de pago
   - Iconos distintivos
   - Información breve

5. **InvestmentFAQ Component** (reutilizar Accordion)
   - FAQ expandible
   - Preguntas más comunes

### Estructura JSON sugerida:

```json
{
  "content": {
    "hero": {
      "title": "...",
      "subtitle": "..."
    },
    "pricing": {
      "title": "Pricing Structure",
      "sessions": [
        {
          "type": "Individual Therapy",
          "rate": "$XXX",
          "duration": "XX minutes",
          "frequency": "..."
        }
      ]
    },
    "insurance": {
      "title": "Accepted Insurance Plans",
      "providers": [...],
      "verificationInfo": "..."
    },
    "paymentOptions": {
      "title": "Payment Options",
      "options": [...]
    },
    "faq": {
      "title": "Frequently Asked Questions",
      "questions": [...]
    }
  }
}
```

---

## 📁 Archivos de Referencia

- **Estrategia de contenido**: `docs/presentation-content.txt` (líneas 156-172)
- **Página actual**: `src/pages/investment.astro`
- **JSON actual**: `src/data/content/pages/investment.json`
- **Componentes base**: `src/components/ui/`
- **Ejemplo similar**: `src/pages/services.astro` (estructura de grid)

---

## 🎨 Consideraciones de Diseño

### Colores del Tema:
- **blueGreen**: Para elementos principales y CTAs
- **navy**: Para texto y títulos
- **brown/lightbrown**: Para acentos y elementos decorativos

### Tipografía:
- **Títulos**: Bold, claro, fácil de escanear
- **Contenido**: Legible, tamaño adecuado
- **Precios**: Destacados, fácil de leer

### Espaciado:
- **Generoso**: White space para claridad
- **Consistente**: Márgenes y padding uniformes
- **Respirar**: No abrumar con información

### Iconos:
- **Heroicons outline**: Estilo consistente
- **Tamaño apropiado**: 24px para iconos principales
- **Colores del tema**: Integrados con la paleta

---

**Creado**: 2024-01-15  
**Versión**: 1.0  
**Prioridad**: Alta (Logistics-First UX)
