# Convenciones de Nombres de Archivos Web

## Resumen
Este documento establece las convenciones profesionales de nombres para todos los archivos de assets web (imágenes, videos, documentos, etc.) basadas en estándares de la industria. Estas convenciones aseguran consistencia, escalabilidad, mejor SEO y facilitan el mantenimiento del proyecto.

**Beneficios:**
- ✅ Consistencia en todo el proyecto
- ✅ Mejor SEO y accesibilidad
- ✅ Facilita la búsqueda y organización
- ✅ Escalable para proyectos futuros
- ✅ Compatible con sistemas case-sensitive
- ✅ URLs más limpias y profesionales

**Alcance:**
Este documento cubre todos los tipos de archivos que se colocan en la carpeta `public/` o cualquier carpeta de assets del proyecto:
- Imágenes (JPG, PNG, WebP, SVG)
- Videos (MP4, MOV, WebM)
- Documentos (PDF, DOCX)
- Archivos de datos (JSON, CSV)
- Fuentes (WOFF, WOFF2)
- Otros assets estáticos

---

## 1. Reglas Generales

### 1.1 Principios Fundamentales

**✅ SIEMPRE:**
- Usar **solo minúsculas** (lowercase)
- Separar palabras con **guiones** (hyphens, kebab-case)
- Usar nombres **descriptivos** que indiquen claramente el contenido
- Mantener nombres **concisos** pero informativos
- Incluir **palabras clave relevantes** para SEO

**❌ NUNCA:**
- Usar espacios en los nombres
- Usar caracteres especiales (#, %, &, ?, @, etc.)
- Usar acentos o caracteres no-ASCII (á, é, ñ, etc.)
- Usar mayúsculas (excepto en casos muy específicos documentados)
- Usar underscores (_) o camelCase
- Incluir la extensión del archivo en el nombre

### 1.2 Formato Estándar

```
[prefijo]-[categoria]-[descripcion]-[variante].[extension]
```

**Ejemplo:**
```
banner-hero-section.webp
icon-menu-hamburger.svg
team-alexandria-rakes-rounded.webp
```

### 1.3 Longitud Recomendada

- **Mínimo:** 3-5 caracteres (para iconos simples: `icon-x.svg`)
- **Máximo:** 50-60 caracteres (incluyendo guiones)
- **Ideal:** 15-30 caracteres

**Razón:** Nombres muy largos son difíciles de leer y trabajar, nombres muy cortos no son descriptivos.

---

## 2. Convenciones por Tipo de Archivo

### 2.1 Imágenes

#### Banners y Hero Images
**Formato:** `banner-[seccion]-[variante].webp`

**Ejemplos:**
```
✅ banner-hero-section.webp
✅ banner-services.webp
✅ banner-team-hero.webp
✅ banner-contact-background.webp
```

**❌ Incorrecto:**
```
❌ Banner_Hero_Section.webp  (PascalCase con underscores)
❌ banner hero section.webp  (espacios)
❌ bannerHeroSection.webp    (camelCase)
```

#### Imágenes de Contenido
**Formato:** `content-[categoria]-[descripcion].webp`

**Ejemplos:**
```
✅ content-services-therapy.webp
✅ content-about-office.webp
✅ content-blog-post-image.webp
```

#### Iconos
**Formato:** `icon-[nombre].svg` o `[nombre]-icon.svg`

**Ejemplos:**
```
✅ icon-menu.svg
✅ icon-close.svg
✅ icon-arrow-right.svg
✅ feather-home-icon.svg
✅ feather-contact-icon.svg
```

**Para iconos de menú específicos:**
```
✅ feather-home.svg
✅ feather-services.svg
✅ feather-team.svg
```

#### Logos
**Formato:** `logo-[variante].svg`

**Ejemplos:**
```
✅ logo.svg              (logo principal)
✅ logo-white.svg        (logo en blanco)
✅ logo-dark.svg         (logo oscuro)
✅ logo-icon.svg         (solo icono)
✅ logo-full.svg         (logo completo con texto)
```

#### Fotos de Equipo
**Formato:** `team-[nombre-completo]-[variante].webp`

**Ejemplos:**
```
✅ team-alexandria-rakes-rounded.webp
✅ team-amy-melendrez-square.webp
✅ team-andrea-lucero-color.webp
✅ team-dulce-medina-white.webp
```

**Variantes comunes:**
- `-rounded` - Imagen con bordes redondeados
- `-square` - Imagen cuadrada
- `-color` - Versión a color
- `-white` - Versión en blanco/transparente
- `-decorative` - Versión decorativa

**❌ Incorrecto (actual):**
```
❌ Alexandria-Rakes.webp        (PascalCase)
❌ Amy-Melendrez.webp          (PascalCase)
❌ Andrea-Lucero.webp          (PascalCase)
```

#### Imágenes Decorativas
**Formato:** `decorative-[descripcion].webp`

**Ejemplos:**
```
✅ decorative-pattern-1.webp
✅ decorative-background-texture.webp
✅ decorative-accent-line.svg
```

#### Ilustraciones
**Formato:** `illustration-[tema]-[descripcion].svg`

**Ejemplos:**
```
✅ illustration-healing-journey.svg
✅ illustration-safe-space.svg
✅ illustration-community-support.svg
```

### 2.2 Videos

#### Videos de Hero
**Formato:** `video-hero-[pagina].mp4`

**Ejemplos:**
```
✅ video-hero-home.mp4
✅ video-hero-services.mp4
✅ video-hero-about.mp4
```

#### Videos de Contenido
**Formato:** `video-content-[categoria]-[descripcion].mp4`

**Ejemplos:**
```
✅ video-content-testimonial-client-1.mp4
✅ video-content-service-explanation.mp4
✅ video-content-team-introduction.mp4
```

#### Videos Promocionales
**Formato:** `video-promo-[nombre].mp4`

**Ejemplos:**
```
✅ video-promo-services-overview.mp4
✅ video-promo-why-choose-us.mp4
```

#### Variantes de Video
Para diferentes calidades o formatos:
```
✅ video-hero-home-hd.mp4
✅ video-hero-home-4k.mp4
✅ video-hero-home-mobile.mp4
✅ video-hero-home.webm        (formato alternativo)
```

### 2.3 Documentos

#### PDFs
**Formato:** `doc-[categoria]-[nombre-documento].pdf`

**Ejemplos:**
```
✅ doc-forms-intake-form.pdf
✅ doc-resources-crisis-hotline-list.pdf
✅ doc-policies-privacy-policy.pdf
✅ doc-forms-consent-form-v2.pdf
```

#### Archivos de Datos
**Formato:** `data-[tipo]-[descripcion].json` o `.csv`

**Ejemplos:**
```
✅ data-team-members-info.json
✅ data-services-list.json
✅ data-locations-coordinates.csv
```

**❌ Incorrecto (actual):**
```
❌ team_members_info.json    (snake_case)
❌ team_members_info.csv     (snake_case)
```

### 2.4 Otros Assets

#### Fuentes
**Formato:** `font-[nombre-familia]-[peso]-[estilo].woff2`

**Ejemplos:**
```
✅ font-inter-regular.woff2
✅ font-inter-bold.woff2
✅ font-inter-italic.woff2
✅ font-inter-bold-italic.woff2
```

#### Archivos de Configuración
**Formato:** `config-[nombre].json`

**Ejemplos:**
```
✅ config-site-settings.json
✅ config-feature-flags.json
```

---

## 3. Estructura de Carpetas

### 3.0 Consideraciones Especiales para Astro

**Importante:** Este proyecto usa Astro, donde los archivos en la carpeta `public/` se sirven directamente desde la raíz del sitio. Esto significa:

- Los archivos en `public/banners/` son accesibles como `/banners/...`
- No necesitas importar assets desde `public/` en componentes Astro
- Las rutas en código deben usar rutas absolutas desde la raíz: `/team/color/team-member.webp`
- Los assets se copian tal cual al build final, manteniendo la estructura de carpetas

**Ejemplo en componente Astro:**
```astro
<!-- ✅ Correcto -->
<img src="/banners/banner-hero-section.webp" alt="Hero" />

<!-- ❌ Incorrecto -->
<img src="./public/banners/banner-hero-section.webp" alt="Hero" />
```

### 3.1 Organización Recomendada

```
public/
├── banners/              # Banners y hero images
│   ├── banner-hero-section.webp
│   └── banner-services.webp
├── icons/                # Iconos SVG
│   ├── icon-menu.svg
│   └── icon-close.svg
├── logos/                # Logos
│   ├── logo.svg
│   └── logo-white.svg
├── team/                 # Fotos de equipo
│   ├── rounded/
│   │   └── team-alexandria-rakes-rounded.webp
│   ├── square/
│   │   └── team-alexandria-rakes-square.webp
│   └── color/
│       └── team-alexandria-rakes-color.webp
├── content/              # Imágenes de contenido
│   └── content-services-therapy.webp
├── videos/               # Videos
│   ├── video-hero-home.mp4
│   └── video-content-testimonial-1.mp4
├── documents/            # PDFs y documentos
│   └── doc-forms-intake-form.pdf
├── data/                 # Archivos de datos
│   └── data-team-members-info.json
└── fonts/                # Fuentes
    └── font-inter-regular.woff2
```

### 3.2 Cuándo Usar Cada Estructura

**Por Tipo de Asset:**
- Usa cuando tienes muchos archivos del mismo tipo
- Facilita la organización y búsqueda
- Recomendado para proyectos grandes

**Por Sección/Página:**
```
public/
├── home/
│   ├── banner-hero.webp
│   └── content-intro.webp
├── services/
│   ├── banner-hero.webp
│   └── content-therapy.webp
└── team/
    └── team-member-1.webp
```

- Usa cuando los assets están claramente asociados a una página específica
- Útil para proyectos pequeños o medianos

**Híbrido (Recomendado para este proyecto):**
```
public/
├── banners/              # Banners compartidos
├── icons/                # Iconos compartidos
├── team/                 # Assets de equipo
│   ├── rounded/
│   ├── square/
│   └── color/
└── [otros por tipo]
```

---

## 4. Versionado y Variantes

### 4.1 Versiones de Archivos

Cuando necesites actualizar un archivo pero mantener la versión anterior:

**Formato:** `[nombre]-v[numero].[extension]`

**Ejemplos:**
```
✅ doc-forms-consent-form-v1.pdf
✅ doc-forms-consent-form-v2.pdf
✅ logo-v1.svg
✅ logo-v2.svg
```

**Alternativa con fecha:**
```
✅ doc-forms-consent-form-2024-01.pdf
✅ doc-forms-consent-form-2024-06.pdf
```

### 4.2 Variantes de Tamaño

Para imágenes responsive o diferentes resoluciones:

**Formato:** `[nombre]-[tamaño].[extension]`

**Ejemplos:**
```
✅ banner-hero-section-small.webp    (320px)
✅ banner-hero-section-medium.webp   (768px)
✅ banner-hero-section-large.webp    (1920px)
✅ banner-hero-section-xlarge.webp   (2560px)
```

**O usando breakpoints:**
```
✅ banner-hero-section-mobile.webp
✅ banner-hero-section-tablet.webp
✅ banner-hero-section-desktop.webp
```

### 4.3 Variantes de Idioma

Si un asset tiene contenido específico por idioma:

**Formato:** `[nombre]-[idioma].[extension]`

**Ejemplos:**
```
✅ banner-promo-services-en.webp
✅ banner-promo-services-es.webp
✅ doc-forms-intake-form-en.pdf
✅ doc-forms-intake-form-es.pdf
```

**Nota:** En la mayoría de los casos, el contenido multiidioma se maneja mejor en el código/JSON, no en los nombres de archivos.

### 4.4 Variantes de Estilo

Para diferentes estilos visuales del mismo asset:

**Ejemplos:**
```
✅ logo-light.svg
✅ logo-dark.svg
✅ icon-menu-white.svg
✅ icon-menu-black.svg
✅ team-member-rounded.webp
✅ team-member-square.webp
```

---

## 5. SEO y Optimización

### 5.1 Importancia de Nombres Descriptivos

Los nombres de archivos son importantes para SEO porque:
- Los motores de búsqueda leen los nombres de archivos
- Mejoran la accesibilidad (screen readers)
- Facilitan la comprensión del contenido sin ver la imagen
- Mejoran la experiencia del desarrollador

### 5.2 Palabras Clave Relevantes

**Incluir palabras clave relevantes en el nombre:**

**✅ Bueno:**
```
✅ banner-services-therapy-counseling.webp
✅ content-mental-health-support.webp
✅ team-licensed-therapist-profile.webp
```

**❌ Evitar palabras genéricas:**
```
❌ image1.webp
❌ photo.jpg
❌ file.png
❌ img_001.webp
```

### 5.3 Nombres que Mejoran la Accesibilidad

Los nombres descriptivos ayudan a:
- Screen readers a describir imágenes
- Desarrolladores a entender el contenido
- SEO a indexar correctamente

**Ejemplo:**
```
✅ icon-close-button.svg          (descriptivo)
❌ icon-x.svg                     (no descriptivo sin contexto)
```

---

## 6. Ejemplos Prácticos: Antes y Después

### 6.1 Refactorización de Archivos Actuales

#### Imágenes de Equipo

**❌ ANTES (Actual):**
```
public/rounded-color/
  Alexandria-Rakes.webp
  Amy-Melendrez.webp
  Andrea-Lucero.webp
```

**✅ DESPUÉS (Recomendado):**
```
public/team/color/
  team-alexandria-rakes-color.webp
  team-amy-melendrez-color.webp
  team-andrea-lucero-color.webp
```

#### Archivos de Datos

**❌ ANTES (Actual):**
```
public/
  team_members_info.json
  team_members_info.csv
```

**✅ DESPUÉS (Recomendado):**
```
public/data/
  data-team-members-info.json
  data-team-members-info.csv
```

#### Banners (Ya están bien, pero para referencia)

**✅ ACTUAL (Correcto):**
```
public/
  banner-hero-section.webp
  banner-services.webp
```

### 6.2 Casos de Uso Comunes

#### Caso 1: Nueva Imagen de Hero para Página de Contacto

**Paso a paso:**
1. Identificar el tipo: Banner/Hero
2. Identificar la sección: Contact
3. Crear nombre: `banner-hero-contact.webp`
4. Guardar en: `public/banners/banner-hero-contact.webp`

#### Caso 2: Nuevo Icono para Menú

**Paso a paso:**
1. Identificar el tipo: Icon
2. Identificar el propósito: Menu item (About)
3. Crear nombre: `icon-about.svg` o `feather-about.svg`
4. Guardar en: `public/icons/icon-about.svg` o `public/menu-feathers/feather-about.svg`

#### Caso 3: Nueva Foto de Miembro del Equipo

**Paso a paso:**
1. Identificar el tipo: Team photo
2. Identificar la persona: John Smith
3. Identificar la variante: Rounded
4. Crear nombre: `team-john-smith-rounded.webp`
5. Guardar en: `public/team/rounded/team-john-smith-rounded.webp`

#### Caso 4: Video de Contenido

**Paso a paso:**
1. Identificar el tipo: Video content
2. Identificar la categoría: Testimonial
3. Identificar la descripción: Client success story
4. Crear nombre: `video-content-testimonial-client-success.mp4`
5. Guardar en: `public/videos/video-content-testimonial-client-success.mp4`

---

## 7. Plan de Migración de Archivos Existentes

### 7.1 Checklist de Migración

**Fase 1: Preparación**
- [ ] Hacer backup de todos los archivos actuales
- [ ] Crear lista de todos los archivos a renombrar
- [ ] Identificar todas las referencias en código (JSON, componentes, etc.)
- [ ] Crear script de renombrado (opcional pero recomendado)

**Fase 2: Renombrar Archivos**
- [ ] Renombrar imágenes de equipo: `Alexandria-Rakes.webp` → `team-alexandria-rakes-[variante].webp`
- [ ] Mover archivos de datos: `team_members_info.json` → `data-team-members-info.json`
- [ ] Reorganizar estructura de carpetas según convenciones
- [ ] Verificar que todos los archivos sigan las nuevas convenciones

**Fase 3: Actualizar Referencias**
- [ ] Actualizar referencias en archivos JSON (`src/data/content/pages/*.json`)
- [ ] Actualizar referencias en componentes (`.astro`, `.tsx`)
- [ ] Actualizar referencias en servicios (`contentService.ts`, etc.)
- [ ] Buscar y reemplazar todas las rutas antiguas

**Fase 4: Verificación**
- [ ] Probar que todas las imágenes se cargan correctamente
- [ ] Verificar que no hay rutas rotas
- [ ] Revisar que el sitio funciona en desarrollo
- [ ] Probar build de producción

### 7.2 Archivos a Migrar (Lista Actual)

#### Imágenes de Equipo
```
❌ Alexandria-Rakes.webp → ✅ team-alexandria-rakes-rounded.webp
❌ Amy-Melendrez.webp → ✅ team-amy-melendrez-rounded.webp
❌ Andrea-Lucero.webp → ✅ team-andrea-lucero-rounded.webp
[... y así para todos los miembros del equipo]
```

**Ubicaciones actuales:**
- `public/rounded-color/` → `public/team/color/`
- `public/rounded-white/` → `public/team/white/`
- `public/rounded-decorative/` → `public/team/decorative/`
- `public/square/` → `public/team/square/`

#### Archivos de Datos
```
❌ team_members_info.json → ✅ data-team-members-info.json
❌ team_members_info.csv → ✅ data-team-members-info.csv
```

**Nueva ubicación:** `public/data/`

### 7.3 Consideraciones para URLs y Referencias

**En archivos JSON:**
```json
// ❌ ANTES
{
  "backgroundImage": "/rounded-color/Alexandria-Rakes.webp"
}

// ✅ DESPUÉS
{
  "backgroundImage": "/team/color/team-alexandria-rakes-color.webp"
}
```

**En componentes:**
```astro
<!-- ❌ ANTES -->
<img src="/rounded-color/Alexandria-Rakes.webp" />

<!-- ✅ DESPUÉS -->
<img src="/team/color/team-alexandria-rakes-color.webp" />
```

**En servicios TypeScript:**
```typescript
// ❌ ANTES
const imagePath = `/rounded-color/${memberName}.webp`;

// ✅ DESPUÉS
const imagePath = `/team/color/team-${memberName.toLowerCase().replace(/\s+/g, '-')}-color.webp`;
```

### 7.4 Script de Migración (Opcional)

Para proyectos grandes, considera crear un script de migración:

```bash
# Ejemplo de script bash (renombrar archivos de equipo)
#!/bin/bash
cd public/rounded-color/
for file in *.webp; do
    newname=$(echo "$file" | tr '[:upper:]' '[:lower:]' | sed 's/^/team-/' | sed 's/\.webp$/-color.webp/')
    mv "$file" "../team/color/$newname"
done
```

**Nota:** Siempre prueba scripts en un entorno de desarrollo primero y haz backup.

---

## 8. Herramientas y Automatización

### 8.1 Scripts Útiles para Renombrar Archivos

#### PowerShell (Windows)
```powershell
# Renombrar archivos de PascalCase a kebab-case
Get-ChildItem -Path "public/rounded-color/" -Filter "*.webp" | 
    ForEach-Object {
        $newName = $_.Name.ToLower() -replace '([a-z])([A-Z])', '$1-$2' -replace ' ', '-'
        $newName = "team-$newName" -replace '\.webp$', '-color.webp'
        Rename-Item -Path $_.FullName -NewName $newName
    }
```

#### Node.js Script
```javascript
// rename-files.js
const fs = require('fs');
const path = require('path');

function toKebabCase(str) {
  return str
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');
}

// Ejemplo de uso
const files = fs.readdirSync('public/rounded-color');
files.forEach(file => {
  const ext = path.extname(file);
  const name = path.basename(file, ext);
  const newName = `team-${toKebabCase(name)}-color${ext}`;
  fs.renameSync(
    `public/rounded-color/${file}`,
    `public/team/color/${newName}`
  );
});
```

### 8.2 Validación de Nombres

#### Reglas de Validación
Puedes crear un script que valide que todos los archivos sigan las convenciones:

```javascript
// validate-filenames.js
const fs = require('fs');
const path = require('path');

function validateFilename(filename) {
  const issues = [];
  
  // Verificar que esté en lowercase
  if (filename !== filename.toLowerCase()) {
    issues.push('Debe estar en minúsculas');
  }
  
  // Verificar que no tenga espacios
  if (filename.includes(' ')) {
    issues.push('No debe tener espacios');
  }
  
  // Verificar que use guiones, no underscores
  if (filename.includes('_')) {
    issues.push('Debe usar guiones (-), no underscores (_)');
  }
  
  // Verificar que no tenga caracteres especiales
  if (!/^[a-z0-9-]+\./.test(filename)) {
    issues.push('Solo debe contener letras, números y guiones');
  }
  
  return issues;
}

// Validar todos los archivos en public/
function validateAllFiles(dir) {
  const files = fs.readdirSync(dir, { withFileTypes: true });
  
  files.forEach(file => {
    const fullPath = path.join(dir, file.name);
    
    if (file.isDirectory()) {
      validateAllFiles(fullPath);
    } else {
      const issues = validateFilename(file.name);
      if (issues.length > 0) {
        console.error(`❌ ${fullPath}:`);
        issues.forEach(issue => console.error(`   - ${issue}`));
      }
    }
  });
}

validateAllFiles('public');
```

### 8.3 Linters y Herramientas

#### ESLint Plugin (si aplica)
Para proyectos que usan ESLint, puedes crear reglas personalizadas para validar rutas de archivos en el código.

#### Pre-commit Hooks
Usar herramientas como Husky para validar nombres de archivos antes de hacer commit:

```json
// package.json
{
  "scripts": {
    "validate:filenames": "node scripts/validate-filenames.js",
    "precommit": "npm run validate:filenames"
  }
}
```

---

## 9. Aplicación a Futuros Proyectos

### 9.1 Checklist Inicial para Nuevos Proyectos

Al iniciar un nuevo proyecto, sigue estos pasos:

**Setup Inicial:**
- [ ] Crear estructura de carpetas según convenciones
- [ ] Copiar este documento de convenciones al proyecto
- [ ] Configurar scripts de validación (opcional)
- [ ] Establecer pre-commit hooks (opcional)

**Durante el Desarrollo:**
- [ ] Seguir las convenciones desde el primer archivo
- [ ] Validar nombres antes de hacer commit
- [ ] Documentar cualquier excepción necesaria

### 9.2 Plantilla de Estructura de Carpetas

Para nuevos proyectos, usa esta estructura base:

```
public/
├── banners/
├── icons/
├── logos/
├── team/
│   ├── rounded/
│   ├── square/
│   ├── color/
│   └── white/
├── content/
├── videos/
├── documents/
├── data/
└── fonts/
```

### 9.3 Adaptación para Diferentes Tipos de Proyectos

**E-commerce:**
```
public/
├── products/
│   └── product-[nombre]-[variante].webp
├── categories/
│   └── category-[nombre]-banner.webp
└── ...
```

**Blog/Contenido:**
```
public/
├── posts/
│   └── post-[slug]-featured-image.webp
├── authors/
│   └── author-[nombre]-avatar.webp
└── ...
```

**Portfolio:**
```
public/
├── projects/
│   └── project-[nombre]-thumbnail.webp
├── clients/
│   └── client-[nombre]-logo.svg
└── ...
```

---

## 10. Preguntas Frecuentes

### ¿Qué hago si un nombre es muy largo?
Prioriza la claridad sobre la brevedad, pero intenta mantenerlo bajo 50 caracteres. Si es necesario, usa abreviaciones comunes y bien entendidas.

### ¿Puedo usar números en los nombres?
Sí, los números están permitidos. Úsalos cuando sea relevante (versiones, secuencias, etc.).

### ¿Qué pasa con archivos que ya tienen nombres incorrectos?
Sigue el plan de migración (Sección 7) para renombrarlos gradualmente. No es necesario hacerlo todo de una vez, pero sí mantener consistencia en archivos nuevos.

### ¿Debo renombrar archivos de terceros (librerías, frameworks)?
No. Solo aplica estas convenciones a archivos que tú creas o subes al proyecto. Los archivos de node_modules o dependencias externas mantienen sus nombres originales.

### ¿Cómo manejo archivos con el mismo nombre pero diferentes formatos?
Usa el formato estándar y deja que la extensión diferencie:
```
✅ logo.svg
✅ logo.png
✅ logo.webp
```

### ¿Qué hago si necesito una excepción a las reglas?
Documenta la excepción en este documento o en un archivo README del proyecto. Las excepciones deben ser justificadas y mínimas.

---

## 11. Resumen de Reglas Rápidas

### Reglas de Oro
1. **Solo minúsculas** - `banner-hero.webp` ✅
2. **Guiones para separar** - `team-member-name.webp` ✅
3. **Nombres descriptivos** - `icon-menu-close.svg` ✅
4. **Sin espacios ni caracteres especiales** - `file name.webp` ❌
5. **Incluir palabras clave relevantes** - `content-services-therapy.webp` ✅

### Formato Estándar
```
[prefijo]-[categoria]-[descripcion]-[variante].[extension]
```

### Ejemplos por Tipo
- **Banners:** `banner-hero-section.webp`
- **Iconos:** `icon-menu.svg`
- **Equipo:** `team-alexandria-rakes-rounded.webp`
- **Videos:** `video-hero-home.mp4`
- **Documentos:** `doc-forms-intake-form.pdf`
- **Datos:** `data-team-members-info.json`

---

## Notas Finales

- **Consistencia es clave:** Una vez establecidas las convenciones, síguelas estrictamente
- **Documenta excepciones:** Si necesitas hacer una excepción, documéntala
- **Revisa regularmente:** Periódicamente revisa que los nuevos archivos sigan las convenciones
- **Comparte con el equipo:** Asegúrate de que todos los miembros del equipo conozcan estas convenciones

---

**Última actualización:** 2024-01-15  
**Versión del documento:** 1.0  
**Estado:** Activo - En uso
