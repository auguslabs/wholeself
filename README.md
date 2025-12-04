# Plantilla Base: Astro + React + Tailwind CSS

Plantilla base reutilizable para proyectos web modernos con arquitectura por capas.

## 🚀 Tecnologías

- **Astro** - Framework web moderno para sitios estáticos y dinámicos
- **React** - Biblioteca para construir interfaces de usuario interactivas
- **Tailwind CSS** - Framework CSS utility-first
- **TypeScript** - Tipado estático para JavaScript

## 📁 Estructura del Proyecto

```
Aretal/
├── src/
│   ├── components/          # Componentes React reutilizables
│   │   ├── ui/              # Componentes UI básicos (Button, Card, Input)
│   │   └── layout/          # Componentes de layout (Header, Footer, Container)
│   ├── layouts/             # Layouts de Astro
│   ├── pages/               # Páginas de Astro (routing automático)
│   ├── data/                # Capa de datos
│   │   ├── models/          # Tipos/interfaces de datos
│   │   └── mock/            # Datos de ejemplo/mock
│   ├── services/            # Capa de servicios (API calls, lógica de negocio)
│   ├── hooks/               # Custom React hooks
│   ├── utils/               # Utilidades y helpers
│   ├── styles/              # Estilos globales
│   │   └── global.css       # Estilos base de Tailwind
│   └── env.d.ts             # Tipos de entorno
├── public/                  # Assets estáticos
├── astro.config.mjs         # Configuración de Astro
├── tailwind.config.mjs      # Configuración de Tailwind
├── tsconfig.json            # Configuración de TypeScript
└── package.json             # Dependencias
```

## 🏗️ Arquitectura por Capas

### Capa de Datos (`src/data/`)
- **models/**: Define los tipos e interfaces de datos (TypeScript)
- **mock/**: Datos de ejemplo para desarrollo y testing

### Capa de Servicios (`src/services/`)
- Lógica de negocio
- Comunicación con APIs externas
- Manejo de datos y transformaciones

### Capa de UI (`src/components/`)
- **ui/**: Componentes UI básicos reutilizables
- **layout/**: Componentes de estructura (Header, Footer, etc.)

### Capa de Presentación (`src/pages/`)
- Páginas de Astro con routing automático
- Integración de componentes React y datos

## 🛠️ Instalación

1. **Instalar dependencias:**
   ```bash
   npm install
   ```

2. **Iniciar servidor de desarrollo:**
   ```bash
   npm run dev
   ```

3. **Construir para producción:**
   ```bash
   npm run build
   ```

4. **Previsualizar build de producción:**
   ```bash
   npm run preview
   ```

## 🎯 Usar como Plantilla para Nuevos Proyectos

### Pasos Rápidos:

1. **Copia esta carpeta** a tu nueva ubicación y renómbrala
2. **Edita `package.json`**: Cambia el `name` y `description`
3. **Personaliza branding**: Favicon, título en `BaseLayout.astro`, Header/Footer
4. **Instala dependencias**: `npm install`
5. **¡Empieza a construir!**: `npm run dev`

📖 **Ver `GUIA_INICIO_RAPIDO.md` para instrucciones detalladas y recomendaciones.**

## 📱 Convertir en PWA (Progressive Web App)

Esta plantilla puede convertirse fácilmente en una PWA completa.

**📖 Ver `GUIA_PWA.md` para la guía completa paso a paso.**

**Resumen rápido:**
1. Instalar `vite-plugin-pwa`
2. Configurar `astro.config.mjs` con PWA
3. Crear íconos PWA (192x192 y 512x512)
4. Actualizar meta tags en `BaseLayout.astro`
5. (Opcional) Agregar componente de instalación

**Archivos de ejemplo:** Ver carpeta `ejemplos-pwa/` para código de referencia.

## 🔥 Integrar Firebase como Backend

Esta plantilla puede integrarse fácilmente con Firebase para tener un backend completo.

**📖 Ver `GUIA_FIREBASE.md` para la guía completa paso a paso.**

**Resumen rápido:**
1. Instalar `firebase`
2. Crear proyecto en Firebase Console
3. Configurar variables de entorno
4. Crear servicios (auth, firestore, storage)
5. Habilitar servicios en Firebase Console
6. Configurar reglas de seguridad

**Archivos de ejemplo:** Ver carpeta `ejemplos-firebase/` para código de referencia.

## 🚀 Desplegar en Producción

Esta plantilla puede desplegarse fácilmente en múltiples plataformas.

**📖 Ver `GUIA_DESPLIEGUE.md` para la guía completa paso a paso.**

**Opciones disponibles:**
- **Netlify** (⭐ Recomendado) - Más fácil, builds automáticos, preview deployments
- **Vercel** - Excelente para Astro, builds rápidos
- **GitHub Pages** - Gratis, integrado con GitHub
- **Firebase Hosting** - Perfecto si usas Firebase

**Resumen rápido:**
1. Elegir plataforma (recomendamos Netlify)
2. Conectar repositorio de GitHub
3. Configurar build settings
4. ¡Desplegar!

**Archivos de ejemplo:** Ver carpeta `ejemplos-despliegue/` para configuraciones de referencia.

## 🔄 Cache y Versionamiento Automático

Esta plantilla incluye configuración para que los usuarios siempre vean la versión más reciente automáticamente.

**📖 Ver `CACHE_RESUMEN_RAPIDO.md` para inicio rápido.**

**📖 Ver `EXPLICACION_CACHE_VERSIONAMIENTO.md` para entender cómo funciona.**

**📖 Ver `GUIA_CACHE_VERSIONAMIENTO.md` para implementación completa.**

**Resumen:**
- ✅ Astro genera hashes únicos automáticamente (cache busting)
- ✅ Cada commit genera una nueva versión
- ✅ Los usuarios ven actualizaciones automáticamente
- ✅ Headers de cache optimizados para mejor rendimiento

## 📝 Uso

### Crear un nuevo componente React

```tsx
// src/components/ui/MyComponent.tsx
import React from 'react';

interface MyComponentProps {
  title: string;
}

export function MyComponent({ title }: MyComponentProps) {
  return <div>{title}</div>;
}
```

### Usar un componente en una página Astro

```astro
---
import { MyComponent } from '@/components/ui/MyComponent';
---

<MyComponent title="Hola" client:load />
```

### Agregar un nuevo modelo de datos

```typescript
// src/data/models/index.ts
export interface MyModel {
  id: string;
  name: string;
}
```

### Crear un servicio

```typescript
// src/services/myService.ts
import type { MyModel } from '@/data/models';

export async function getMyData(): Promise<MyModel[]> {
  // Lógica del servicio
  return [];
}
```

## 🎨 Personalización

### Colores de Tailwind

Edita `tailwind.config.mjs` para personalizar los colores del tema:

```js
theme: {
  extend: {
    colors: {
      primary: {
        // Tus colores personalizados
      },
    },
  },
}
```

### Path Aliases

Los path aliases están configurados en `tsconfig.json`:

- `@/components` → `src/components`
- `@/layouts` → `src/layouts`
- `@/pages` → `src/pages`
- `@/data` → `src/data`
- `@/services` → `src/services`
- `@/hooks` → `src/hooks`
- `@/utils` → `src/utils`
- `@/styles` → `src/styles`

## 🔄 Modo de Renderizado

Por defecto, el proyecto está configurado para **SSG (Static Site Generation)**.

Para habilitar **SSR (Server-Side Rendering)**, edita `astro.config.mjs`:

```js
import node from '@astrojs/node';

export default defineConfig({
  output: 'server',
  adapter: node(),
});
```

## 📚 Recursos

- [Documentación de Astro](https://docs.astro.build)
- [Documentación de React](https://react.dev)
- [Documentación de Tailwind CSS](https://tailwindcss.com/docs)
- [Documentación de TypeScript](https://www.typescriptlang.org/docs)

## 🚀 Escalabilidad

Esta plantilla está diseñada para escalar fácilmente:

1. **Agregar nuevas capas**: Simplemente crea nuevas carpetas en `src/`
2. **Extender componentes**: Los componentes base pueden ser extendidos o modificados
3. **Agregar servicios**: Nuevos servicios se agregan en `src/services/`
4. **Nuevos modelos**: Define nuevos tipos en `src/data/models/`

## 📄 Licencia

Este es un template base. Úsalo como base para tus proyectos.

