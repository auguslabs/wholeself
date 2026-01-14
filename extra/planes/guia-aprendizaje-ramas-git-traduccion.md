# Guía de Aprendizaje: Ramas en Git/GitHub - Implementando Traducción al Español

## Resumen

Esta guía te enseñará **desde cero** cómo trabajar con ramas (branches) en Git/GitHub, usando como ejemplo práctico la implementación de la funcionalidad de traducción al español en nuestro sitio web.

**Objetivo de aprendizaje:**
- Entender qué son las ramas y por qué se usan
- Aprender a crear, trabajar y fusionar ramas
- Implementar la traducción al español como ejemplo práctico
- Aprender el flujo completo de trabajo con ramas

**Tiempo estimado:** 2-3 horas (dependiendo de tu experiencia)

---

## 1. ¿Qué es una Rama? Conceptos Fundamentales

### 1.1 La Analogía del Árbol

Imagina que tu proyecto es un **árbol**:
- **Tronco principal (main/master):** Es la versión estable y funcional de tu proyecto
- **Ramas (branches):** Son líneas de desarrollo separadas donde puedes trabajar en nuevas características sin afectar el tronco principal

```
        main (tronco principal - código estable)
         |
         ├── feature/traduccion-espanol (rama nueva - trabajando en traducción)
         │
         └── feature/nueva-funcionalidad (otra rama - otra característica)
```

### 1.2 ¿Por Qué Usar Ramas?

**Problema sin ramas:**
- Trabajas directamente en `main`
- Si algo se rompe, todo el proyecto se rompe
- No puedes probar nuevas características sin riesgo
- Varias personas no pueden trabajar en paralelo

**Solución con ramas:**
- ✅ `main` siempre tiene código estable y funcional
- ✅ Puedes experimentar sin miedo en una rama
- ✅ Varios desarrolladores pueden trabajar en paralelo
- ✅ Puedes probar cambios antes de integrarlos
- ✅ Si algo sale mal, solo afecta la rama, no `main`

### 1.3 Caso Práctico: Traducción al Español

**Escenario:**
- Tu sitio web funciona perfectamente en inglés (código en `main`)
- Quieres agregar traducción al español
- Esto requiere cambios en múltiples archivos
- No quieres romper el sitio mientras trabajas

**Solución:**
1. Crear una rama `feature/traduccion-espanol`
2. Trabajar en la traducción en esa rama
3. Probar que todo funciona
4. Cuando esté listo, fusionar (merge) la rama a `main`

---

## 2. Conceptos Clave que Necesitas Entender

### 2.1 Repositorio Local vs Remoto

- **Repositorio Local:** Tu copia del código en tu computadora
- **Repositorio Remoto:** La copia en GitHub (en la nube)
- **Sincronización:** Puedes "subir" (push) y "bajar" (pull) cambios entre ambos

### 2.2 Estados de Archivos en Git

Git rastrea el estado de tus archivos:

- **Untracked:** Archivo nuevo que Git no conoce aún
- **Modified:** Archivo que has cambiado pero no has guardado en Git
- **Staged:** Archivo preparado para ser guardado (commit)
- **Committed:** Cambio guardado permanentemente en Git

### 2.3 Commit

Un **commit** es como una "foto" del estado de tu código en un momento específico. Es tu forma de decir: "En este punto, mi código estaba así".

**Ejemplo:**
```
Commit 1: "Agregué estructura básica de traducción"
Commit 2: "Traduje la página home al español"
Commit 3: "Agregué selector de idioma en el header"
```

---

## 3. Comandos Básicos de Git que Necesitas

### 3.1 Comandos Esenciales

```bash
# Ver en qué rama estás
git branch

# Ver el estado de tus archivos
git status

# Ver el historial de commits
git log

# Ver cambios en archivos
git diff
```

### 3.2 Comandos para Trabajar con Ramas

```bash
# Crear una nueva rama
git branch nombre-de-la-rama

# Cambiar a una rama
git checkout nombre-de-la-rama

# Crear y cambiar a una rama (en un solo comando)
git checkout -b nombre-de-la-rama

# Ver todas las ramas (locales y remotas)
git branch -a

# Eliminar una rama (solo después de fusionarla)
git branch -d nombre-de-la-rama
```

### 3.3 Comandos para Guardar Cambios

```bash
# Agregar archivos al área de staging
git add nombre-archivo.js
git add .  # Agregar todos los archivos modificados

# Guardar cambios (commit)
git commit -m "Mensaje descriptivo de lo que hiciste"

# Subir cambios a GitHub
git push origin nombre-de-la-rama
```

---

## 4. Flujo de Trabajo con Ramas: Paso a Paso

### 4.1 El Flujo Completo (Resumen Visual)

```
1. Estás en main (código estable)
   ↓
2. Creas rama: feature/traduccion-espanol
   ↓
3. Cambias a esa rama
   ↓
4. Trabajas en la traducción (haces commits)
   ↓
5. Subes la rama a GitHub
   ↓
6. Creas Pull Request en GitHub
   ↓
7. Revisas y pruebas
   ↓
8. Fusionas (merge) a main
   ↓
9. Eliminas la rama (ya no se necesita)
```

---

## 5. Implementación Práctica: Traducción al Español

### 5.1 Paso 1: Verificar Estado Actual

**Antes de empezar, siempre verifica dónde estás:**

```bash
# Ver en qué rama estás actualmente
git branch

# Deberías ver algo como:
# * main
# (El asterisco * indica la rama actual)

# Ver el estado de tus archivos
git status

# Debería decir: "working tree clean" (sin cambios pendientes)
```

**✅ Checklist:**
- [ ] Estás en la rama `main`
- [ ] No tienes cambios sin guardar (`git status` está limpio)
- [ ] Tu código local está actualizado con GitHub

### 5.2 Paso 2: Actualizar Main (Asegurarte de tener la última versión)

```bash
# Asegúrate de tener la última versión de main
git checkout main
git pull origin main
```

**¿Qué hace esto?**
- `git checkout main`: Cambia a la rama main
- `git pull origin main`: Descarga los últimos cambios de GitHub

### 5.3 Paso 3: Crear la Rama para Traducción

```bash
# Crear y cambiar a la nueva rama
git checkout -b feature/traduccion-espanol
```

**¿Qué hace esto?**
- Crea una nueva rama llamada `feature/traduccion-espanol`
- Te cambia automáticamente a esa rama
- Ahora estás trabajando en una copia de `main`

**Verificar que funcionó:**
```bash
git branch

# Deberías ver:
#   main
# * feature/traduccion-espanol  (el asterisco indica que estás aquí)
```

**Convención de nombres:**
- `feature/` = Nueva característica
- `fix/` = Corrección de bug
- `hotfix/` = Corrección urgente
- `refactor/` = Reorganización de código

### 5.4 Paso 4: Trabajar en la Traducción

Ahora puedes trabajar normalmente. Todos tus cambios estarán en esta rama, no en `main`.

**Ejemplo de trabajo:**

1. **Editar archivos de traducción:**
   - Abre `src/data/content/pages/home.json`
   - Asegúrate de que todos los textos tengan versión en español (`"es"`)

2. **Crear componente de selector de idioma:**
   - Crea `src/components/layout/LanguageSelector.tsx`
   - Implementa la funcionalidad de cambio de idioma

3. **Actualizar páginas para usar traducción:**
   - Modifica `src/pages/index.astro` para detectar idioma
   - Actualiza otras páginas según sea necesario

### 5.5 Paso 5: Guardar Cambios (Commits)

**Después de hacer cambios, guárdalos:**

```bash
# Ver qué archivos has modificado
git status

# Agregar archivos al staging
git add src/data/content/pages/home.json
git add src/components/layout/LanguageSelector.tsx
git add src/pages/index.astro

# O agregar todos los cambios de una vez
git add .

# Guardar cambios con un mensaje descriptivo
git commit -m "Agregar traducción al español para página home"

# Continuar trabajando...
git add .
git commit -m "Crear componente LanguageSelector"
git commit -m "Implementar detección de idioma en páginas"
```

**Buenas prácticas para mensajes de commit:**
- ✅ `"Agregar traducción al español para página home"`
- ✅ `"Crear componente LanguageSelector con soporte para en/es"`
- ❌ `"cambios"`
- ❌ `"fix"`
- ❌ `"asdf"`

**Mensajes descriptivos ayudan a:**
- Entender qué se hizo cuando revises el historial
- Encontrar cambios específicos más tarde
- Trabajar en equipo (otros entienden qué hiciste)

### 5.6 Paso 6: Subir la Rama a GitHub

**Cuando hayas terminado (o quieras hacer backup):**

```bash
# Subir la rama a GitHub por primera vez
git push -u origin feature/traduccion-espanol

# En commits posteriores, solo necesitas:
git push
```

**¿Qué hace esto?**
- `-u origin feature/traduccion-espanol`: Establece la conexión entre tu rama local y la remota
- `origin`: Es el nombre del repositorio remoto (GitHub)
- `feature/traduccion-espanol`: El nombre de tu rama

**Después de esto:**
- Tu rama ahora existe en GitHub
- Otros pueden verla
- Puedes crear un Pull Request

### 5.7 Paso 7: Crear Pull Request (PR) en GitHub

**Pull Request = Solicitud para fusionar tu rama a main**

1. **Ve a GitHub en tu navegador:**
   - Abre tu repositorio
   - Verás un mensaje: "feature/traduccion-espanol had recent pushes"
   - Click en "Compare & pull request"

2. **Completa el Pull Request:**
   - **Título:** "Agregar traducción al español"
   - **Descripción:** Explica qué hiciste:
     ```
     ## Cambios realizados
     - ✅ Traducción completa de página home
     - ✅ Creación de componente LanguageSelector
     - ✅ Implementación de detección de idioma
     - ✅ Actualización de todas las páginas principales
     
     ## Cómo probar
     1. Cambiar idioma usando el selector en el header
     2. Verificar que todos los textos cambian correctamente
     3. Probar en diferentes páginas
     ```

3. **Revisar cambios:**
   - GitHub muestra todos los archivos que cambiaste
   - Puedes revisar línea por línea
   - Puedes dejar comentarios

4. **Solicitar revisión (opcional):**
   - Si trabajas en equipo, puedes pedirle a alguien que revise
   - Click en "Reviewers" y selecciona personas

### 5.8 Paso 8: Revisar y Probar

**Antes de fusionar, asegúrate de que todo funciona:**

1. **Probar localmente:**
   ```bash
   # Asegúrate de estar en tu rama
   git checkout feature/traduccion-espanol
   
   # Ejecutar el proyecto
   npm run dev
   
   # Probar:
   # - Cambiar idioma
   # - Verificar que todos los textos se traducen
   # - Probar en diferentes páginas
   # - Verificar que no hay errores en consola
   ```

2. **Revisar el código:**
   - Lee tus cambios en GitHub
   - Asegúrate de que el código sea claro
   - Verifica que no hay código comentado o temporal

3. **Corregir problemas (si los hay):**
   ```bash
   # Si encuentras un error, corrígelo
   # Luego:
   git add .
   git commit -m "Corregir error en detección de idioma"
   git push
   # El PR se actualiza automáticamente
   ```

### 5.9 Paso 9: Fusionar (Merge) a Main

**Cuando todo esté listo y probado:**

1. **En GitHub:**
   - Ve a tu Pull Request
   - Click en "Merge pull request"
   - Selecciona "Create a merge commit" (recomendado)
   - Click en "Confirm merge"

2. **Actualizar tu copia local:**
   ```bash
   # Cambiar a main
   git checkout main
   
   # Descargar los cambios fusionados
   git pull origin main
   
   # Verificar que todo está actualizado
   git log
   ```

**¿Qué pasó?**
- Tu rama `feature/traduccion-espanol` se fusionó con `main`
- Ahora `main` tiene todos tus cambios de traducción
- El sitio web ahora tiene traducción al español

### 5.10 Paso 10: Limpiar (Eliminar la Rama)

**Ya no necesitas la rama, puedes eliminarla:**

```bash
# Eliminar la rama local
git branch -d feature/traduccion-espanol

# Eliminar la rama remota (en GitHub)
git push origin --delete feature/traduccion-espanol
```

**O desde GitHub:**
- Después de fusionar, GitHub ofrece un botón para eliminar la rama
- Click en "Delete branch"

**¿Por qué eliminar?**
- Mantiene el repositorio limpio
- Evita confusión
- Los cambios ya están en `main`, no necesitas la rama

---

## 6. Comandos Útiles Durante el Desarrollo

### 6.1 Ver Qué Cambiaste

```bash
# Ver archivos modificados
git status

# Ver cambios específicos en un archivo
git diff src/pages/index.astro

# Ver todos los cambios
git diff

# Ver cambios ya agregados al staging
git diff --staged
```

### 6.2 Deshacer Cambios

```bash
# Deshacer cambios en un archivo (antes de git add)
git checkout -- nombre-archivo.js

# Quitar archivo del staging (después de git add, antes de commit)
git reset HEAD nombre-archivo.js

# Deshacer el último commit (mantiene los cambios)
git reset --soft HEAD~1

# Deshacer el último commit (elimina los cambios)
git reset --hard HEAD~1  # ⚠️ CUIDADO: Esto elimina cambios permanentemente
```

### 6.3 Ver Historial

```bash
# Ver historial de commits
git log

# Ver historial más compacto
git log --oneline

# Ver historial con gráfico de ramas
git log --oneline --graph --all
```

### 6.4 Cambiar Entre Ramas

```bash
# Ver todas las ramas
git branch -a

# Cambiar a otra rama
git checkout nombre-otra-rama

# Si tienes cambios sin guardar, Git te avisará
# Opciones:
# 1. Guardar cambios: git add . && git commit -m "mensaje"
# 2. Guardar temporalmente: git stash
# 3. Descartar cambios: git checkout -- .
```

---

## 7. Resolución de Conflictos (Cuando Ocurren)

### 7.1 ¿Qué es un Conflicto?

**Ocurre cuando:**
- Tú y otra persona (o tú en otra rama) modifican la misma línea
- Git no sabe cuál versión usar
- Necesitas decidir manualmente

**Ejemplo:**
```
Rama main tiene:
  const lang = 'en';

Tu rama tiene:
  const lang = detectLanguage();
```

### 7.2 Cómo Resolver Conflictos

**1. Git te avisará:**
```bash
git merge main
# Auto-merging src/pages/index.astro
# CONFLICT (content): Merge conflict in src/pages/index.astro
```

**2. Abre el archivo con conflicto:**
```astro
<<<<<<< HEAD
const lang = detectLanguage();
=======
const lang = 'en';
>>>>>>> main
```

**3. Edita manualmente:**
- Elimina las marcas `<<<<<<<`, `=======`, `>>>>>>>`
- Deja el código correcto:
```astro
const lang = detectLanguage(); // Usar detección automática
```

**4. Marca como resuelto:**
```bash
git add src/pages/index.astro
git commit -m "Resolver conflicto en detección de idioma"
```

### 7.3 Prevenir Conflictos

- **Trabaja en archivos diferentes** cuando sea posible
- **Actualiza tu rama regularmente:**
  ```bash
  # Traer cambios de main a tu rama
  git checkout feature/traduccion-espanol
  git merge main
  # O usar rebase (más avanzado)
  git rebase main
  ```

---

## 8. Flujo de Trabajo Recomendado

### 8.1 Flujo Diario

```
1. Al empezar el día:
   git checkout main
   git pull origin main

2. Crear rama para tu trabajo:
   git checkout -b feature/mi-nueva-caracteristica

3. Trabajar normalmente:
   - Editar archivos
   - Probar
   - Hacer commits frecuentes

4. Al terminar el día (o cuando termines):
   git push -u origin feature/mi-nueva-caracteristica
   # Crear PR en GitHub
```

### 8.2 Buenas Prácticas

**✅ HACER:**
- Crear una rama por cada característica/fix
- Hacer commits pequeños y frecuentes
- Escribir mensajes de commit descriptivos
- Probar antes de fusionar
- Mantener `main` estable

**❌ NO HACER:**
- Trabajar directamente en `main`
- Hacer commits gigantes con muchos cambios
- Mensajes de commit vagos ("cambios", "fix")
- Fusionar sin probar
- Dejar ramas sin usar por mucho tiempo

---

## 9. Ejemplo Completo: Traducción al Español

### 9.1 Checklist de Implementación

**Fase 1: Preparación**
- [ ] Crear rama `feature/traduccion-espanol`
- [ ] Verificar que todos los JSON tienen estructura `en`/`es`

**Fase 2: Componentes**
- [ ] Crear `LanguageSelector.tsx`
- [ ] Integrar en `Header.tsx`
- [ ] Implementar detección de idioma del navegador
- [ ] Guardar preferencia en `localStorage`

**Fase 3: Páginas**
- [ ] Actualizar `index.astro` para usar idioma detectado
- [ ] Actualizar `services.astro`
- [ ] Actualizar `team.astro`
- [ ] Actualizar `contact.astro`
- [ ] Actualizar otras páginas según sea necesario

**Fase 4: Contenido**
- [ ] Verificar que todos los textos tienen traducción
- [ ] Completar traducciones faltantes
- [ ] Revisar calidad de traducciones

**Fase 5: Testing**
- [ ] Probar cambio de idioma en todas las páginas
- [ ] Verificar que `localStorage` guarda preferencia
- [ ] Probar en diferentes navegadores
- [ ] Verificar que no hay errores en consola

**Fase 6: Finalización**
- [ ] Crear Pull Request
- [ ] Revisar cambios
- [ ] Fusionar a `main`
- [ ] Eliminar rama

### 9.2 Secuencia de Comandos Completa

```bash
# 1. Preparación
git checkout main
git pull origin main
git checkout -b feature/traduccion-espanol

# 2. Trabajar en componentes
# (Editar archivos...)
git add src/components/layout/LanguageSelector.tsx
git commit -m "Crear componente LanguageSelector"

# 3. Trabajar en páginas
# (Editar archivos...)
git add src/pages/
git commit -m "Implementar detección de idioma en todas las páginas"

# 4. Trabajar en contenido
# (Editar archivos JSON...)
git add src/data/content/
git commit -m "Completar traducciones al español"

# 5. Subir a GitHub
git push -u origin feature/traduccion-espanol

# 6. Crear Pull Request en GitHub (desde el navegador)

# 7. Después de fusionar
git checkout main
git pull origin main
git branch -d feature/traduccion-espanol
git push origin --delete feature/traduccion-espanol
```

---

## 10. Preguntas Frecuentes

### ¿Cuántas ramas puedo tener?

Tantas como necesites. Cada característica puede tener su propia rama.

### ¿Qué pasa si trabajo en la rama equivocada?

No hay problema. Puedes:
```bash
# Crear una nueva rama desde donde estás
git checkout -b nueva-rama-correcta

# O mover tus cambios a otra rama
git stash
git checkout rama-correcta
git stash pop
```

### ¿Puedo cambiar el nombre de una rama?

Sí:
```bash
# Cambiar nombre de rama local
git branch -m nombre-viejo nombre-nuevo

# Si ya la subiste a GitHub:
git push origin --delete nombre-viejo
git push -u origin nombre-nuevo
```

### ¿Qué pasa si olvido en qué rama estoy?

```bash
git branch
# El asterisco * indica la rama actual

git status
# También muestra en qué rama estás
```

### ¿Puedo trabajar en varias ramas a la vez?

Sí, pero solo puedes estar en una a la vez. Cambia entre ellas con `git checkout`.

### ¿Qué es mejor: merge o rebase?

- **Merge:** Más simple, preserva historial completo
- **Rebase:** Historial más limpio, pero más complejo

**Para principiantes:** Usa `merge`. Es más seguro y fácil de entender.

---

## 11. Recursos Adicionales

### Documentación Oficial
- [Git Documentation](https://git-scm.com/doc)
- [GitHub Guides](https://guides.github.com/)

### Comandos de Referencia Rápida

```bash
# Ramas
git branch                          # Ver ramas
git branch nombre-rama             # Crear rama
git checkout nombre-rama           # Cambiar a rama
git checkout -b nombre-rama        # Crear y cambiar
git branch -d nombre-rama         # Eliminar rama

# Trabajo diario
git status                          # Ver estado
git add .                           # Agregar cambios
git commit -m "mensaje"             # Guardar cambios
git push                            # Subir a GitHub
git pull                            # Bajar de GitHub

# Información
git log                             # Ver historial
git diff                            # Ver cambios
```

---

## 12. Próximos Pasos

Una vez que domines el trabajo con ramas, puedes aprender:

1. **Git Rebase:** Para historial más limpio
2. **Git Stash:** Para guardar cambios temporalmente
3. **Git Cherry-pick:** Para traer commits específicos
4. **Git Hooks:** Para automatizar tareas
5. **Git Workflow Avanzado:** Git Flow, GitHub Flow, etc.

---

## Notas Finales

- **Practica:** La mejor forma de aprender es haciendo
- **No tengas miedo:** Las ramas son seguras, no puedes romper `main` trabajando en una rama
- **Commits frecuentes:** Es mejor hacer muchos commits pequeños que uno grande
- **Mensajes descriptivos:** Te ayudarán a ti y a tu equipo
- **Pregunta:** Si algo no está claro, busca ayuda o documentación

---

**Última actualización:** 2024-01-15  
**Versión de la guía:** 1.0  
**Estado:** Guía de aprendizaje activa
