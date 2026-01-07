# Sistema de Colores - Whole Self Counseling

## 🎨 Paleta de Colores

Este proyecto usa un sistema de colores centralizado y automatizado. Solo necesitas modificar los colores base y el sistema generará automáticamente todas las variaciones.

## 📝 Cómo Cambiar los Colores

**Para cambiar la paleta completa, edita SOLO el archivo: `src/styles/theme-colors.ts`**

```typescript
export const baseColors = {
  white: '#FEFEFE',        // Cambia este valor
  brown: '#765e47',        // Cambia este valor
  lightbrown: '#9c7346',   // Cambia este valor
  softAquaGray: '#D1DADA',  // Cambia este valor
  tealBlue: '#518399',      // Cambia este valor
  blueGreen: '#3e9791',     // Cambia este valor
  navy: '#274776',          // Cambia este valor
};
```

El sistema automáticamente generará:
- **5 tintes** (50, 100, 200, 300, 400) - más claros
- **Color base** (500)
- **5 sombras** (600, 700, 800, 900, 950) - más oscuros

## 🎯 Colores Disponibles

### Colores con Variaciones (50-950)

1. **Brown** (`brown-*`)
   - Base: `#765e47`
   - Usa: `bg-brown-500`, `text-brown-700`, etc.

2. **Light Brown** (`lightbrown-*`)
   - Base: `#9c7346`
   - Usa: `bg-lightbrown-500`, `text-lightbrown-700`, etc.

3. **Soft Aqua Gray** (`softAquaGray-*`)
   - Base: `#D1DADA`
   - Usa: `bg-softAquaGray-500`, `text-softAquaGray-700`, etc.

4. **Teal Blue** (`tealBlue-*`)
   - Base: `#518399`
   - Usa: `bg-tealBlue-500`, `text-tealBlue-700`, etc.

5. **Blue Green** (`blueGreen-*`)
   - Base: `#3e9791`
   - Usa: `bg-blueGreen-500`, `text-blueGreen-700`, etc.

6. **Navy** (`navy-*`)
   - Base: `#274776`
   - Usa: `bg-navy-500`, `text-navy-700`, etc.

### Colores Especiales

- **White** (`white`)
  - Solo el color base: `#FEFEFE`
  - Usa: `bg-white`, `text-white`

### Aliases (Atajos)

Para facilitar el uso, también puedes usar:

- **Primary** → Teal Blue (`primary-*`)
- **Secondary** → Navy (`secondary-*`)
- **Accent** → Brown (`accent-*`)

## 💡 Ejemplos de Uso

### En Componentes React/TSX

```tsx
// Fondo con color base
<div className="bg-tealBlue-500">...</div>

// Fondo claro (tinte)
<div className="bg-tealBlue-100">...</div>

// Fondo oscuro (sombra)
<div className="bg-tealBlue-900">...</div>

// Texto con color
<p className="text-navy-700">...</p>

// Borde con color
<div className="border-2 border-brown-500">...</div>
```

### En Archivos Astro

```astro
<div class="bg-primary-500 text-white">
  Contenido con color primario
</div>

<div class="bg-secondary-800 text-white">
  Contenido con color secundario oscuro
</div>
```

### Gradientes

```tsx
<div className="bg-gradient-to-r from-tealBlue-400 to-tealBlue-600">
  Gradiente de Teal Blue
</div>
```

## 🔄 Flujo de Trabajo

1. **Edita** `src/styles/theme-colors.ts`
2. **Cambia** solo los valores de `baseColors`
3. **Guarda** el archivo
4. **Reinicia** el servidor de desarrollo (`npm run dev`)
5. **¡Listo!** Todos los colores se actualizan automáticamente

## 📊 Estructura de Variaciones

Cada color tiene esta estructura:

```
50   → Muy claro (tinte 95%)
100  → Claro (tinte 90%)
200  → Claro-medio (tinte 75%)
300  → Medio-claro (tinte 50%)
400  → Ligeramente claro (tinte 25%)
500  → Color base (original)
600  → Ligeramente oscuro (sombra 20%)
700  → Medio-oscuro (sombra 40%)
800  → Oscuro (sombra 60%)
900  → Muy oscuro (sombra 75%)
950  → Extremadamente oscuro (sombra 90%)
```

## 🎨 Paleta Actual

| Color | Base | Uso Recomendado |
|-------|------|-----------------|
| White | `#FEFEFE` | Fondos, texto sobre colores oscuros |
| Brown | `#765e47` | Acentos, elementos terrosos |
| Light Brown | `#9c7346` | Acentos claros, elementos terrosos suaves |
| Soft Aqua Gray | `#D1DADA` | Fondos suaves, elementos neutros |
| Teal Blue | `#518399` | Color primario, botones principales |
| Blue Green | `#3e9791` | Elementos secundarios, fondos |
| Navy | `#274776` | Texto, elementos destacados |

