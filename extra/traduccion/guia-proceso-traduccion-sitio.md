# Guia de proceso de traduccion del sitio

## Objetivo
Definir una estrategia clara y escalable para traducir el sitio basado en Astro + React + TailwindCSS, usando contenido en JSON hoy y migracion a base de datos mas adelante.

## Resumen de la mejor ruta (recomendada)
1. Separar contenido por idioma desde el inicio.
2. Usar rutas por idioma (i18n routing) en Astro.
3. Mantener strings de UI (labels, botones) en un diccionario por idioma.
4. Preparar la misma estructura de datos para JSON y para DB futura.

Esta ruta evita retrabajo, mantiene consistencia y permite escalado a N idiomas.

## Conceptos base
- **Contenido**: textos largos, secciones, cards, etc. (hoy JSON, manana DB).
- **UI strings**: textos cortos de interfaz (botones, labels, menu).
- **Routing i18n**: URLs por idioma, ejemplo `/es/` y `/en/`.

## Estructura sugerida de contenido (JSON)
Opcion A (por carpeta de idioma):
```
src/data/content/es/pages/home.json
src/data/content/en/pages/home.json
```

Opcion B (por sufijo de idioma):
```
src/data/content/pages/home.es.json
src/data/content/pages/home.en.json
```

Elegir una opcion y mantenerla igual en todo el proyecto.

## Estructura sugerida para UI strings
```
src/i18n/es.json
src/i18n/en.json
```

## Rutas i18n en Astro
Configurar idiomas en `astro.config.mjs` para generar rutas por idioma.
Ejemplo conceptual:
- Idiomas: `es`, `en`
- Default: `es`
- URLs: `/` -> es, `/en/` -> en

## Flujo ideal de traduccion (paso a paso)
1. **Definir idiomas**: lista oficial de idiomas soportados.
2. **Definir estructura base**: JSON de contenido en idioma base (es).
3. **Duplicar estructura**: copiar archivos y reemplazar textos.
4. **Traducir UI strings**: llenar `src/i18n/*.json`.
5. **Cargar por idioma**: en paginas Astro, cargar el JSON segun el idioma.
6. **Revisar visualmente**: layout, saltos de linea, textos largos.
7. **Control de calidad**: ortografia, coherencia, tono de marca.

## Como cargar contenido por idioma (concepto)
En cada pagina:
- Leer el idioma desde la ruta.
- Cargar el JSON correspondiente.
- Pasar el contenido a los componentes.

Si la pagina ya consume JSON, solo hay que cambiar la fuente segun el idioma.

## Manejo de fallback
Si falta un texto en un idioma:
- Fallback al idioma base (es).
- Registrar el faltante para completar luego.

## Preparar la futura migracion a base de datos
Mantener el mismo esquema de datos:
- `locale` (es/en)
- `page` (home/about/...)
- `content` (estructura igual al JSON)

Cuando migremos a DB:
1. Se reemplaza el lector de JSON por un loader desde DB.
2. No se cambian los componentes ni el esquema.

## Herramientas posibles (solo si se requiere)
No es obligatorio usar librerias, pero si se necesita:
- **i18next** (React): manejo de UI strings.
- **astro-i18next** o i18n routing nativo: rutas por idioma.

Para el contenido JSON, una estrategia simple y propia funciona muy bien.

## Checklist rapido antes de traducir
- [ ] Idiomas definidos
- [ ] Estructura de contenido estable
- [ ] UI strings separadas
- [ ] Routing i18n configurado
- [ ] Fallback definido

## Recomendacion final
Mantener la logica de traduccion **simple y predecible**:
- JSON por idioma
- Rutas por idioma
- UI strings separadas
- Schema igual para la futura DB

Este enfoque es el mas viable hoy y evita problemas en la migracion posterior.
