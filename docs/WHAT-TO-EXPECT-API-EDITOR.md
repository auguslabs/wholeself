# What to Expect — API y mensaje para el editor

Después de migrar la página What to Expect a la tabla **`page_what_to_expect`** y de validar que todo funcione (sitio + API), puedes enviar al editor el mensaje siguiente.

---

## Mensaje para el editor

> La página **What to Expect** (Qué esperar) ya está conectada a la base de datos. El contenido (título y subtítulo del hero, texto de introducción, secciones del timeline y CTAs) se lee desde la API y se puede editar desde el panel cuando esté disponible.
>
> **API de lectura (JSON):**  
> **GET** `https://www.ajamoment.com/api/content/what-to-expect`  
> (Reemplaza el dominio por el que uses en producción: por ejemplo `https://www.wholeselfnm.com` si aplica.)
>
> Ahí puedes ver el JSON completo que consume la web: `meta`, `seo` y `content` (hero, intro, sections, ctaSection). Comprueba que la respuesta sea correcta antes de editar en el panel.

---

## URL del JSON (por entorno)

| Entorno   | URL |
|-----------|-----|
| Producción (ajamoment.com) | `https://www.ajamoment.com/api/content/what-to-expect` |
| Producción (wholeselfnm.com) | `https://www.wholeselfnm.com/api/content/what-to-expect` |
| Local | `http://localhost:4321/api/content/what-to-expect` (o el puerto que uses) |

---

## Checklist antes de dar el mensaje al editor

1. Ejecutar en el servidor: **`scripts/migrations/014_create_page_what_to_expect.sql`** (crear tabla + datos mínimos).
2. Subir **`public/api/content.php`** actualizado (GET y PUT para `what-to-expect`).
3. Abrir en el navegador la URL del JSON (ej. `https://www.ajamoment.com/api/content/what-to-expect`) y comprobar que devuelve `meta`, `seo` y `content` con `hero`, `intro`, `sections`, `ctaSection`.
4. Visitar la página What to Expect en el sitio y comprobar que se muestra el contenido (aunque sea el mínimo).
5. Si tienes contenido actual en `page_content` (blob), extraer el objeto `what-to-expect` del export y ejecutar un UPDATE/seed en `page_what_to_expect` para cargar ese contenido; luego repetir los pasos 3 y 4.

Cuando todo esté validado, envía el mensaje de arriba al editor con la URL que corresponda a tu entorno.
