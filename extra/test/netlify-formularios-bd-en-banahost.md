# Netlify + formularios que guardan en BanaHost (evitar 404)

Cuando el **sitio** se despliega en **Netlify** (desde GitHub) pero la **base de datos y los scripts PHP** están en **BanaHost**, el formulario puede dar **404**. Esto se corrige configurando en Netlify la URL donde están los PHP.

---

## Por qué sale 404

- En Netlify se construye el sitio con `npm run build`.
- Los formularios envían los datos a una URL que se arma con la variable **`PUBLIC_API_BASE`**.
- Si **`PUBLIC_API_BASE`** no está definida en Netlify, el código usa la ruta relativa `/api/forms/contact` (etc.), y el navegador envía la petición **al mismo origen** (Netlify).
- En Netlify **no existen** esas rutas (los PHP están en BanaHost), así que Netlify responde **404**.

Conclusión: hay que decirle al build que la “API” (los PHP) está en la URL de BanaHost.

---

## Qué hacer: definir PUBLIC_API_BASE en Netlify

1. Entra en **Netlify** → tu sitio → **Site configuration** (o **Site settings**) → **Environment variables**.
2. **Add a variable** (o **Add environment variable** / **New variable**):
   - **Key:** `PUBLIC_API_BASE`
   - **Value:** La URL del sitio en **BanaHost** donde están los PHP, **sin barra final**.
     - Ejemplo si el sitio y los PHP están en BanaHost en `https://www.ajamoment.com`:  
       `https://www.ajamoment.com`
     - Ejemplo si usas un subdominio para la API: la URL base donde realmente responden los PHP (ej. `https://api.tudominio.com` o la misma raíz donde tienes `/api/forms/`).
3. **Save**.
4. **Trigger a new deploy**: en Netlify, pestaña **Deploys** → **Trigger deploy** → **Deploy site** (o haz un push a GitHub para que se despliegue solo).

En el siguiente build, el front ya llevará esa base y los formularios enviarán a BanaHost.

---

## Comprobar el valor en el build

- Las variables `PUBLIC_*` en Netlify se inyectan en el build como `import.meta.env.PUBLIC_API_BASE`.
- Los formularios construyen la URL así:  
  `{PUBLIC_API_BASE}/api/forms/contact.php` (y los otros .php).
- Por tanto en BanaHost debe existir:
  - `https://tu-dominio-banahost.com/api/forms/contact.php`
  - y el resto de scripts (referral.php, i-need-help.php, loved-one-needs-help.php).

Si ya probaste subiendo todo por FTP a BanaHost y los formularios guardan bien, solo falta que **esa misma URL** sea la que pongas en `PUBLIC_API_BASE` (mismo dominio y mismo camino `/api/forms/`).

---

## Resumen

| Dónde | Qué |
|-------|-----|
| **Netlify** | Variable de entorno: `PUBLIC_API_BASE` = URL de BanaHost (sin `/` al final). Luego **nuevo deploy**. |
| **BanaHost** | PHP en `/api/forms/*.php` y `db_config.php` con la BD; ya lo tienes si los formularios funcionan por FTP. |

Así, el sitio en Netlify sigue sirviendo el HTML/JS/CSS, pero al enviar un formulario el navegador hace la petición a BanaHost y los datos se guardan en tu MySQL de BanaHost. Cuando pases a producción en Bluehost, cambiarás `PUBLIC_API_BASE` a la URL de Bluehost (donde estarán los PHP y la BD).
