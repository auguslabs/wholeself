# Bases de datos y datos de prueba: guia practica

## Objetivo

Tener una base de datos local con la misma estructura que produccion, sin usar
datos sensibles. Esto permite probar cambios con seguridad.

## Estructura y migraciones

La practica estandar en web es:

- **Migrations**: scripts versionados que crean o modifican tablas
- **Schema**: estructura base que el codigo conoce
- **Seed**: datos ficticios para pruebas

Beneficios:

- replica exacta del schema en local, staging y prod
- historia de cambios en la base (trazabilidad)
- no depende de exportar bases manualmente

## Datos de prueba

Tipos:

- **Ficticios**: nombres y correos genericos
- **Anonimizados**: datos reales pero sin PII (si es necesario)
- **Sinteticos**: generados con scripts y reglas
- **Mixtos**: combinacion de reales anonimizados y sinteticos

Buenas practicas:

- no guardar PII en repositorios
- limitar volumen de datos en local (solo lo necesario)
- versionar seeds si se usan para pruebas automaticas
- mantener seeds idempotentes (pueden correrse varias veces)
- crear un comando para resetear y resembrar la DB local

## Backups

Usos:

- recuperar cambios accidentales en prod
- validar migraciones en staging
- restaurar data para debug

Buenas practicas:

- backups automaticos diarios en prod
- backups antes de migraciones grandes
- probar restauraciones (no solo hacer backup)
- proteger backups con cifrado y permisos

## Estrategia recomendada para tu caso

1. Definir migraciones (si ya hay, solo usarlas)
2. Crear script de seed local con datos ficticios
3. Mantener `.env` separado por ambiente
4. Validar en staging antes de prod

## Opciones de herramientas comunes (para estudio)

- **ORM/migraciones**: Prisma, Drizzle, TypeORM, Sequelize, Knex
- **DB local**: Docker, servicio local instalado, o DB embebida (SQLite)
- **Generacion de datos**: Faker, scripts propios, dumps anonimizados

## Ejemplo de flujo con cambios en schema

1. Crear migracion `2026_01_21_add_table_x`
2. Ejecutar en local
3. Actualizar seed si aplica
4. Ejecutar tests
5. Deploy a staging y ejecutar migracion
6. Validar, luego deploy a prod

## Errores comunes que causan problemas de deploy

- cambio de schema sin migraciones
- seeds inconsistentes con el schema
- usar la misma DB para local y prod
- variables de entorno mezcladas
- migraciones que rompen datos existentes
