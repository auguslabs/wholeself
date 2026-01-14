# Versiones Estables del Proyecto

Este documento registra las versiones estables del proyecto que funcionan correctamente y pueden ser restauradas si es necesario.

## Formato de Entrada

```
## [Tag] - Fecha
**Estado**: ✅ Funcional / ⚠️ Parcial / ❌ Roto
**Descripción**: Qué incluye esta versión
**Características principales**:
- Feature 1
- Feature 2
**Notas**: Cualquier información relevante
```

---

## Versiones Registradas

### snapshot-2026-01-14 (Estado Actual)
**Estado**: ✅ Funcional
**Fecha**: 2026-01-14
**Descripción**: Estado actual del proyecto antes de implementar mejoras futuras. Versión base funcional estable.
**Características principales**:
- Sistema de servicios completo
- Páginas de contacto funcionando
- Sistema de equipo (team)
- Páginas de rates y fellowship
- Layout responsive
- Modal de recursos de crisis
**Notas**: Esta es la versión base funcional. Todas las features futuras deben partir de aquí.

---

## Cómo Usar Este Documento

1. **Antes de crear un tag**, agregar una entrada aquí
2. **Después de crear el tag**, completar la fecha y detalles
3. **Mantener actualizado** con cada versión estable importante
4. **Marcar versiones obsoletas** si ya no son relevantes

## Restaurar una Versión

Para restaurar una versión específica:

```bash
# Ver el código de esa versión
git checkout <tag-name>

# O crear un branch desde esa versión
git checkout -b restore-<tag-name> <tag-name>
```
