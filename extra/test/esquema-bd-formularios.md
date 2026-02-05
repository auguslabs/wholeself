# Esquema de base de datos: formularios (Fase 1)

**Objetivo**: Definir las tablas para almacenar los envíos de los 4 formularios de contacto del sitio. Una tabla por tipo de formulario.

**Base de datos**: `wholeself_forms` (o el nombre que se cree en Bluehost).

---

## Tablas

### 1. `form_contact` — Contacto general

Formulario: `contact.astro` → componente `ContactForm.tsx` (nombre, email, comentario).

| Columna     | Tipo         | Restricción | Descripción                    |
|------------|--------------|-------------|--------------------------------|
| id         | INT          | PK, AUTO_INCREMENT | Identificador único       |
| name       | VARCHAR(255) | NOT NULL    | Nombre                         |
| email      | VARCHAR(255) | NOT NULL    | Correo electrónico             |
| comment    | TEXT         | NOT NULL    | Comentario / mensaje           |
| language   | CHAR(2)      | NULL        | `en` o `es`                    |
| created_at | DATETIME     | DEFAULT CURRENT_TIMESTAMP | Fecha de envío   |

---

### 2. `form_referral` — Referidos (referral)

Formulario: `contact/referral.astro`. Datos del referidor y del cliente.

| Columna             | Tipo         | Restricción | Descripción                    |
|--------------------|--------------|-------------|--------------------------------|
| id                 | INT          | PK, AUTO_INCREMENT | Identificador único       |
| name_credentials   | VARCHAR(255) | NOT NULL    | Nombre y credenciales del referidor |
| organization       | VARCHAR(255) | NULL        | Organización / práctica        |
| phone              | VARCHAR(50)  | NULL        | Teléfono del referidor         |
| email              | VARCHAR(255) | NULL        | Email del referidor            |
| client_name        | VARCHAR(255) | NULL        | Nombre del cliente             |
| client_dob         | DATE         | NULL        | Fecha de nacimiento del cliente |
| client_contact     | VARCHAR(255) | NULL        | Contacto del cliente           |
| referral_reason    | TEXT         | NOT NULL    | Motivo de la referencia        |
| preferred_therapist | TEXT         | NULL        | Terapeuta o especialización preferida |
| insurance          | VARCHAR(255) | NULL        | Información del seguro        |
| additional_notes   | TEXT         | NULL        | Notas adicionales              |
| language           | CHAR(2)      | NULL        | `en` o `es`                   |
| created_at         | DATETIME     | DEFAULT CURRENT_TIMESTAMP | Fecha de envío   |

---

### 3. `form_i_need_help` — Necesito ayuda (I need help)

Formulario: `contact/i-need-help.astro`. Personas que buscan ayuda para sí mismas.

| Columna           | Tipo         | Restricción | Descripción                    |
|------------------|--------------|-------------|--------------------------------|
| id               | INT          | PK, AUTO_INCREMENT | Identificador único       |
| name             | VARCHAR(255) | NOT NULL    | Nombre                         |
| contact_method   | VARCHAR(50)  | NULL        | phone, email, text             |
| phone            | VARCHAR(50)  | NULL        | Teléfono                       |
| email            | VARCHAR(255) | NULL        | Correo electrónico             |
| best_time        | VARCHAR(50)  | NULL        | morning, afternoon, evening, flexible |
| message          | TEXT         | NULL        | Mensaje breve                  |
| insurance        | VARCHAR(255) | NULL        | Información del seguro        |
| preferred_therapist | VARCHAR(255) | NULL     | Terapeuta preferido            |
| hear_about       | VARCHAR(50)  | NULL        | search, referral, provider, social-media, other |
| language         | CHAR(2)      | NULL        | `en` o `es`                   |
| created_at       | DATETIME     | DEFAULT CURRENT_TIMESTAMP | Fecha de envío   |

---

### 4. `form_loved_one` — Mi ser querido necesita ayuda

Formulario: `contact/loved-one-needs-help.astro`. Familiares/amigos pidiendo ayuda para otra persona.

| Columna        | Tipo         | Restricción | Descripción                    |
|---------------|--------------|-------------|--------------------------------|
| id            | INT          | PK, AUTO_INCREMENT | Identificador único       |
| your_name     | VARCHAR(255) | NOT NULL    | Nombre de quien envía          |
| relationship  | VARCHAR(50)  | NULL        | spouse, parent, child, sibling, friend, other |
| phone         | VARCHAR(50)  | NULL        | Teléfono                       |
| email         | VARCHAR(255) | NULL        | Correo electrónico             |
| contact_method| VARCHAR(50)  | NULL        | phone, email, text             |
| situation     | TEXT         | NULL        | Descripción de la situación    |
| questions     | TEXT         | NULL        | Preguntas o inquietudes        |
| how_help      | TEXT         | NULL        | Cómo podemos ayudar            |
| language      | CHAR(2)      | NULL        | `en` o `es`                   |
| created_at    | DATETIME     | DEFAULT CURRENT_TIMESTAMP | Fecha de envío   |

---

## Mapeo frontend → base de datos

Los formularios envían nombres en **camelCase** (ej. `nameCredentials`, `clientName`). La API debe convertir a **snake_case** para guardar (ej. `name_credentials`, `client_name`). Las migraciones ya usan snake_case en las columnas.

---

## Referencia

- Plan: [plan-migracion-bluehost-formularios.md](plan-migracion-bluehost-formularios.md)
- Migraciones SQL: `scripts/migrations/001_create_form_tables.sql`
