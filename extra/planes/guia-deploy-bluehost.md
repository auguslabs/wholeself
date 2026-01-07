# Guía Rápida: Deploy Automático a Blue Host desde GitHub

**Objetivo**: Configurar deploy automático para que cada cambio en GitHub se refleje automáticamente en Blue Host, sin necesidad de subir archivos manualmente por FTP.

---

## 📋 Requisitos Previos

- ✅ Repositorio en GitHub (puede ser privado)
- ✅ Acceso FTP a Blue Host
- ✅ Credenciales FTP de Blue Host

---

## 🚀 Pasos de Configuración

### Paso 1: Crear el Workflow de GitHub Actions

1. En tu proyecto local, crea la carpeta `.github/workflows/` si no existe:
```bash
mkdir -p .github/workflows
```

2. Copia el archivo de ejemplo:
```bash
# El archivo ya está creado en: .github/workflows/deploy-bluehost.yml.example
# Cópialo y renómbralo (quita .example)
```

3. O crea el archivo directamente: `.github/workflows/deploy-bluehost.yml`

4. El contenido del archivo está en: `.github/workflows/deploy-bluehost.yml.example`

---

### Paso 2: Obtener Credenciales FTP de Blue Host

1. Inicia sesión en el panel de control de Blue Host (cPanel)
2. Busca la sección "Archivos" → "Administrador de Archivos" o "FTP Accounts"
3. Anota:
   - **Servidor FTP**: `ftp.tudominio.com` (o la IP que te den)
   - **Usuario FTP**: Tu usuario FTP
   - **Contraseña FTP**: Tu contraseña FTP
   - **Ruta en servidor**: Generalmente `/public_html/` o `/public_html/subdirectorio/`

**Nota**: Si necesitas crear una cuenta FTP nueva:
- Ve a "FTP Accounts" en cPanel
- Crea una cuenta nueva
- Asigna la ruta donde quieres que se despliegue el sitio

---

### Paso 3: Configurar Secrets en GitHub

1. Ve a tu repositorio en GitHub
2. Click en **Settings** (Configuración)
3. En el menú lateral, click en **Secrets and variables** → **Actions**
4. Click en **New repository secret**

5. Agrega estos 3 secrets:

   **Secret 1: FTP_SERVER**
   - Name: `FTP_SERVER`
   - Value: `ftp.tudominio.com` (o la IP que te dio Blue Host)

   **Secret 2: FTP_USERNAME**
   - Name: `FTP_USERNAME`
   - Value: Tu usuario FTP

   **Secret 3: FTP_PASSWORD**
   - Name: `FTP_PASSWORD`
   - Value: Tu contraseña FTP

6. Click en **Add secret** para cada uno

---

### Paso 4: Ajustar la Configuración del Workflow

Edita el archivo `.github/workflows/deploy-bluehost.yml` y ajusta:

```yaml
server-dir: /public_html/wholeself/  # Cambia esta ruta según tu configuración
```

**Opciones comunes**:
- Si quieres en la raíz: `/public_html/`
- Si quieres en subdirectorio: `/public_html/wholeself/`
- Si WordPress está en subdirectorio: `/public_html/` (y WordPress en `/public_html/blog/`)

---

### Paso 5: Hacer Commit y Push

```bash
git add .github/workflows/deploy-bluehost.yml
git commit -m "Configurar deploy automático a Blue Host"
git push origin main
```

---

### Paso 6: Verificar que Funciona

1. Ve a tu repositorio en GitHub
2. Click en la pestaña **Actions**
3. Deberías ver el workflow ejecutándose
4. Espera a que termine (puede tomar 2-5 minutos la primera vez)
5. Verifica que el sitio se actualizó en Blue Host

---

## 🔍 Solución de Problemas

### Error: "FTP connection failed"

**Causa**: Credenciales incorrectas o servidor FTP incorrecto

**Solución**:
1. Verifica que los secrets en GitHub estén correctos
2. Prueba conectarte con un cliente FTP (FileZilla) para verificar credenciales
3. Asegúrate de que el servidor FTP sea correcto (puede ser IP en lugar de dominio)

---

### Error: "Permission denied"

**Causa**: La ruta en el servidor no existe o no tienes permisos

**Solución**:
1. Verifica que la ruta `server-dir` existe en Blue Host
2. Crea la carpeta manualmente en cPanel si no existe
3. Asegúrate de que la cuenta FTP tenga permisos de escritura

---

### El deploy se ejecuta pero no veo cambios

**Causa**: Cache del navegador o ruta incorrecta

**Solución**:
1. Limpia el cache del navegador (Ctrl+Shift+R)
2. Verifica que los archivos se subieron correctamente en cPanel
3. Revisa la ruta `server-dir` en el workflow

---

### El workflow no se ejecuta automáticamente

**Causa**: La rama no es `main` o el archivo está mal configurado

**Solución**:
1. Verifica que estás haciendo push a la rama `main` (o ajusta el workflow)
2. Verifica que el archivo está en `.github/workflows/deploy-bluehost.yml`
3. Verifica la sintaxis YAML (sin errores de indentación)

---

## 📝 Flujo de Trabajo Diario

### Hacer Cambios y Deployar

```bash
# 1. Hacer cambios en tu código
# 2. Commitear cambios
git add .
git commit -m "Descripción de los cambios"

# 3. Push a GitHub
git push origin main

# 4. GitHub Actions se ejecuta automáticamente
# 5. En 2-5 minutos, el sitio está actualizado en Blue Host
```

**No necesitas**:
- ❌ Acceder a FTP manualmente
- ❌ Subir archivos uno por uno
- ❌ Hacer build local y subir dist/

**Todo es automático** ✅

---

## 🔒 Seguridad: Repositorio Privado

### ¿Por qué usar repositorio privado?

- ✅ Tu código no es público
- ✅ Solo tú (y quien invites) puede ver el código
- ✅ Las credenciales FTP están en secrets (no visibles)

### Configurar repositorio privado:

1. Ve a tu repositorio en GitHub
2. Settings → General → Danger Zone
3. Click en "Change visibility" → "Make private"
4. Solo tú y colaboradores invitados podrán ver el código

---

## 💡 Mejoras Futuras

### Agregar Notificaciones

Puedes agregar notificaciones cuando el deploy termine:

```yaml
- name: Notify on success
  if: success()
  run: |
    # Enviar email, Slack, etc.
    echo "✅ Deploy exitoso"
```

### Deploy solo en Tags

Si quieres que solo se despliegue cuando creas un tag (versión):

```yaml
on:
  push:
    tags:
      - 'v*'  # Solo despliega en tags como v1.0.0
```

---

## 📊 Monitoreo

### Ver Historial de Deploys

1. Ve a GitHub → Actions
2. Click en el workflow "Deploy to Blue Host"
3. Verás historial de todos los deploys
4. Puedes ver logs de cada ejecución

### Verificar Estado del Deploy

- ✅ Verde: Deploy exitoso
- ❌ Rojo: Deploy falló (revisa logs)
- 🟡 Amarillo: Deploy en progreso

---

## 🎯 Resumen

**Antes**:
```
Cambios → Build local → Subir por FTP → Verificar
(Tiempo: 10-15 minutos, propenso a errores)
```

**Ahora**:
```
Cambios → git push → Automático
(Tiempo: 2-5 minutos, sin errores manuales)
```

**Beneficios**:
- ✅ Automático
- ✅ Sin errores manuales
- ✅ Historial de cambios
- ✅ Código en repositorio privado
- ✅ Deploy desde cualquier lugar

---

**Última actualización**: 2025-01-XX
