# Plantilla Base: Astro + React + Tailwind CSS

Plantilla base reutilizable para proyectos web modernos con arquitectura por capas.

## 🚀 Tecnologías

- **Astro** - Framework web moderno para sitios estáticos y dinámicos
- **React** - Biblioteca para construir interfaces de usuario interactivas
- **Tailwind CSS** - Framework CSS utility-first
- **TypeScript** - Tipado estático para JavaScript

## 📁 Estructura del Proyecto

```
proyecto/
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

