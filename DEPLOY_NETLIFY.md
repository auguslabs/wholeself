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

Si tu proyecto usa variables de entorno:

1. En la configuración del sitio, ve a **"Site settings"** → **"Environment variables"**
2. Agrega cada variable:
   - **Key:** Nombre de la variable (ej: `PUBLIC_API_URL`)
   - **Value:** Valor de la variable

**Nota:** En Astro, las variables de entorno públicas deben empezar con `PUBLIC_`

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

