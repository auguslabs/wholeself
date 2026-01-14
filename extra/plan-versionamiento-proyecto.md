# Plan de Versionamiento del Proyecto

## Objetivo
Mantener un sistema organizado para guardar "fotografías" del estado funcional del proyecto, permitiendo restaurar versiones anteriores cuando sea necesario, especialmente al trabajar en features complejas por fases.

## Estrategia de Versionamiento

### 1. Tags de Git para Versiones Estables
Los **tags** son como "fotografías" permanentes de estados específicos del código que funcionan correctamente.

#### Convención de Nombres
- `v1.0.0-stable` - Versión estable principal
- `v1.1.0-stable` - Versión estable con mejoras
- `snapshot-YYYY-MM-DD` - Snapshot diario (ej: `snapshot-2024-01-15`)
- `pre-feature-NOMBRE` - Antes de empezar una feature grande (ej: `pre-feature-traduccion`)

### 2. Branches para Features Grandes
Para features complejas que requieren múltiples fases (como traducción):

#### Flujo de Trabajo
1. **Crear branch de feature**: `git checkout -b feature/traduccion-fase1`
2. **Trabajar en fases pequeñas**
3. **Hacer commit frecuente** con mensajes descriptivos
4. **Merge a main** solo cuando la fase esté completa y probada
5. **Crear tag** después de cada merge exitoso

### 3. Commits Descriptivos
Usar mensajes claros que indiquen qué se hizo:
```
feat: agregar selector de idioma en header
fix: corregir error en traducción de servicios
refactor: reorganizar estructura de archivos de traducción
```

## Proceso de Trabajo

### Antes de Empezar una Feature Grande

1. **Verificar que todo funciona**: `npm run build` y probar localmente
2. **Hacer commit de cambios pendientes** (si los hay)
3. **Crear tag de snapshot**: 
   ```bash
   git tag -a snapshot-YYYY-MM-DD -m "Snapshot antes de feature X"
   git push origin snapshot-YYYY-MM-DD
   ```
4. **Crear branch de feature**: `git checkout -b feature/nombre-feature`

### Durante el Desarrollo

1. **Commits frecuentes** (cada cambio funcional)
2. **Probar después de cada cambio importante**
3. **Si algo se rompe**, restaurar desde el último commit: `git reset --hard HEAD~1`

### Después de Completar una Fase

1. **Probar todo a fondo**
2. **Merge a main**: `git checkout main && git merge feature/nombre-feature`
3. **Crear tag estable**: `git tag -a v1.X.0-stable -m "Versión estable después de feature X"`
4. **Push de todo**: `git push origin main --tags`

## Restaurar Versiones Anteriores

### Opción 1: Ver código de un tag específico
```bash
git checkout snapshot-2024-01-15
# Ver el código, probar, etc.
git checkout main  # Volver a main
```

### Opción 2: Crear branch desde un tag anterior
```bash
git checkout -b restore-snapshot-2024-01-15 snapshot-2024-01-15
# Trabajar en esta versión
```

### Opción 3: Revertir cambios específicos
```bash
git log  # Ver commits
git revert <commit-hash>  # Revertir un commit específico
```

## Checklist para Snapshot

Antes de crear un snapshot/tag, verificar:

- [ ] El proyecto compila sin errores: `npm run build`
- [ ] No hay errores de TypeScript: `npm run build` (verifica TS)
- [ ] La aplicación funciona en desarrollo: `npm run dev`
- [ ] No hay archivos temporales o de prueba
- [ ] Los cambios están commiteados
- [ ] El mensaje del commit es descriptivo

## Comandos Útiles

### Ver todos los tags
```bash
git tag -l
```

### Ver información de un tag
```bash
git show snapshot-2024-01-15
```

### Eliminar un tag (si es necesario)
```bash
git tag -d snapshot-2024-01-15
git push origin :refs/tags/snapshot-2024-01-15
```

### Ver diferencias entre tags
```bash
git diff snapshot-2024-01-15 snapshot-2024-01-20
```

## Ejemplo de Flujo Completo

### Escenario: Implementar sistema de traducción

1. **Estado actual funciona bien** → Crear snapshot:
   ```bash
   git add .
   git commit -m "Estado estable antes de implementar traducción"
   git tag -a snapshot-2024-01-15 -m "Snapshot antes de traducción"
   git push origin main --tags
   ```

2. **Crear branch para la feature**:
   ```bash
   git checkout -b feature/traduccion-fase1
   ```

3. **Trabajar en Fase 1** (selector de idioma):
   ```bash
   # Hacer cambios...
   git add .
   git commit -m "feat: agregar selector de idioma en header"
   ```

4. **Si algo se rompe**, restaurar:
   ```bash
   git reset --hard snapshot-2024-01-15
   ```

5. **Completar Fase 1 y mergear**:
   ```bash
   git checkout main
   git merge feature/traduccion-fase1
   git tag -a v1.1.0-stable -m "Versión con selector de idioma"
   git push origin main --tags
   ```

## Notas Importantes

- **Nunca hacer force push a main** (`git push --force`)
- **Los tags son permanentes** - usarlos solo para estados realmente estables
- **Hacer backups regulares** del repositorio
- **Documentar cambios importantes** en `extra/` o en los commits

## Próximos Pasos

1. Crear snapshot del estado actual (funcional)
2. Establecer este proceso como estándar
3. Usar branches para features grandes
4. Revisar y limpiar tags antiguos periódicamente
