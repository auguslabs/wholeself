# Checklist de deploy y merge

## Antes del merge

- [ ] Cambios pequenos y bien descritos
- [ ] Build local exitoso
- [ ] Tests criticos pasan
- [ ] `.env` sin secretos en repositorio
- [ ] Documentar cambios en config
- [ ] Revisar conflictos en archivos de config

## Antes del deploy a staging

- [ ] Migraciones listas
- [ ] Seeds actualizados (si aplica)
- [ ] Variables de entorno correctas
- [ ] Build de produccion pasa
- [ ] Smoke tests pasan en staging

## Antes del deploy a produccion

- [ ] Smoke tests en staging
- [ ] QA o validacion funcional
- [ ] Backup actualizado
- [ ] Plan de rollback definido
- [ ] Ventana de despliegue acordada

## Despues del deploy

- [ ] Validar flujos clave en prod
- [ ] Revisar errores y logs
- [ ] Registrar lecciones aprendidas
- [ ] Actualizar documentacion tecnica
