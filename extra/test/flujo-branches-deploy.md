# Flujo recomendado de branches y deploy

## Objetivo

Evitar conflictos en configuraciones y asegurar deploys estables.

## Estructura sugerida de ramas

- `main`: estable y deploy a produccion
- `staging`: validacion final
- `feature/*`: cambios pequenos y aislados

Si el equipo es pequeno:

- usar `main` + `feature/*` y deploy a staging desde `main`

## Flujo recomendado

1. Crear `feature/nombre-del-cambio`
2. Desarrollar y probar en local
3. Abrir PR contra `main`
4. Ejecutar tests en CI
5. Merge a `main`
6. Deploy a staging
7. Validar
8. Deploy a produccion

## Reglas para archivos de configuracion

- cambiar configs en una sola rama a la vez
- documentar cambios en el PR
- asignar un responsable para conflictos

## Para evitar conflictos

- ramas cortas y merges frecuentes
- evitar tocar los mismos archivos
- comunicar cambios de config antes del merge

## Politica de hotfix

1. Crear `hotfix/descripcion`
2. Fix rapido en `main`
3. Deploy a staging y prod
4. Merge de vuelta a ramas activas si aplica
