# Estrategia de pruebas para aplicaciones web

## Piramide de pruebas (modelo clasico)

- **Unitarias**: validan funciones aisladas y rapidas
- **Integracion**: validan flujos entre modulos o servicios
- **E2E (end-to-end)**: validan flujos completos como usuario

Recomendacion general:

- muchas unitarias
- algunas de integracion
- pocas E2E por costo y mantenimiento

## Tipos de pruebas utiles

- **Unitarias**: logica pura, utils, validaciones
- **Integracion**: API + DB, servicios externos mockeados
- **UI**: componentes, rendering y accesibilidad
- **E2E**: login, formularios, navegacion critica
- **Regresion**: repetir tests despues de cambios
- **Smoke tests**: verificacion minima luego de deploy

## Automatizacion

Buenas practicas:

- ejecutar tests en cada PR
- bloquear merge si fallan
- correr E2E en staging antes de prod
- guardar reportes (artefactos) de tests en CI

## Cobertura y enfoque

- medir cobertura, pero no obsesionarse con el numero
- priorizar rutas criticas (auth, pagos, formularios)
- usar contratos o mocks para servicios externos

## Herramientas comunes (para estudio)

- **Unitarias**: Vitest, Jest, Mocha
- **UI**: Testing Library
- **E2E**: Playwright, Cypress
- **API**: Supertest, Postman/Newman

## Definicion de "listo para deploy"

Una rama esta lista si:

- build pasa sin errores
- tests criticos pasan
- no hay secretos en el codigo
- staging valida los flujos clave
- checklist de deploy completado

## Documentar decisiones y riesgos

Para evitar problemas:

- anotar cambios en config
- definir quien aprueba un deploy
- registrar incidentes y lecciones aprendidas
