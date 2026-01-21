# CI/CD y despliegue seguro

## Que es CI/CD

- **CI** (Integracion continua): compilar y probar cambios automaticamente.
- **CD** (Entrega o Deploy continuo): desplegar cambios con controles.

## Pipeline tipico

1. Lint + build
2. Tests unitarios y de integracion
3. Build de produccion
4. Deploy a staging
5. Smoke tests en staging
6. Aprobacion manual
7. Deploy a produccion

Opcional en equipos grandes:

- escaneo de seguridad (dependencias y secretos)
- pruebas de performance en staging

## Configuracion critica que no se debe tocar en local

- secretos de prod (API keys reales)
- URLs de prod (si no es necesario)
- reglas de deployment del proveedor
- configuracion de DNS o certificados
- webhooks y tokens de integraciones

## Estrategia de deploy sin riesgos

- siempre tener staging
- usar feature flags para cambios grandes
- hacer releases pequenos y frecuentes
- rollback simple: mantener version anterior lista
- canary o blue/green para cambios delicados

## Para evitar problemas de merge

Buenas practicas:

- ramas cortas y con cambios pequenos
- rebase o merge frecuente desde `main`
- evitar tocar los mismos archivos de config en paralelo
- documentar cambios de config en el PR
- resolver conflictos de config con una persona responsable

## Cuando algo falla en el deploy

1. Revertir o rollback a la version anterior
2. Revisar logs del build y del runtime
3. Comparar variables de entorno entre staging y prod
4. Revisar migraciones recientes
