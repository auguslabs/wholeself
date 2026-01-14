# Guía Rápida de Versionamiento

## ✅ Snapshot Actual Creado

**Tag**: `snapshot-2026-01-14`  
**Estado**: ✅ Funcional y compilando correctamente  
**Fecha**: 14 de enero de 2026

Este snapshot contiene el estado funcional actual del proyecto antes de implementar mejoras futuras.

---

## 🚀 Comandos Rápidos

### Crear un nuevo snapshot
```powershell
# Opción 1: Usar el script automatizado
.\scripts\crear-snapshot.ps1 snapshot "Descripción del snapshot"

# Opción 2: Manual
git add .
git commit -m "Estado antes de [descripción]"
git tag -a snapshot-YYYY-MM-DD -m "Descripción"
git push origin main --tags
```

### Ver todos los snapshots
```powershell
git tag -l
```

### Restaurar un snapshot
```powershell
# Ver el código de un snapshot
git checkout snapshot-2026-01-14

# Volver a main
git checkout main

# Crear un branch desde un snapshot
git checkout -b restore-snapshot-2026-01-14 snapshot-2026-01-14
```

### Trabajar en una feature grande (por fases)
```powershell
# 1. Crear snapshot antes de empezar
.\scripts\crear-snapshot.ps1 pre-feature traduccion

# 2. Crear branch para la feature
git checkout -b feature/traduccion-fase1

# 3. Trabajar y hacer commits frecuentes
git add .
git commit -m "feat: [descripción del cambio]"

# 4. Si algo se rompe, restaurar
git reset --hard HEAD~1  # Último commit
# O desde el snapshot
git checkout main
git reset --hard pre-feature-traduccion

# 5. Cuando la fase esté completa, mergear
git checkout main
git merge feature/traduccion-fase1
git tag -a v1.1.0-stable -m "Versión con traducción fase 1"
```

---

## 📋 Checklist Antes de Crear Snapshot

- [ ] Proyecto compila: `npm run build`
- [ ] No hay errores de TypeScript
- [ ] Aplicación funciona en desarrollo: `npm run dev`
- [ ] Cambios están commiteados
- [ ] Mensaje del commit es descriptivo

---

## 📚 Documentación Completa

- **Plan completo**: `extra/plan-versionamiento-proyecto.md`
- **Versiones registradas**: `extra/VERSIONES-ESTABLES.md`

---

## 💡 Tips

1. **Crear snapshot antes de features grandes** - Te permite volver atrás fácilmente
2. **Commits frecuentes** - Cada cambio funcional debe tener su commit
3. **Mensajes descriptivos** - Facilita encontrar cambios específicos
4. **Probar antes de taggear** - Asegúrate de que todo funciona
5. **Documentar en VERSIONES-ESTABLES.md** - Mantén un registro de qué incluye cada versión

---

## 🔄 Flujo Recomendado para Features Grandes

```
Estado Funcional
    ↓
Crear snapshot (pre-feature-XXX)
    ↓
Crear branch (feature/XXX-fase1)
    ↓
Trabajar en fases pequeñas
    ↓
Commits frecuentes
    ↓
Si algo se rompe → Restaurar desde snapshot
    ↓
Completar fase → Merge a main
    ↓
Crear tag estable (v1.X.0-stable)
    ↓
Repetir para siguiente fase
```
