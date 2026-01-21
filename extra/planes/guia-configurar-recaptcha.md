# Guía Completa: Configurar Google reCAPTCHA

**Objetivo**: Obtener y configurar las credenciales de Google reCAPTCHA para el panel de administración.

---

## 📋 ¿Qué es reCAPTCHA?

**reCAPTCHA** es un servicio de Google que protege sitios web de bots y spam. Hay dos versiones principales:

- **reCAPTCHA v2**: Requiere que el usuario marque un checkbox ("No soy un robot")
- **reCAPTCHA v3**: Invisible, funciona en segundo plano analizando el comportamiento del usuario

**Para este proyecto**: Usaremos **reCAPTCHA v3** porque es invisible y ofrece mejor experiencia de usuario.

---

## 🚀 Paso 1: Crear Cuenta/Acceder a Google reCAPTCHA

### 1.1 Acceder al Panel de Administración

1. Ve a: [https://www.google.com/recaptcha/admin](https://www.google.com/recaptcha/admin)
2. Inicia sesión con tu cuenta de Google
   - Si no tienes cuenta de Google, créala en [accounts.google.com](https://accounts.google.com)

### 1.2 Verificar Acceso

Una vez dentro, verás el panel de administración de reCAPTCHA con tus sitios registrados (si tienes alguno).

---

## 🆕 Paso 2: Registrar un Nuevo Sitio

### 2.1 Crear Nuevo Sitio

1. En el panel de reCAPTCHA, haz clic en el botón **"+"** o **"Create"** (Crear)
2. Se abrirá un formulario para registrar tu sitio

### 2.2 Llenar el Formulario

**Etiqueta (Label)**:
- Nombre descriptivo para tu sitio
- Ejemplo: `WholeSelf Counseling Admin Panel`
- Esto es solo para identificarlo en tu panel, no afecta la funcionalidad

**Tipo de reCAPTCHA (reCAPTCHA type)**:
- Selecciona: **reCAPTCHA v3** ✅
- **NO** selecciones v2 (checkbox) a menos que quieras que los usuarios marquen un checkbox

**Dominios (Domains)**:
Aquí debes agregar los dominios donde se usará reCAPTCHA:

**Para Desarrollo (Local)**:
```
localhost
127.0.0.1
```

**Para Producción**:
```
tudominio.com
www.tudominio.com
```

**Ejemplo completo**:
```
localhost
127.0.0.1
wholeselfnm.com
www.wholeselfnm.com
```

**⚠️ Importante**:
- Agrega TODOS los dominios donde probarás el sitio
- Puedes agregar múltiples dominios, uno por línea
- `localhost` es necesario para probar localmente
- El dominio de producción debe coincidir exactamente (con o sin `www`)

**Propietarios (Owners)**:
- Por defecto, tu cuenta de Google será el propietario
- Puedes agregar otros usuarios si trabajas en equipo

**Términos de Servicio**:
- ✅ Marca la casilla de aceptación de términos

### 2.3 Enviar el Formulario

1. Haz clic en **"Submit"** (Enviar)
2. Se creará tu sitio y verás una pantalla con tus credenciales

---

## 🔑 Paso 3: Obtener las Credenciales

Después de crear el sitio, verás dos claves importantes:

### 3.1 Site Key (Clave del Sitio)

**Qué es**: Clave pública que se usa en el frontend (cliente)
- ✅ Puede ser visible en el código (no es secreta)
- Se incluye en el HTML/JavaScript del sitio

**Dónde está**: 
- Aparece como **"Site Key"** en el panel
- Ejemplo: `6LdXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX`

**Copia esta clave** - La necesitarás para el componente React

### 3.2 Secret Key (Clave Secreta)

**Qué es**: Clave privada que se usa en el backend (servidor)
- ❌ NUNCA debe ser visible en el código del cliente
- Solo se usa en el servidor para verificar el token

**Dónde está**:
- Aparece como **"Secret Key"** en el panel
- Ejemplo: `6LdXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX`

**⚠️ IMPORTANTE**: 
- Esta clave es SECRETA
- No la compartas públicamente
- No la subas a GitHub sin protección
- Úsala solo en variables de entorno o en el servidor

**Copia esta clave** - La necesitarás para el backend

---

## 📝 Paso 4: Guardar las Credenciales de Forma Segura

### 4.1 Crear Archivo de Variables de Entorno

**Archivo**: `.env` (en la raíz del proyecto)

```env
# Google reCAPTCHA v3
PUBLIC_RECAPTCHA_SITE_KEY=6LdXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
RECAPTCHA_SECRET_KEY=6LdXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

**Nota sobre el prefijo `PUBLIC_`**:
- En Astro/Vite, las variables que empiezan con `PUBLIC_` son accesibles en el cliente
- `PUBLIC_RECAPTCHA_SITE_KEY` → Se puede usar en React/components
- `RECAPTCHA_SECRET_KEY` → Solo en servidor (no tiene `PUBLIC_`)

### 4.2 Agregar al .gitignore

**Archivo**: `.gitignore`

Asegúrate de que `.env` esté en `.gitignore`:

```
# Variables de entorno
.env
.env.local
.env.production
```

**⚠️ NUNCA subas `.env` a GitHub** - Contiene información sensible

### 4.3 Crear Archivo de Ejemplo

**Archivo**: `.env.example` (SÍ se puede subir a GitHub)

```env
# Google reCAPTCHA v3
PUBLIC_RECAPTCHA_SITE_KEY=your_site_key_here
RECAPTCHA_SECRET_KEY=your_secret_key_here
```

Este archivo muestra qué variables se necesitan, pero sin valores reales.

---

## 🔧 Paso 5: Configurar en el Proyecto

### 5.1 Instalar Dependencia de reCAPTCHA

```bash
npm install react-google-recaptcha-v3
```

### 5.2 Usar en el Componente

**Ejemplo básico** (se implementará en `LoginForm.tsx`):

```tsx
import { useGoogleReCaptcha } from 'react-google-recaptcha-v3';

function LoginForm() {
  const { executeRecaptcha } = useGoogleReCaptcha();
  
  const handleSubmit = async () => {
    // Ejecutar reCAPTCHA y obtener token
    const token = await executeRecaptcha('login');
    
    // Enviar token al backend junto con credenciales
    const response = await fetch('/api/admin/login', {
      method: 'POST',
      body: JSON.stringify({
        username,
        password,
        recaptchaToken: token
      })
    });
  };
}
```

### 5.3 Configurar Provider en la Aplicación

Necesitas envolver la aplicación con el provider de reCAPTCHA. Esto se hará en el layout o en un componente raíz.

---

## 🧪 Paso 6: Probar reCAPTCHA

### 6.1 Prueba Local

1. Inicia el servidor de desarrollo: `npm run dev`
2. Visita `http://localhost:4321/admin/login`
3. Abre la consola del navegador (F12)
4. Intenta hacer login
5. Deberías ver el token de reCAPTCHA en la consola o en la petición

### 6.2 Verificar en el Panel de Google

1. Ve al panel de reCAPTCHA
2. Click en tu sitio
3. Ve a la pestaña **"Statistics"** (Estadísticas)
4. Deberías ver las solicitudes de verificación

**Nota**: En desarrollo local, puede que no aparezcan estadísticas inmediatamente.

---

## ⚠️ Problemas Comunes y Soluciones

### Error: "reCAPTCHA site key is not registered for this domain"

**Causa**: El dominio no está registrado en reCAPTCHA

**Solución**:
1. Ve al panel de reCAPTCHA
2. Edita tu sitio
3. Agrega el dominio exacto que estás usando
4. Guarda los cambios
5. Espera unos minutos para que se propague

### Error: "Invalid site key"

**Causa**: La Site Key es incorrecta o no coincide

**Solución**:
1. Verifica que copiaste la Site Key correcta
2. Verifica que estás usando `PUBLIC_RECAPTCHA_SITE_KEY` en el código
3. Reinicia el servidor de desarrollo después de cambiar `.env`

### reCAPTCHA no aparece en localhost

**Causa**: `localhost` no está en la lista de dominios

**Solución**:
1. Agrega `localhost` y `127.0.0.1` a los dominios en reCAPTCHA
2. Guarda los cambios
3. Reinicia el servidor

### Score bajo en reCAPTCHA v3

**reCAPTCHA v3** asigna un "score" (0.0 a 1.0) a cada solicitud:
- **1.0**: Muy probable que sea humano
- **0.0**: Muy probable que sea bot

**Si el score es bajo**:
- Puede ser normal en desarrollo local
- En producción, Google aprende del comportamiento real
- Puedes ajustar el umbral mínimo en el backend

---

## 📊 Configuración Avanzada (Opcional)

### Ajustar el Score Mínimo

En el backend, puedes rechazar solicitudes con score bajo:

```typescript
// En authService.ts
const recaptchaResponse = await verifyRecaptcha(token);

if (recaptchaResponse.score < 0.5) {
  // Score muy bajo, probablemente es un bot
  throw new Error('reCAPTCHA verification failed');
}
```

### Configurar Acciones

reCAPTCHA v3 permite definir "acciones" para diferentes partes del sitio:

```tsx
// Login
const token = await executeRecaptcha('login');

// Registro
const token = await executeRecaptcha('register');

// Formulario de contacto
const token = await executeRecaptcha('contact');
```

Esto ayuda a Google a entender mejor el contexto y mejorar la precisión.

---

## 🔒 Seguridad: Mejores Prácticas

### ✅ Hacer:

1. **Usar variables de entorno** para las claves
2. **Nunca exponer Secret Key** en el código del cliente
3. **Validar siempre en el servidor** - No confíes solo en el cliente
4. **Verificar el score** en el backend
5. **Limitar intentos** de login (rate limiting)

### ❌ No Hacer:

1. **No hardcodear** las claves en el código
2. **No subir** `.env` a GitHub
3. **No confiar solo** en la validación del cliente
4. **No ignorar** el score de reCAPTCHA v3

---

## 📝 Resumen de Pasos

1. ✅ Ir a [google.com/recaptcha/admin](https://www.google.com/recaptcha/admin)
2. ✅ Crear nuevo sitio (reCAPTCHA v3)
3. ✅ Agregar dominios (localhost + dominio de producción)
4. ✅ Copiar Site Key y Secret Key
5. ✅ Crear archivo `.env` con las claves
6. ✅ Agregar `.env` a `.gitignore`
7. ✅ Instalar `react-google-recaptcha-v3`
8. ✅ Configurar en el proyecto
9. ✅ Probar en localhost

---

## 🎯 Próximos Pasos

Una vez que tengas las credenciales:

1. **Paso 5.2** del plan: Integrar componente reCAPTCHA en `LoginForm.tsx`
2. **Paso 6** del plan: Crear servicio de autenticación que valide reCAPTCHA
3. **Paso 7** del plan: Crear API endpoint que verifique el token

---

**Última actualización**: 2025-01-XX
