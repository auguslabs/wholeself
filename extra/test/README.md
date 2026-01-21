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
