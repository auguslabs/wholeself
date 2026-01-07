# Guía Completa: Deploy en Netlify - Whole Self Counseling

## 📋 Índice
1. [Preparación del Proyecto](#1-preparación-del-proyecto)
2. [Crear Cuenta en Netlify](#2-crear-cuenta-en-netlify)
3. [Método 1: Deploy desde Git (Recomendado)](#3-método-1-deploy-desde-git-recomendado)
4. [Método 2: Deploy Manual (Drag & Drop)](#4-método-2-deploy-manual-drag--drop)
5. [Configuración del Build](#5-configuración-del-build)
6. [Verificar el Deploy](#6-verificar-el-deploy)
7. [Configurar Dominio Personalizado (Opcional)](#7-configurar-dominio-personalizado-opcional)
8. [Enviar Link al Cliente](#8-enviar-link-al-cliente)
9. [Solución de Problemas Comunes](#9-solución-de-problemas-comunes)

---

## 1. Preparación del Proyecto

### 1.1 Verificar que el proyecto compile correctamente

Abre una terminal en la raíz del proyecto y ejecuta:

```bash
# Instalar dependencias (si no lo has hecho)
npm install

# Hacer build del proyecto
npm run build
```

**✅ Verificación:** Debe crear una carpeta `dist/` con todos los archivos estáticos. Si hay errores, corrígelos antes de continuar.

### 1.2 Verificar el build localmente (Opcional pero recomendado)

```bash
# Previsualizar el build
npm run preview
```

Abre `http://localhost:4321` en tu navegador y verifica que todo funcione correctamente.

### 1.3 Verificar archivos importantes

Asegúrate de que estos archivos existan:
- ✅ `package.json` (con scripts de build)
- ✅ `astro.config.mjs` (configurado correctamente)
- ✅ Carpeta `public/` con assets estáticos
- ✅ Carpeta `src/` con el código fuente

---

## 2. Crear Cuenta en Netlify

### 2.1 Registrarse en Netlify

1. Ve a [https://www.netlify.com](https://www.netlify.com)
2. Click en **"Sign up"** o **"Log in"**
3. Puedes registrarte con:
   - GitHub (recomendado si usas Git)
   - GitLab
   - Bitbucket
   - Email

### 2.2 Verificar tu cuenta

Revisa tu email y confirma tu cuenta si es necesario.

---

## 3. Método 1: Deploy desde Git (Recomendado)

Este método es el mejor porque Netlify se actualiza automáticamente cada vez que haces push a tu repositorio.

### 3.1 Preparar el repositorio Git

Si aún no tienes un repositorio Git:

```bash
# Inicializar Git (si no lo has hecho)
git init

# Agregar todos los archivos
git add .

# Hacer commit inicial
git commit -m "Initial commit - Ready for Netlify deploy"

# Crear repositorio en GitHub/GitLab/Bitbucket y conectar
git remote add origin [URL_DE_TU_REPOSITORIO]
git push -u origin main
```

**⚠️ IMPORTANTE: ¿Qué debo subir a GitHub?**

**✅ CORRECTO:** Sube **TODO el proyecto** (carpetas `src/`, `public/`, archivos de configuración, `package.json`, etc.)

**❌ INCORRECTO:** NO subas solo la carpeta `dist/`

**¿Por qué?**
- Netlify necesita el **código fuente completo** para ejecutar el build
- Netlify ejecutará `npm run build` automáticamente y generará la carpeta `dist` por ti
- La carpeta `dist` es el resultado del build, no el código fuente
- Si solo subes `dist`, Netlify no podrá hacer el build porque no tendrá:
  - El código fuente (`src/`)
  - Las dependencias (`package.json`, `node_modules/`)
  - Los archivos de configuración (`astro.config.mjs`, `tailwind.config.mjs`, etc.)
  - Los assets estáticos (`public/`)

**Resumen:** Sube todo el proyecto a GitHub. Netlify se encargará del resto.

---

### 📚 Entendiendo el Proceso Completo: ¿Debo subir la carpeta `dist/`?

**Respuesta corta:** **NO, no debes subir la carpeta `dist/` a GitHub.**

#### 🔄 Cómo funciona el proceso:

1. **En tu computadora (local):**
   ```bash
   npm run build  # Genera la carpeta dist/ localmente
   ```
   - Esto crea `dist/` con los archivos compilados
   - Esta carpeta es solo para probar localmente con `npm run preview`

2. **En GitHub (repositorio):**
   - Solo subes el **código fuente** (sin `dist/`)
   - El archivo `.gitignore` ya está configurado para ignorar `dist/`
   - Esto es correcto ✅

3. **En Netlify (producción):**
   - Netlify clona tu repositorio de GitHub
   - Netlify ejecuta `npm install` (instala dependencias)
   - Netlify ejecuta `npm run build` (genera su propia carpeta `dist/`)
   - Netlify publica esa carpeta `dist/` en internet

#### ❓ ¿Por qué NO subir `dist/`?

1. **Es código generado:** `dist/` se crea automáticamente, no es código fuente
2. **Puede causar conflictos:** Si subes `dist/` y Netlify genera otra `dist/`, pueden haber diferencias
3. **Ocupa espacio innecesario:** `dist/` puede ser grande y no necesita estar en Git
4. **Cada entorno es diferente:** Tu `dist/` local puede ser diferente al de Netlify (por variables de entorno, etc.)

#### ✅ Lo que SÍ debes subir:

```
✅ src/              (código fuente)
✅ public/           (assets estáticos)
✅ package.json      (dependencias)
✅ astro.config.mjs  (configuración)
✅ tailwind.config.mjs
✅ netlify.toml
✅ .gitignore        (ya incluye dist/)
✅ Todos los archivos de configuración
```

#### ❌ Lo que NO debes subir:

```
❌ dist/             (se genera automáticamente)
❌ node_modules/     (se instala con npm install)
❌ .env              (variables de entorno sensibles)
```

#### 🎯 Resumen del flujo:

```
Tu computadora:
  Código fuente → npm run build → dist/ (solo para probar localmente)

GitHub:
  Solo código fuente (sin dist/)

Netlify:
  Clona GitHub → npm install → npm run build → dist/ → Publica en internet
```

**Conclusión:** Tu carpeta `dist/` local es solo para pruebas. Netlify generará su propia `dist/` cuando haga el deploy. No necesitas subirla a GitHub.

### 3.2 Conectar Netlify con tu repositorio

1. En Netlify, click en **"Add new site"** → **"Import an existing project"**
2. Selecciona tu proveedor de Git (GitHub, GitLab, o Bitbucket)
3. Autoriza Netlify para acceder a tus repositorios
4. Selecciona el repositorio del proyecto **wholeself**
5. Netlify detectará automáticamente que es un proyecto Astro

### 3.3 Configurar Build Settings

Netlify debería detectar automáticamente:
- **Build command:** `npm run build`
- **Publish directory:** `dist`

**Verifica que estos valores sean correctos:**
- **Base directory:** (dejar vacío)
- **Build command:** `npm run build`
- **Publish directory:** `dist`

### 3.4 Configurar Variables de Entorno (Si las necesitas)

#### 📚 ¿Qué son las Variables de Entorno?

Las **variables de entorno** son valores de configuración que pueden cambiar según el entorno (desarrollo, producción, etc.) sin modificar el código. Son útiles para:

- **URLs de APIs:** Diferentes URLs para desarrollo y producción
- **Claves de API:** Tokens secretos que no deben estar en el código
- **Configuraciones:** Valores que cambian entre entornos
- **Datos sensibles:** Información que no debe estar en el repositorio

#### 🔍 ¿Cómo saber si tu proyecto usa Variables de Entorno?

Busca en tu código estas referencias:

1. **En archivos `.ts`, `.tsx`, `.js`, `.jsx`, `.astro`:**
   ```javascript
   import.meta.env.PUBLIC_ALGO
   import.meta.env.VITE_ALGO
   process.env.ALGO
   ```

2. **En tu proyecto actual:**
   - ✅ **SÍ usa variables de entorno**
   - 📁 Archivo: `src/services/api.ts`
   - 🔍 Línea 11: `import.meta.env.PUBLIC_API_URL`
   - 📝 **Tu proyecto espera:** `PUBLIC_API_URL` para la URL base de la API

#### 💡 ¿Para qué puedes usar Variables de Entorno?

**Ejemplos comunes:**

1. **URLs de APIs:**
   ```javascript
   // Desarrollo
   PUBLIC_API_URL=https://api-dev.ejemplo.com
   
   // Producción
   PUBLIC_API_URL=https://api.ejemplo.com
   ```

2. **Claves de API públicas:**
   ```javascript
   PUBLIC_GOOGLE_MAPS_KEY=tu_clave_aqui
   PUBLIC_ANALYTICS_ID=G-XXXXXXXXXX
   ```

3. **Configuraciones:**
   ```javascript
   PUBLIC_SITE_NAME=Whole Self Counseling
   PUBLIC_CONTACT_EMAIL=info@wholeself.com
   ```

4. **Modo de desarrollo:**
   ```javascript
   PUBLIC_DEBUG_MODE=true  // solo en desarrollo
   ```

#### ⚠️ Reglas Importantes en Astro:

1. **Variables PÚBLICAS** (visibles en el navegador):
   - Deben empezar con `PUBLIC_`
   - Ejemplo: `PUBLIC_API_URL`
   - Se acceden con: `import.meta.env.PUBLIC_API_URL`

2. **Variables PRIVADAS** (solo en el servidor):
   - NO empiezan con `PUBLIC_`
   - Ejemplo: `DATABASE_PASSWORD`
   - Solo disponibles durante el build en Astro

3. **Seguridad:**
   - ❌ NUNCA pongas claves secretas en variables `PUBLIC_`
   - ✅ Las variables `PUBLIC_` se incluyen en el código JavaScript final
   - ✅ Cualquiera puede verlas en el navegador

#### 🔧 Cómo Configurar en Netlify:

**Si tu proyecto usa variables de entorno (como el tuyo):**

1. En Netlify, ve a tu sitio
2. Click en **"Site settings"** → **"Environment variables"**
3. Click en **"Add a variable"**
4. Agrega cada variable:
   - **Key:** `PUBLIC_API_URL` (o el nombre que uses)
   - **Value:** `https://api.tu-servicio.com` (tu URL real)
   - **Scopes:** Selecciona en qué entornos aplica (Production, Deploy previews, Branch deploys)

**Ejemplo para tu proyecto:**
```
Key: PUBLIC_API_URL
Value: https://api.wholeselfcounseling.com
Scope: All scopes (o solo Production)
```

#### 📝 Crear archivo `.env` local (Opcional)

Para desarrollo local, puedes crear un archivo `.env` en la raíz del proyecto:

```bash
# .env (este archivo NO se sube a GitHub, ya está en .gitignore)
PUBLIC_API_URL=https://api-dev.wholeselfcounseling.com
```

**Nota:** El archivo `.env` ya está en tu `.gitignore`, así que no se subirá a GitHub.

#### ✅ Verificar si necesitas configurar algo:

**Tu proyecto actual:**
- ✅ Usa `PUBLIC_API_URL` en `src/services/api.ts`
- ⚠️ Si no configuras la variable, usará el valor por defecto: `'https://api.example.com'`
- 💡 **Recomendación:** Configura `PUBLIC_API_URL` en Netlify con la URL real de tu API (si tienes una)

**Si NO tienes una API real aún:**
- Puedes dejar el valor por defecto
- O configurar la variable más adelante cuando tengas la API

### 3.5 Hacer el primer deploy

1. Click en **"Deploy site"**
2. Netlify comenzará a construir tu sitio
3. Espera a que termine (puede tomar 1-3 minutos)

---

## 4. Método 2: Deploy Manual (Drag & Drop)

Si prefieres no usar Git o necesitas un deploy rápido:

### 4.1 Construir el proyecto localmente

```bash
# Asegúrate de estar en la raíz del proyecto
npm run build
```

### 4.2 Hacer deploy manual

1. En Netlify, ve a **"Sites"** en el dashboard
2. Arrastra y suelta la carpeta **`dist`** en el área de deploy
3. Netlify procesará el deploy automáticamente

**⚠️ Nota:** Con este método, cada cambio requiere hacer build local y volver a arrastrar la carpeta.

---

## 5. Configuración del Build

### 5.1 Crear archivo `netlify.toml` (Opcional pero recomendado)

Crea un archivo `netlify.toml` en la raíz del proyecto:

```toml
[build]
  command = "npm run build"
  publish = "dist"

[build.environment]
  NODE_VERSION = "18"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

Este archivo asegura que Netlify use la configuración correcta incluso si cambias algo en el dashboard.

### 5.2 Verificar configuración de Astro

Asegúrate de que `astro.config.mjs` tenga:
```javascript
output: 'static', // Para sitios estáticos
```

---

## 6. Verificar el Deploy

### 6.1 Revisar el log del build

1. En Netlify, ve a **"Deploys"** en tu sitio
2. Click en el deploy más reciente
3. Revisa el log para verificar que no haya errores

**✅ Busca estas líneas en el log:**
```
✔ Completed in Xs
Site is live ✨
```

### 6.2 Visitar el sitio

1. Netlify te dará una URL automática como: `https://random-name-123456.netlify.app`
2. Click en la URL o en **"Open production deploy"**
3. Navega por todas las páginas para verificar que funcionen:
   - Home (`/`)
   - About (`/about`)
   - Services (`/services`)
   - Team (`/team`)
   - Contact (`/contact`)
   - Investment (`/investment`)
   - What to Expect (`/what-to-expect`)
   - Crisis Resources (`/crisis-resources`)

### 6.3 Verificar funcionalidades

- ✅ Navegación funciona
- ✅ Formularios cargan (si los hay)
- ✅ Imágenes se muestran correctamente
- ✅ Estilos CSS se aplican
- ✅ JavaScript funciona (componentes React)
- ✅ Links internos funcionan
- ✅ Responsive design funciona en móvil

---

## 7. Configurar Dominio Personalizado (Opcional)

Si quieres usar un dominio personalizado (ej: `wholeselfcounseling.com`):

### 7.1 Agregar dominio en Netlify

1. Ve a **"Site settings"** → **"Domain management"**
2. Click en **"Add custom domain"**
3. Ingresa tu dominio
4. Sigue las instrucciones para configurar DNS

### 7.2 Configurar DNS

Netlify te dará instrucciones específicas. Generalmente necesitas:
- Agregar un registro CNAME o A
- Esperar a que se propague (puede tomar hasta 48 horas)

---

## 8. Enviar Link al Cliente

### 8.1 Obtener el link del sitio

1. En el dashboard de Netlify, tu sitio tiene una URL única
2. Copia la URL (ej: `https://wholeself-counseling.netlify.app`)

### 8.2 Preparar mensaje para el cliente

**Ejemplo de mensaje:**

```
Hola [Nombre del Cliente],

He completado el primer deploy del sitio web de Whole Self Counseling. 
Puedes verlo en el siguiente link:

🔗 [URL_DEL_SITIO]

Por favor, revisa el sitio y compárteme cualquier feedback o cambios que 
quieras hacer. Estoy aquí para ajustar lo que necesites.

Saludos,
[Tu nombre]
```

### 8.3 Enviar el link

- Email
- Mensaje directo
- Slack/Teams (si trabajan en equipo)

---

## 9. Solución de Problemas Comunes

### ❌ Error: "Build failed"

**Causas comunes:**
- Dependencias no instaladas
- Error en el código
- Variables de entorno faltantes

**Solución:**
1. Revisa el log del build en Netlify
2. Prueba hacer build local: `npm run build`
3. Corrige los errores que aparezcan
4. Vuelve a hacer deploy

### ❌ Error: "Page not found" en rutas

**Causa:** Astro necesita configuración para rutas dinámicas.

**Solución:** Asegúrate de que `astro.config.mjs` tenga:
```javascript
output: 'static'
```

Y crea `netlify.toml` con las reglas de redirect (ver sección 5.1).

### ❌ Imágenes no se cargan

**Causa:** Rutas incorrectas a assets.

**Solución:**
- Asegúrate de que las imágenes estén en `public/`
- Usa rutas absolutas desde la raíz: `/logo.svg` (no `./logo.svg`)

### ❌ Estilos CSS no se aplican

**Causa:** Tailwind no se está compilando correctamente.

**Solución:**
1. Verifica que `tailwind.config.mjs` esté configurado
2. Asegúrate de que `@astrojs/tailwind` esté en `astro.config.mjs`
3. Revisa que `src/styles/global.css` esté importado en el layout

### ❌ Componentes React no funcionan

**Causa:** React no está configurado correctamente.

**Solución:**
1. Verifica que `@astrojs/react` esté en `astro.config.mjs`
2. Asegúrate de que los componentes tengan la directiva `client:load` o `client:visible`

### ❌ El sitio se ve diferente en producción

**Causa:** Variables de entorno o configuración diferente.

**Solución:**
1. Verifica variables de entorno en Netlify
2. Revisa que el build local sea igual al de producción
3. Limpia caché del navegador

---

## 📝 Checklist Final Antes de Enviar al Cliente

- [ ] Build se completa sin errores
- [ ] Todas las páginas cargan correctamente
- [ ] Navegación funciona en todas las páginas
- [ ] Imágenes y assets se muestran
- [ ] Estilos CSS se aplican correctamente
- [ ] Responsive design funciona (móvil y desktop)
- [ ] Formularios funcionan (si los hay)
- [ ] Links internos y externos funcionan
- [ ] No hay errores en la consola del navegador
- [ ] El sitio carga rápido
- [ ] SEO básico está configurado (meta tags)

---

## 🚀 Próximos Pasos Después del Deploy

1. **Monitorear el sitio:** Revisa los logs y analytics en Netlify
2. **Obtener feedback del cliente:** Pide comentarios específicos
3. **Hacer ajustes:** Implementa cambios basados en feedback
4. **Configurar dominio personalizado:** Si el cliente lo requiere
5. **Configurar SSL:** Netlify lo hace automáticamente, pero verifica
6. **Configurar analytics:** Considera agregar Google Analytics o similar

---

## 📞 Recursos Adicionales

- **Documentación de Netlify:** https://docs.netlify.com
- **Documentación de Astro:** https://docs.astro.build
- **Soporte de Netlify:** https://www.netlify.com/support

---

## ✅ ¡Listo!

Una vez completado este proceso, tendrás tu sitio web en vivo y podrás compartir el link con tu cliente. Cada vez que hagas cambios y los subas a Git (si usas el método 1), Netlify automáticamente hará un nuevo deploy.

**¡Buena suerte con el deploy! 🎉**

