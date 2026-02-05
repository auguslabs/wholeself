# Guia de ambientes y pruebas (indice)

Este paquete de documentos explica como trabajar con ambientes de prueba,
datos y bases de datos, despliegue seguro, y practicas profesionales para
aplicaciones web.

## Documentos

- `ambientes-pruebas.md`: conceptos y tipos de ambientes (dev, test, stage, prod).
- `bases-datos-datos-pruebas.md`: manejo de datos, seeds, migraciones, backups.
- `estrategia-pruebas.md`: tipos de pruebas, piramide y automatizacion.
- `ci-cd-y-deploy.md`: pipeline, validaciones, y despliegue sin riesgos.
- `checklist-deploy.md`: lista corta para deploy y merges.
- `flujo-branches-deploy.md`: ramas recomendadas y flujo de PRs.
- **`plan-migracion-bluehost-formularios.md`**: plan de migración a Bluehost (rama, seguridad, BD de los 4 formularios).
- **`plan-accion-migracion-bluehost.md`**: plan de acción paso a paso (10 pasos con checkboxes y verificaciones); usar este para ejecutar la migración.
- **`checklist-seguridad-secretos.md`**: checklist antes de cada push/PR para no subir claves ni secretos.
- **`esquema-bd-formularios.md`**: esquema de tablas para los 4 formularios (Fase 1).
- **`guia-prueba-api-formularios-bd.md`**: guía paso a paso para probar la API contra tu BD (BanaHost, etc.) antes del Paso 7.
- **`deploy-banahost.md`**: opciones para desplegar en BanaHost (Node.js vs solo FTP/PHP) y pasos según tu plan.

## Objetivo

Ayudarte a evitar cambios riesgosos en configuraciones, entender como validar
en local y en staging, y preparar un deploy confiable a la nube.

## Opciones a definir para tu proyecto (guia de estudio)

Estas opciones son las que normalmente se revisan en equipos profesionales:

- Base de datos principal (Postgres, MySQL, SQLite, etc.)
- Hosting / deploy (Netlify, Vercel, Bluehost, otro)
- CI/CD activo (GitHub Actions, Netlify, manual)
- Manejo de variables de entorno (`.env`, panel del proveedor, secret manager)
- Estrategia de migraciones y seeds
- Politica de backups y restauracion
- Herramientas de pruebas (unitarias, integracion, E2E)
