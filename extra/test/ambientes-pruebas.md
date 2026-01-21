# Ambientes de prueba: conceptos y mejores practicas

## Por que existen varios ambientes

Separar ambientes reduce riesgos. La idea es validar cambios con datos reales
o representativos sin afectar produccion, y con controles mas permisivos que
permiten diagnosticar errores.

Los ambientes tipicos son:

- **Local (dev)**: cada persona ejecuta la app en su maquina. Se usa para
  desarrollar rapido, con datos de prueba y servicios mockeados si hace falta.
- **Test / QA**: se valida el comportamiento funcional y se ejecutan pruebas
  automaticas y manuales. Puede usar datos de prueba o un espejo sanitizado.
- **Staging / Preprod**: replica casi exacta de produccion. Sirve para
  validaciones finales, performance y smoke tests.
- **Produccion**: usuarios reales. Debe ser estable, segura y monitoreada.

## Principios profesionales que se aplican en la industria

- **Paridad con produccion**: staging debe parecerse a produccion (versiones,
  variables de entorno, configuracion, infraestructura).
- **Configuracion por ambiente**: nunca hardcodear secretos o endpoints en el
  codigo. Se usa `.env` o secret manager.
- **Infraestructura como codigo**: configuraciones repetibles (infra/hosting).
- **Aislamiento de datos**: prod no se toca para probar. Datos sensibles se
  anonimizan si se copian.
- **Reproducibilidad**: cualquiera puede levantar el entorno con pasos claros.
- **Observabilidad**: logs, errores, trazas y alertas por ambiente.
- **Seguridad por defecto**: minimo acceso necesario (principio de menor
  privilegio) y rotacion de secretos.

## Cuadro comparativo rapido

| Ambiente | Objetivo principal | Datos | Riesgo |
| --- | --- | --- | --- |
| Local | desarrollo rapido | mock / seed | bajo |
| Test/QA | validar funcionalidad | prueba / sanitizado | bajo |
| Staging | validacion final | copia sanitizada | medio |
| Prod | servir usuarios | real | alto |

## Configuracion por ambiente

Buenas practicas:

- `.env.local`, `.env.test`, `.env.staging`, `.env.production`
- Variables separadas para API, DB, keys, analytics, flags
- Nunca subir `.env` con secretos al repositorio
- Usar una carpeta `config/` solo si el framework lo requiere
- Crear un archivo `.env.example` con nombres de variables
- Validar variables obligatorias al iniciar la app

Ejemplo generico:

- `DATABASE_URL` cambia por ambiente
- `PUBLIC_BASE_URL` cambia por ambiente
- `FEATURE_FLAG_X` activa o desactiva funcionalidades nuevas

## Politica de cambios en configuracion

En equipos profesionales, la configuracion critica se modifica:

1. En una rama separada
2. Con revisiones (pull request)
3. Con pruebas automaticas
4. Con deploy a staging
5. Con aprobacion

Esto evita el problema de cambios locales que rompen el deploy.

## Señales de que un ambiente no esta bien configurado

- El deploy falla en staging pero funciona en local
- Variables de entorno faltantes en el proveedor
- Diferencias de versiones (Node, DB, dependencias)
- Logs insuficientes para diagnosticar errores

## Recomendaciones adicionales para estudio

- Usar un "ambiente espejo" para staging
- Separar cuentas y permisos por ambiente
- Mantener documentados los pasos de levantamiento local

## Como manejar la duda de "lo local vs lo real"

Tu intuicion es correcta: necesitas datos locales con la misma estructura
que prod. Pero no necesitas copiar datos reales. Lo ideal es:

- usar migraciones para crear el esquema
- generar datos ficticios (seed)
- tener scripts para resetear la base de datos local

Esto garantiza consistencia y evita riesgos legales.
