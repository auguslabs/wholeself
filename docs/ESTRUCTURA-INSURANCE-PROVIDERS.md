# Estructura: Insurance Providers (proveedores de seguro)

Este documento describe **cómo está montado** todo lo relacionado con los **insurance providers** en el proyecto: la tabla dedicada en la base de datos, el bloque de insurance en la página Rates, la API y los componentes del front. Sirve como referencia única para leer, editar y ampliar la lista de aseguradoras.

---

## 1. Resumen: dónde viven los insurance providers

Los proveedores de seguro (Aetna, Blue Cross Blue Shield, Medicare, etc.) se muestran en la **página Rates** (Tarifas): en una card con un botón “View All Insurance Providers” que abre un modal con la lista completa y, si existe, el logo de cada uno.

Hay **dos orígenes** posibles para esa lista:

| Origen | Descripción |
|--------|-------------|
| **Tabla dedicada `insurance_provider`** | Una fila por proveedor: nombre (en/es), URL del logo, orden. La **API** (GET rates) y el **contentDbService** (build con BD) leen esta tabla y arman `content.insurance.providerList` desde aquí. Inserción y edición con SQL (INSERT/UPDATE/DELETE). Migración **025**. |
| **JSON en `page_rates.insurance_json`** | Ya **no** guarda la lista de proveedores (`providerList` se deja vacío al guardar). Solo contiene título, descripción, `providers` (textos de la card) y `modal`. |

El **resto** del bloque “Insurance” (título, descripción, textos tipo “Out of Network”, modal) **sigue en** `page_rates.insurance_json`.

---

## 2. Tabla dedicada: `insurance_provider` (migración 025)

Para simplificar la gestión (la lista se actualiza con frecuencia), los proveedores tienen una **tabla aparte**. Cada fila es un proveedor.

### 2.1 Definición de la tabla

| Columna | Tipo | Descripción |
|---------|------|-------------|
| **id** | INT, PK, AUTO_INCREMENT | Identificador único. |
| **name_en** | VARCHAR(255), NOT NULL | Nombre del proveedor en inglés. UNIQUE para evitar duplicados. |
| **name_es** | VARCHAR(255), NOT NULL | Nombre en español (puede ser igual a name_en). |
| **logo_url** | VARCHAR(500), DEFAULT '' | URL del logo (relativa o absoluta). **Si está vacío**, el front muestra solo el nombre o intenta el path por defecto `/uploads/insurance/<slug>.(svg o png)`. |
| **display_order** | INT, NOT NULL, DEFAULT 0 | Orden de aparición en la lista (menor número = primero). |
| **created_at** | DATETIME | Fecha de creación. |
| **updated_at** | DATETIME | Última actualización. |

- **Índice:** `display_order`, `name_en` para ordenar la lista.
- **Migración:** `scripts/migrations/025_create_insurance_providers.sql` (crea la tabla e inserta los 13 proveedores actuales con `logo_url` vacío).

### 2.2 Cómo ejecutar la migración en el servidor

1. Abre la misma base de datos que usa `public/api/content.php` (phpMyAdmin o CLI).
2. Copia y ejecuta todo el contenido de `scripts/migrations/025_create_insurance_providers.sql`.

Con eso la tabla queda creada y con los 13 proveedores ya insertados.

### 2.3 Consultas útiles (lectura y escritura)

- **Listar todos (orden de aparición):**  
  `SELECT id, name_en, name_es, logo_url, display_order FROM insurance_provider ORDER BY display_order ASC, name_en ASC;`

- **Añadir un proveedor:**  
  `INSERT INTO insurance_provider (name_en, name_es, logo_url, display_order) VALUES ('Nombre en inglés', 'Nombre en español', '', 14);`

- **Asignar o cambiar el logo:**  
  `UPDATE insurance_provider SET logo_url = '/uploads/insurance/mi-logo.png' WHERE id = 1;`  
  (o `WHERE name_en = 'Aetna'` si prefieres por nombre.)

- **Cambiar el orden:**  
  `UPDATE insurance_provider SET display_order = 5 WHERE id = 3;`

- **Eliminar un proveedor:**  
  `DELETE FROM insurance_provider WHERE id = 99;`

La API (`content.php` GET rates) y el contentDbService (build con BD) leen esta tabla y construyen `content.insurance.providerList` con el formato que el front espera: `{ name: { en, es }, logoUrl }[]`. El front no requiere cambios.

---

## 3. Bloque “Insurance” en la página Rates

La página Rates usa un bloque `content.insurance` que tiene **dos partes**:

| Parte | Origen actual | Descripción |
|-------|----------------|-------------|
| **Lista de aseguradoras (providerList)** | Tabla `insurance_provider` (cuando la API la use) o `insurance_json.providerList` (legacy) | Nombres y logos; se muestran en la card y en el modal “View All Insurance Providers”. |
| **Resto** (título, descripción, textos de la card, modal) | Siempre `page_rates.insurance_json` | `title`, `description`, `providers` (label+text de la card), `modal` (título, descripción, outOfNetworkInfo, note, cta). |

### 3.1 Estructura del JSON en BD (`insurance_json`)

Cada locale (`en` / `es`) tiene su propia fila en `page_rates` con su `insurance_json`. La API fusiona ambas para devolver un solo objeto con `{ en, es }` por campo.

Formato del JSON (por locale) para todo **menos** la lista de proveedores (que puede venir de la tabla):

```json
{
  "title": "Insurance We Accept",
  "description": "We accept the following insurance plans...",
  "providerList": [],
  "providers": [
    { "label": "Out of Network", "text": "We can provide superbills..." }
  ],
  "modal": {
    "title": "Accepted Insurance Providers",
    "description": "Full list of accepted insurance providers.",
    "outOfNetworkInfo": "If your insurance is not listed...",
    "note": "Coverage may vary.",
    "cta": { "text": "Close", "href": "#" }
  }
}
```

- **providerList:** si la API lee desde la tabla, aquí puede quedar vacío o ignorarse; el GET rellenará `providerList` desde `insurance_provider`.
- **providers:** ítems “label + text” que se muestran **en la card** (no son la lista de aseguradoras).
- **modal:** textos del modal (título, descripción, out of network, nota, CTA).

---

## 4. Qué devuelve la API (`content.insurance`)

Al hacer **GET** `pageId=rates`, la API devuelve (y el front espera) algo de esta forma:

```ts
content.insurance = {
  title: { en: string, es: string },
  description: { en: string, es: string },
  providerList: [
    { name: { en: string, es: string }, logoUrl: string }
  ],
  providers: [
    { label: { en: string, es: string }, text: { en: string, es: string } }
  ],
  modal: {
    title: { en, es },
    description: { en, es },
    outOfNetworkInfo: { en, es },
    note: { en, es },
    cta: { text: { en, es }, href: { en, es } }
  }
}
```

- **providerList** → lista de aseguradoras (nombres y logos); puede construirse desde la tabla `insurance_provider` (migración 025) o desde el JSON.
- **providers** → textos de la card (p. ej. “Out of Network”, “We can provide superbills…”).
- **modal** → textos del modal.

Archivos que construyen esta estructura:
- **API:** `public/api/content.php` (GET/PUT rates).
- **Build con BD:** `src/data/services/contentDbService.server.ts` (rates).

---

## 5. Componentes en el front

| Componente | Archivo | Qué hace |
|------------|---------|----------|
| **RatesContentFromApi** | `src/components/rates/RatesContentFromApi.tsx` | Carga el contenido de Rates desde la API y renderiza la sección de seguros. Pasa `insurance.providerList` y `insurance.modal` a la card y al modal. |
| **InsuranceCardWithModal** | `src/components/rates/InsuranceCardWithModal.tsx` | Card “Insurance”: título, descripción, **items** (`insurance.providers`) y botón “View All Insurance Providers” que abre el modal. Recibe **providerList** y **modal**. |
| **InsuranceModal** | `src/components/rates/InsuranceModal.tsx` | Modal con la lista completa de aseguradoras (orden alfabético). Muestra logo (por `logoUrl` o por path por nombre) o solo el nombre si no hay logo. |

Flujo: `content.insurance` → **RatesContentFromApi** → **InsuranceCardWithModal**(providerList, modal, items) → **InsuranceModal**(providers=providerList, textos del modal).

---

## 6. Logos de aseguradoras

- **Si el ítem tiene `logoUrl`** (y no está vacío): se usa esa URL (p. ej. `/uploads/insurance/logo.svg`). En la tabla dedicada eso es la columna `logo_url`.
- **Si no hay `logoUrl`:** el front (en `InsuranceModal.tsx`) usa un **path por nombre**: `/uploads/insurance/<nombre-normalizado>.(svg|png)`, con un mapeo para nombres compuestos (p. ej. “Blue Cross Blue Shield” → `blue-cross-blue-shield`). Primero intenta SVG; si falla, PNG. Si no hay imagen, se muestra solo el nombre.

Los archivos de logos están en **`public/uploads/insurance/`** (y se copian a `dist/uploads/insurance/` en build).

---

## 7. Resumen rápido

| Pregunta | Respuesta |
|----------|-----------|
| ¿Dónde se guardan los insurance providers? | En la **tabla `insurance_provider`** (migración 025). Opcionalmente también en `page_rates.insurance_json` (campo `providerList`) hasta que la API lea solo de la tabla. |
| ¿Cómo se editan? | Con SQL: **INSERT** (nuevo), **UPDATE** (cambiar nombre o logo o orden), **DELETE** (quitar). Cuando la API lea la tabla, no hace falta tocar el JSON para la lista. |
| ¿Qué es providerList vs providers? | **providerList** = lista de aseguradoras (nombres + logos). **providers** = ítems de texto de la card (p. ej. “Out of Network” + descripción); siguen en `insurance_json`. |
| ¿Dónde se muestran? | En la página **Rates**: card de seguros (**InsuranceCardWithModal**) y modal “View All Insurance Providers” (**InsuranceModal**). |
| ¿De dónde salen los logos? | De la columna **logo_url** en `insurance_provider` (o de `logoUrl` en el JSON). Si está vacío, el front usa el path por nombre en `/uploads/insurance/<slug>.(svg|png)` o muestra solo el nombre. |

La API y el contentDbService ya leen la tabla `insurance_provider` y arman `providerList` desde ahí. La estructura de `content.insurance` se mantiene; el front no requiere cambios.
