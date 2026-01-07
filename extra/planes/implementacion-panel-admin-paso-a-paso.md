# Implementación Panel de Administración - Paso a Paso

**Objetivo**: Implementar panel de administración con login, manteniendo separación de datos e interfaz.

---

## 📋 Fase 1: Interfaz Gráfica (Sin Autenticación Real)

### Paso 1: Agregar Icono de Llave en Footer

**Archivo**: `src/components/layout/Footer.tsx`

**Tarea**:
- Agregar icono de llave después del texto de copyright
- Enlace a `/admin/login`
- Estilos discretos

**Ubicación**: Después de la línea del copyright

---

### Paso 2: Crear Estructura de Datos para Login

**Archivo**: `src/data/content/pages/admin.json` (nuevo)

**Estructura**:
```json
{
  "meta": {
    "pageId": "admin",
    "lastUpdated": "2025-01-XX",
    "version": 1
  },
  "seo": {
    "title": {
      "en": "Admin Panel - Whole Self Counseling",
      "es": "Panel de Administración - Whole Self Counseling"
    }
  },
  "content": {
    "login": {
      "title": {
        "en": "Panel de Administración",
        "es": "Panel de Administración"
      },
      "form": {
        "username": {
          "label": { "en": "Usuario", "es": "Usuario" },
          "placeholder": { "en": "Ingrese su usuario", "es": "Ingrese su usuario" }
        },
        "password": {
          "label": { "en": "Contraseña", "es": "Contraseña" },
          "placeholder": { "en": "Ingrese su contraseña", "es": "Ingrese su contraseña" }
        },
        "submit": {
          "en": "Iniciar Sesión",
          "es": "Iniciar Sesión"
        },
        "errors": {
          "invalidCredentials": {
            "en": "Usuario o contraseña incorrectos",
            "es": "Usuario o contraseña incorrectos"
          },
          "recaptchaFailed": {
            "en": "Verificación reCAPTCHA fallida",
            "es": "Verificación reCAPTCHA fallida"
          }
        }
      }
    }
  }
}
```

---

### Paso 3: Crear Página de Login (Sin Layout)

**Archivo**: `src/pages/admin/login.astro` (nuevo)

**Características**:
- ❌ Sin header ni footer (layout propio)
- ✅ Logo del proyecto centrado
- ✅ Título "Panel de Administración"
- ✅ Cargar datos desde `admin.json`
- ✅ Usar componente `LoginForm`

**Estructura básica**:
```astro
---
import LoginForm from '@/components/admin/LoginForm';
import { getPageContent } from '@/data/services/contentService';

const adminData = await getPageContent('admin');
const loginContent = adminData.content.login;
---

<!doctype html>
<html lang="es">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>{loginContent.title.en} - Whole Self Counseling</title>
    <link rel="stylesheet" href="/styles/global.css" />
  </head>
  <body class="min-h-screen bg-gray-50 flex items-center justify-center">
    <div class="w-full max-w-md px-4">
      <!-- Logo y título -->
      <div class="text-center mb-8">
        <img src="/logo.svg" alt="Whole Self Counseling" class="h-16 mx-auto mb-4" />
        <h1 class="text-2xl font-semibold text-gray-900">{loginContent.title.en}</h1>
      </div>
      
      <!-- Formulario -->
      <LoginForm client:load loginContent={loginContent} />
    </div>
  </body>
</html>
```

---

### Paso 4: Crear Componente LoginForm

**Archivo**: `src/components/admin/LoginForm.tsx` (nuevo)

**Funcionalidades iniciales**:
- Campos: username, password
- Validación básica de campos
- Estado de loading
- Manejo de errores (preparado para API)
- Diseño responsive

**Estructura**:
```tsx
interface LoginFormProps {
  loginContent: {
    form: {
      username: { label: LocalizedText; placeholder: LocalizedText };
      password: { label: LocalizedText; placeholder: LocalizedText };
      submit: LocalizedText;
      errors: {
        invalidCredentials: LocalizedText;
        recaptchaFailed: LocalizedText;
      };
    };
  };
  language?: 'en' | 'es';
}
```

**Nota**: Por ahora, el submit solo mostrará un mensaje. La integración con API será en Fase 2.

---

## 📋 Fase 2: Integración con reCAPTCHA

### Paso 5: Configurar reCAPTCHA

**Tarea**:
- Obtener credenciales de Google reCAPTCHA
- Configurar variables de entorno
- Integrar componente reCAPTCHA en LoginForm

**Archivo**: `src/components/admin/ReCAPTCHA.tsx` (nuevo)

**📖 Guía detallada**: Ver `extra/planes/guia-configurar-recaptcha.md` para instrucciones paso a paso sobre cómo obtener las credenciales de Google reCAPTCHA.

**Resumen rápido**:
1. Ir a [google.com/recaptcha/admin](https://www.google.com/recaptcha/admin)
2. Crear nuevo sitio (reCAPTCHA v3)
3. Agregar dominios: `localhost`, `127.0.0.1`, y tu dominio de producción
4. Copiar Site Key y Secret Key
5. Crear archivo `.env` con:
   ```env
   PUBLIC_RECAPTCHA_SITE_KEY=tu_site_key_aqui
   RECAPTCHA_SECRET_KEY=tu_secret_key_aqui
   ```
6. Agregar `.env` a `.gitignore`

---

## 📋 Fase 3: Sistema de Autenticación

### Paso 6: Crear Servicio de Autenticación

**Archivo**: `src/data/services/authService.ts` (nuevo)

**Funciones**:
- `verifyCredentials(username, password)`: Verificar credenciales
- `verifyRecaptcha(token)`: Validar reCAPTCHA
- `createSession(userId)`: Crear sesión (preparado para SSR futuro)

**Nota**: Por ahora, credenciales pueden estar en variables de entorno o archivo de configuración.

---

### Paso 7: Crear API Endpoint de Login

**Archivo**: `src/pages/api/admin/login.ts` (nuevo)

**Funcionalidad**:
- Recibir credenciales y token reCAPTCHA
- Validar reCAPTCHA
- Verificar credenciales
- Retornar respuesta (por ahora JSON, luego cookie de sesión)

**Nota**: Con SSG, este endpoint funcionará como API externa o mock. Para SSR real, se convertirá en endpoint de Astro.

---

### Paso 8: Conectar LoginForm con API

**Tarea**:
- Modificar LoginForm para llamar a `/api/admin/login`
- Manejar respuesta exitosa (redirección a dashboard)
- Manejar errores (mostrar mensajes)

---

## 📋 Fase 4: Sistema de Roles y Permisos

### Paso 9: Definir Estructura de Usuarios

**Archivo**: `src/data/models/User.ts` (nuevo)

**Estructura**:
```typescript
interface User {
  id: string;
  username: string;
  role: 'admin' | 'editor' | 'viewer';
  permissions: string[];
  displayName: string;
}
```

**Roles propuestos**:
- `admin`: Acceso completo
- `editor`: Puede editar contenido
- `viewer`: Solo lectura

---

### Paso 10: Crear Configuración de Usuarios

**Archivo**: `src/data/config/users.json` (nuevo, NO commitear)

**Estructura**:
```json
{
  "users": [
    {
      "id": "user-1",
      "username": "admin",
      "passwordHash": "<bcrypt_hash>",
      "role": "admin",
      "displayName": "Administrador Principal"
    }
  ]
}
```

**Nota**: Este archivo debe estar en `.gitignore`. En producción, usar variables de entorno o base de datos.

---

### Paso 11: Modificar Login para Retornar Información de Usuario

**Tarea**:
- API de login retorna información del usuario (rol, permisos)
- Guardar en sesión/localStorage (temporal)
- Usar para mostrar opciones en dashboard

---

## 📋 Fase 5: Dashboard con Opciones según Rol

### Paso 12: Crear Página de Dashboard

**Archivo**: `src/pages/admin/dashboard.astro` (nuevo)

**Características**:
- Verificar autenticación (redirigir a login si no está autenticado)
- Mostrar opciones según rol del usuario
- Layout de administración (sin header/footer público)

---

### Paso 13: Crear Componente de Navegación según Rol

**Archivo**: `src/components/admin/AdminNavigation.tsx` (nuevo)

**Funcionalidad**:
- Mostrar opciones según `user.role`
- Navegación del panel
- Botón de logout

**Opciones por rol**:
- `admin`: Todas las opciones (páginas, equipo, imágenes, configuración)
- `editor`: Solo edición de contenido (páginas, equipo)
- `viewer`: Solo visualización (sin opciones de edición)

---

## 📋 Fase 6: Protección de Rutas

### Paso 14: Crear Middleware de Autenticación

**Archivo**: `src/middleware/auth.ts` (nuevo)

**Funcionalidad**:
- Verificar sesión en rutas protegidas
- Redireccionar a login si no está autenticado
- Inyectar información de usuario

**Nota**: Con SSG, esto será validación en cliente. Con SSR, será en servidor.

---

## 📋 Fase 7: Seguridad Adicional

### Paso 15: Implementar Rate Limiting

**Archivo**: `src/middleware/rateLimit.ts` (nuevo)

**Funcionalidad**:
- Limitar intentos de login por IP
- Bloqueo temporal después de X intentos

---

### Paso 16: Validación de Entrada

**Tarea**:
- Sanitizar inputs
- Validar formato de username
- Longitud mínima de contraseña

---

## 🎯 Orden de Implementación Inmediata

### Esta Sesión (Interfaz Gráfica):

1. ✅ **Paso 1**: Agregar icono en Footer
2. ✅ **Paso 2**: Crear `admin.json` con datos del login
3. ✅ **Paso 3**: Crear página `login.astro`
4. ✅ **Paso 4**: Crear componente `LoginForm.tsx`

### Próxima Sesión (Funcionalidad):

5. **Paso 5**: Integrar reCAPTCHA
6. **Paso 6**: Crear servicio de autenticación
7. **Paso 7**: Crear API endpoint
8. **Paso 8**: Conectar formulario con API

### Sesiones Futuras:

9-16. Implementar roles, dashboard, protección de rutas, seguridad

---

## 📝 Notas Importantes

### Separación de Datos e Interfaz

**Datos** (JSON):
- `src/data/content/pages/admin.json` - Contenido del login
- `src/data/config/users.json` - Usuarios (NO commitear)
- `src/data/models/User.ts` - Tipos TypeScript

**Interfaz** (Componentes):
- `src/components/admin/LoginForm.tsx` - Formulario
- `src/components/admin/ReCAPTCHA.tsx` - reCAPTCHA
- `src/pages/admin/login.astro` - Página de login

**Servicios**:
- `src/data/services/authService.ts` - Lógica de autenticación

### Estructura de Carpetas

```
src/
├── components/
│   └── admin/
│       ├── LoginForm.tsx
│       ├── ReCAPTCHA.tsx
│       └── AdminNavigation.tsx
├── data/
│   ├── content/
│   │   └── pages/
│   │       └── admin.json
│   ├── config/
│   │   └── users.json (gitignored)
│   ├── models/
│   │   └── User.ts
│   └── services/
│       └── authService.ts
├── pages/
│   ├── admin/
│   │   ├── login.astro
│   │   └── dashboard.astro
│   └── api/
│       └── admin/
│           └── login.ts
└── middleware/
    └── auth.ts
```

---

**Última actualización**: 2025-01-XX
