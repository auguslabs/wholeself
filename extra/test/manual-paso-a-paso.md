# Manual paso a paso: ambientes, DB local y pruebas

Este manual es generico y puede ajustarse a tu stack real.

## Paso 1: definir ambientes y responsabilidades

1. Local: desarrollo diario.
2. Test/QA: validacion funcional.
3. Staging: espejo de produccion.
4. Produccion: usuarios reales.

Recomendacion:

- documentar quien aprueba deploys y cambios en config

## Paso 2: preparar configuracion por ambiente

1. Crear archivos `.env` por ambiente:
   - `.env.local`, `.env.test`, `.env.staging`, `.env.production`
2. Crear `.env.example` con nombres de variables.
3. Validar variables obligatorias al iniciar la app.

Variables tipicas:

- `DATABASE_URL`
- `PUBLIC_BASE_URL`
- `API_KEY`
- `FEATURE_FLAG_X`

## Paso 3: crear base de datos local con el mismo schema

1. Definir migraciones (si ya existen, solo ejecutarlas).
2. Ejecutar migraciones en local.
3. Crear seeds con datos ficticios.
4. Tener un comando para resetear y resembrar la DB.

Resultado:

- estructura igual a produccion, pero con datos seguros.

## Paso 4: preparar pruebas basicas

1. Unitarias para logica y utils.
2. Integracion para API + DB.
3. E2E para flujos criticos.

Regla general:

- muchas unitarias, pocas E2E.

## Paso 5: flujo de cambios con seguridad

1. Crear rama por cambio.
2. Hacer PR y correr tests.
3. Deploy a staging.
4. Validar y aprobar.
5. Deploy a produccion.

## Paso 6: manejo de backups y migraciones

1. Backups automaticos en prod.
2. Backup antes de migraciones grandes.
3. Probar restauracion.

## Paso 7: cuando algo falla

1. Revisar logs y variables de entorno.
2. Comparar staging vs prod.
3. Hacer rollback si es necesario.

## Checklist rapido

- [ ] `.env` separado por ambiente
- [ ] DB local con migraciones y seeds
- [ ] Tests en PR
- [ ] Staging activo
- [ ] Backup listo
