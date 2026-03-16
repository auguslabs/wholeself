# Configurar Resend para wholeselfnm.com

**Resend recomienda usar un subdominio para enviar correo** (no el dominio raíz). Así sigues sus reglas, no tocas los DNS del sitio principal y reduces riesgo con el correo entrante.

Esta guía sigue esa recomendación y usa el subdominio **contact.wholeselfnm.com**. Hay pasos específicos para **Banahosting** y para **Bluehost**.

---

## Pasos recomendados por Resend: subdominio contact.wholeselfnm.com

### Paso 1: Añadir el dominio en Resend

1. Entra a [resend.com](https://resend.com) → **Domains** → **Add Domain**.
2. Escribe: **`contact.wholeselfnm.com`** (todo en minúsculas).
3. Guarda. Resend te mostrará **3 registros DNS** con valores concretos. Déjalos abiertos o anótalos para el paso 3 (Zone Editor).

---

### Paso 2: Crear el subdominio y DNS según tu proveedor

Elige **Banahosting** o **Bluehost** según donde esté alojado wholeselfnm.com.

---

#### En Banahosting (cPanel)

**Crear el subdominio**

1. Entra a [Banahosting](https://manage.banahosting.com) e inicia sesión.
2. Abre **cPanel** de la cuenta donde está **wholeselfnm.com**.
3. En **Dominios** → **Subdominios** (o **Domains** → **Subdomains**).
4. En **Subdominio** escribe: **`contact`** (el dominio base ya será wholeselfnm.com).
5. **Raíz del documento**: puedes usar una carpeta como `contact` o compartir con `public_html`; para Resend solo importan los DNS.
6. **Crear** / **Submit**.

**Añadir los 3 registros DNS (Resend)**

1. En cPanel → **Dominios** → **Editor de zona** (Zone Editor).
2. Selecciona la zona de **wholeselfnm.com** → **Manage** (o el enlace a la zona).
3. Busca la sección **Añadir registro DNS** (Add DNS Record).

Añade estos 3 registros (usa los **valores exactos** que te da Resend):

| Tipo   | Nombre / Host              | Valor / Apunta a |
|--------|-----------------------------|-------------------|
| **TXT**  | `contact`                   | `v=spf1 include:_spf.resend.com ~all` (o el que muestre Resend) |
| **CNAME**| `resend._domainkey.contact` | Valor que te da Resend (ej. `resend._domainkey.resend.com`) |
| **TXT**  | `_resend.contact`           | `resend-verification=xxxx` (código de Resend) |

- Si el panel pide solo la parte antes del dominio, usa: `contact`, `resend._domainkey.contact`, `_resend.contact`.
- **TTL**: 14400 o el que venga por defecto.

---

#### En Bluehost (cPanel)

**Crear el subdominio (opcional)**  
En Bluehost no hay un menú que diga "Subdomains". Se hace así:

1. **Domains** (icono del globo) → **Domains** (primera opción, "List Domains").
2. Arriba a la derecha pulsa el botón azul **"Create A New Domain"**.
3. En el formulario, en **Domain** escribe: **`contact.wholeselfnm.com`** (o solo **`contact`** si el panel completa con `wholeselfnm.com`).
4. Si te pide "Document root", puedes usar una carpeta como `contact` o compartir con `public_html`; para Resend solo importan los DNS.
5. **Submit** / **Create**.

Para solo enviar email con Resend no es obligatorio crear el subdominio; basta con añadir los 3 registros DNS en el Zone Editor.

**Añadir los 3 registros DNS (Resend)**  
**Domains** → **Zone Editor** → en la lista, localiza **wholeselfnm.com** → **Manage** → **Add DNS Record**. Ahí añades los 3 registros (TXT, CNAME, TXT) que te da Resend.

Los registros que Resend te da son para **contact.wholeselfnm.com**. En Bluehost se añaden sobre la zona del dominio principal **wholeselfnm.com**.

1. En **cPanel** → **Domains** → **Zone Editor**.
2. En la lista de dominios, localiza **wholeselfnm.com** y haz clic en **Manage** (o el enlace a la zona).
3. Baja hasta **Add DNS Record** (o “Add a Record”).

Añade **estos 3 registros** usando los **valores exactos** que te muestra Resend (los nombres pueden variar un poco según cómo Resend los muestre):

#### Registro 1 – SPF (TXT)

- **Type:** TXT  
- **Host / Name:** `contact`  
  - (En algunos paneles se escribe solo `contact`; Bluehost suele añadir solo `.wholeselfnm.com`.)
- **Value / Record:** el que te da Resend, normalmente:  
  `v=spf1 include:_spf.resend.com ~all`  
- **TTL:** 14400 o el que venga por defecto.  
- **Add Record**.

#### Registro 2 – DKIM (CNAME)

- **Type:** CNAME  
- **Host / Name:** el que te da Resend, algo como **`resend._domainkey.contact`**  
  - (Representa `resend._domainkey.contact.wholeselfnm.com`.)
- **Value / Points to:** el que te da Resend, algo como `resend._domainkey.resend.com` (a veces con un punto al final).  
- **TTL:** 14400 o por defecto.  
- **Add Record**.

#### Registro 3 – Verificación (TXT)

- **Type:** TXT  
- **Host / Name:** **`_resend.contact`**  
  - (Representa `_resend.contact.wholeselfnm.com`.)
- **Value / Record:** el valor completo que te da Resend, tipo **`resend-verification=xxxxxxxx`**.  
- **TTL:** 14400 o por defecto.  
- **Add Record**.

Si en Bluehost el campo “Host” pide solo la parte previa al dominio (ej. “contact”), usa:

- SPF: Host = `contact`, TXT = `v=spf1 include:_spf.resend.com ~all`
- DKIM: Host = `resend._domainkey.contact`, Points to = (valor Resend)
- Verificación: Host = `_resend.contact`, TXT = `resend-verification=...`

---

### Paso 3: Verificar en Resend

1. Espera 5–30 minutos (a veces hasta 48 h).
2. En Resend → **Domains** → **contact.wholeselfnm.com** → **Verify** (o “Check DNS”).
3. Cuando el estado pase a **Verified**, ya puedes enviar desde direcciones de ese subdominio.

---

### Paso 4: Usar el correo en tu sitio

En el servidor, en **`api/forms/db_config.php`**:

```php
define('NOTIFY_FROM_RESEND', 'noreply@contact.wholeselfnm.com');
```

O, si prefieres que el remitente sea “contact”:

```php
define('NOTIFY_FROM_RESEND', 'contact@contact.wholeselfnm.com');
```

Sube el archivo al servidor si lo editaste en local. Los envíos del formulario saldrán desde esa dirección.

---

## Mientras tanto: enviar con remitente de prueba

Hasta que **contact.wholeselfnm.com** esté verificado, puedes enviar ya con el remitente de prueba de Resend:

1. En el servidor, en **`api/forms/db_config.php`**:
   ```php
   define('RESEND_API_KEY', 're_xxxx...');  // Tu API Key de Resend
   define('NOTIFY_FROM_RESEND', 'onboarding@resend.dev');
   ```
2. Los correos llegarán a NOTIFY_EMAIL_1 y NOTIFY_EMAIL_2. Cuando el **subdominio** esté verificado, cambia a `noreply@contact.wholeselfnm.com` (paso 5 arriba).

---

## Alternativa (no recomendada por Resend): dominio raíz wholeselfnm.com

Si en algún momento quisieras usar el dominio raíz en lugar del subdominio:

### En Resend

1. Entra a [resend.com](https://resend.com) → **Domains**.
2. **Add Domain** → escribe `wholeselfnm.com` (dominio raíz).
3. Resend te mostrará **3 registros DNS** que debes crear. Anota:
   - **SPF** (TXT en la raíz del dominio)
   - **DKIM** (CNAME: `resend._domainkey.wholeselfnm.com` → valor que te den)
   - **Verificación** (TXT: `_resend.wholeselfnm.com` con un valor tipo `resend-verification=...`)

### En tu proveedor DNS (Bluehost, etc.)

El dominio puede estar en Bluehost, Cloudflare, Namecheap, etc. Ahí debes **añadir** estos registros (Resend te da los valores exactos).

Ejemplo típico:

| Tipo | Nombre / Host | Valor |
|------|----------------|------|
| TXT  | `@` (o `wholeselfnm.com`) | `v=spf1 include:_spf.resend.com ~all` |
| CNAME | `resend._domainkey` | (el que te muestre Resend, ej. `resend._domainkey.resend.com`) |
| TXT  | `_resend` | `resend-verification=xxxx` (código que te da Resend) |

- **SPF**: en algunos paneles el “nombre” es `@` o se deja vacío para la raíz.
- **DKIM**: el “nombre” suele ser `resend._domainkey` (el panel puede añadir solo `.wholeselfnm.com`).
- **Verificación**: nombre `_resend`, valor exacto que te da Resend.

### Esperar y verificar

- Los DNS pueden tardar **unos minutos hasta 48 h** (suele ser 5–30 min).
- En Resend, en el dominio, usa **Verify** o “Check DNS”. Cuando pase, el estado dejará de decir “No iniciado” y quedará **Verified**.

### Usar el dominio en el sitio

En **`api/forms/db_config.php`** en el servidor:

```php
define('NOTIFY_FROM_RESEND', 'noreply@wholeselfnm.com');
```

Vuelve a subir el archivo si lo editaste en local. Los próximos envíos del formulario saldrán desde ese correo.

---

## Comprobar que Resend recibe las peticiones

- Revisa el **Error Log de PHP** en el servidor (cPanel → Errors). Busca líneas `[forms]` y `Resend`:
  - Si ves `Resend API error HTTP 403` o mensaje de “domain” / “from address”, suele ser dominio no verificado o remitente incorrecto → usa `onboarding@resend.dev` hasta verificar.
- En [resend.com](https://resend.com) → **Logs** / **Emails** puedes ver si el envío llegó a Resend y si fue entregado o falló.
