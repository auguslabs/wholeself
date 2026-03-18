# API para el editor: proveedores de seguro y miembros del equipo

Misma autenticación que `PATCH /api/content/*`: header **`X-API-Key`** (o `Authorization: Bearer …`) con el valor de `CONTENT_API_KEY` en `content_api_config.php`.

---

## 1) Proveedores de seguro (`insurance_provider`)

La página **Rates** lee la lista desde la tabla `insurance_provider` vía `GET /api/content/rates` → `content.insurance.providerList`.  
Si el editor **crea / edita / borra** con los endpoints de abajo, el sitio verá los cambios al **refrescar** la página Rates (o con el refetch en cliente que ya usas).

| Método | URL | Auth | Body / notas |
|--------|-----|------|----------------|
| **GET** | `/api/insurance-providers` | no | `{ "providers": [ { "id", "nameEn", "nameEs", "logoUrl", "displayOrder" }, ... ] }` |
| **GET** | `/api/insurance-providers/12` | no | Un proveedor por `id` numérico |
| **POST** | `/api/insurance-providers` | sí | `{ "nameEn": "...", "nameEs": "..." (opcional), "logoUrl": "/uploads/insurance/..." , "displayOrder": 99 (opcional) }` |
| **PATCH** | `/api/insurance-providers/12` | sí | Cualquier subconjunto: `nameEn`, `nameEs`, `logoUrl`, `displayOrder` |
| **DELETE** | `/api/insurance-providers/12` | sí | Elimina fila |

**Nota:** `name_en` es único en BD. Duplicado → 409.

**Alternativa:** Sigue siendo válido guardar la lista completa en **`PATCH /api/content/rates`** con `content.insurance.providerList` (el backend hace `DELETE` + `INSERT` en `insurance_provider`). El POST individual evita mandar toda la página Rates.

---

## 2) Miembros del equipo (`team_members`)

La página **Team** carga miembros con **`GET /api/team-members`**. Los textos del hero vienen de **`GET /api/content/team`** (`page_team`), no de esta API.

| Método | URL | Auth | Notas |
|--------|-----|------|--------|
| **GET** | `/api/team-members` | no | `{ "members": [ ... ] }` |
| **GET** | `/api/team-members/member-10` | no | También acepta solo número: `/api/team-members/10` → resuelve `member-10` |
| **POST** | `/api/team-members` | sí | Crea fila. Si no envías `id`, se asigna el siguiente `member-N`. Body camelCase como en PUT. |
| **PATCH** / **PUT** | `/api/team-members/member-10` | sí | Actualiza campos enviados |
| **DELETE** | `/api/team-members/member-10` | sí | Elimina miembro |

**POST mínimo de ejemplo:**

```json
{
  "firstName": "Jane",
  "lastName": "Doe",
  "photoFilename": "Jane-Doe",
  "role": "Therapist",
  "roleEs": "Terapeuta",
  "language": "english",
  "descriptionEn": "",
  "descriptionEs": ""
}
```

Tras crear/editar/borrar, el front que hace refetch a `/api/team-members` mostrará el listado actualizado.

---

## Archivos en servidor

- `public/api/insurance-providers.php`
- `public/api/team-members.php` (actualizado)
- `public/.htaccess` (reglas `insurance-providers`)
