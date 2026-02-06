# Plan: Notificaciones por correo al recibir un formulario

Objetivo: cuando alguien envía un formulario y el registro se guarda correctamente en la base de datos, enviar una notificación por correo electrónico a **dos direcciones** (equipo que monitorea y responde a usuarios).

---

## Contexto de despliegue

| Fase | Sitio | Base de datos | Backend formularios |
|------|--------|----------------|----------------------|
| **Ahora** | Netlify | Banahost | PHP en Banahost |
| **Objetivo final** | Bluehost | Bluehost | PHP en Bluehost |

Todo va a reposar en **Bluehost** (sitio + BD + PHP). Por tanto las notificaciones por correo se implementan en **PHP**: el mismo código sirve en Banahost hoy y en Bluehost después de la migración; solo cambia la configuración (correos, SMTP o API) en el servidor.

---

## 1. Cómo se hace en la industria

### Momento del envío

En la práctica se usa casi siempre **enviar el correo justo después de que el INSERT en la base de datos sea exitoso**, dentro del mismo flujo de la petición que recibe el formulario:

1. Validar datos del formulario.
2. **INSERT** en la base de datos.
3. Si el INSERT tiene éxito → **enviar correo(s) de notificación**.
4. Responder al cliente `{ ok: true }`.

Así el equipo recibe el aviso en segundos y no hace falta colas ni workers mientras el volumen sea bajo/medio.

**Alternativas** (más complejas, para alto volumen o muchos tipos de notificaciones):

- **Cola (queue)**: guardar un “evento” en una cola (Redis, SQS, etc.) y un worker envía el correo. Útil si no quieres que un fallo de email retrase o falle la respuesta al usuario.
- **Webhook / serverless**: un trigger (p. ej. al insertar en BD) que llama a un servicio que envía el email. Depende de que tu hosting/BD ofrezca triggers (en un VPS sí suele ser posible).

---

**Nota:** Un *webhook* es una URL que un sistema externo llama cuando ocurre un evento (p. ej. “nuevo registro en BD”); *serverless* es código que se ejecuta bajo demanda sin un servidor siempre encendido. En hosting compartido (Banahost, Bluehost) normalmente no hay triggers de base de datos ni funciones serverless propias, por eso esta opción no aplica a este proyecto. En un **VPS** (servidor virtual propio) sí se pueden configurar triggers, workers o funciones serverless si se desea.

---

Para tu caso (formularios de contacto/referidos, volumen no masivo), **enviar en el mismo request después del INSERT** es la opción estándar y suficiente.

### Quién envía el correo (opciones técnicas)

| Enfoque | Qué es | Pros | Contras |
|--------|--------|------|---------|
| **mail() de PHP** | Función nativa de PHP en el servidor (Banahost). | Sin dependencias, sin APIs externas. | A menudo va a spam; muchos hosts limitan o bloquean. Poco confiable. |
| **SMTP del propio hosting** | PHP (o Node) conectándose por SMTP al servidor de correo del mismo host (Banahost/cPanel). | Usa correo @tudominio.com, configuración en el panel. | Mismos límites y riesgo de spam que mail(); depende del host. |
| **SMTP externo (Gmail, Outlook, etc.)** | Enviar usando SMTP de Gmail/Google Workspace o Outlook con “contraseña de aplicación”. | Control total, correos que ya usas. | Hay que activar “app passwords” y exponer menos el correo personal. |
| **Servicio transaccional (Resend, SendGrid, Mailgun, etc.)** | API HTTP para enviar emails; ellos se encargan de entrega y reputación. | Alta entrega, métricas, plantillas, muy usado en producción. | Cuenta y a veces costo (muchos tienen tier gratuito generoso). |

**Recomendación profesional**: para “notificación interna” (aviso a 2 correos de tu equipo), suele bastar **SMTP del hosting** o **SMTP de un correo corporativo** (Google Workspace / Outlook). Si quieres máxima entrega y menos dolores de cabeza con spam, un **servicio transaccional** (p. ej. Resend o SendGrid) es la opción más robusta.

---

## 2. Opciones adaptadas a tu proyecto

**Decisión**: Backend en **PHP** (Banahost ahora, Bluehost después). Las notificaciones se implementan en **PHP**; el mismo código sirve en ambos hosts.

Flujo actual:

- **Front**: envía POST a la API (Netlify o Banahost según `PUBLIC_API_BASE`).
- **Backend**: si usas **Banahost** → scripts **PHP** (`contact.php`, `referral.php`, etc.) + MySQL en Banahost. Si usas **Netlify** → rutas **Astro/Node** (`/api/forms/contact`, etc.) + MySQL (por ejemplo en Banahost vía `DATABASE_URL`).

Para no duplicar lógica y mantener un solo lugar donde “pasa todo”, conviene que **el envío de email viva donde hoy se hace el INSERT**:

- Si en producción los formularios apuntan a **Banahost (PHP)** → implementar el correo en **PHP**.
- Si en producción los formularios apuntan a **Netlify (Astro)** → implementar el correo en los **endpoints Astro** (Node).

### Implementación en PHP (Banahost → Bluehost)

- Tras el `INSERT` exitoso en cada `*.php`, llamar a una función o script común que envíe el correo (por **mail()**, **SMTP con PHPMailer**, o **API de Resend/SendGrid**).
- Los dos correos de notificación pueden ser variables de entorno o constantes en `db_config.php` (o un `email_config.php`), por ejemplo:
  - `NOTIFY_EMAIL_1`
  - `NOTIFY_EMAIL_2`
- Ventaja: un solo código (PHP) para formularios + BD + email; fácil de probar en Banahost.

### Opción B: Todo en Netlify (Astro/Node)

- En cada `src/pages/api/forms/*.ts`, después del `conn.execute(...)` exitoso, llamar a un helper que envíe el correo (p. ej. con **Nodemailer** por SMTP o con **Resend** / **SendGrid** por API).
- Variables de entorno en Netlify: `NOTIFY_EMAIL_1`, `NOTIFY_EMAIL_2`, y las de SMTP o API key del servicio.
- Ventaja: todo en el mismo repo y despliegue; no tocas PHP.

### Opción C: Híbrido (mantener PHP en Banahost y añadir solo email ahí)

- Sigue igual: formularios → Banahost PHP → INSERT en MySQL.
- Añades en cada PHP, después del `$stmt->execute()` exitoso, el envío de correo (mail, SMTP o API).
- Es la opción más directa si **hoy** en producción ya usas `PUBLIC_API_BASE` apuntando a Banahost.

---

## 3. Qué necesitas definir

1. **Cómo quieres enviar el correo**  
   - Rápido y simple: **mail()** o **SMTP del hosting** (Banahost/cPanel).  
   - Más fiable y profesional: **Resend**, **SendGrid** o **Mailgun** (tier gratuito suele bastar para notificaciones internas).

2. **Los dos correos de destino**  
   - Ejemplo: `equipo@wholeselfnm.com` y `admin@wholeselfnm.com`, o los correos personales que usen para monitorear.

3. **Contenido del correo**  
   - Asunto: p. ej. `[Wholeself] Nuevo contacto - Formulario de contacto`.  
   - Cuerpo: texto o HTML con tipo de formulario, fecha/hora y los datos relevantes (nombre, email, mensaje, etc.) para que el equipo pueda responder.

---

## 4. Plan paso a paso (resumen)

### Fase 1: Decisión y configuración

1. Elegir método de envío: **mail/SMTP del host** (Banahost/Bluehost) o **servicio transaccional** (Resend, SendGrid).
2. Definir los dos correos de notificación y guardarlos en config (p. ej. en `db_config.php` o `email_config.php`), nunca en código.

### Fase 2: Implementación en el backend que usas en producción

**Si es PHP (Banahost):**

4. Crear un helper reutilizable (p. ej. `scripts/php/send_form_notification.php` o funciones en un `mail_helper.php`) que:
   - Reciba: tipo de formulario, datos del envío (array).
   - Construya asunto y cuerpo (texto o HTML).
   - Envíe a `NOTIFY_EMAIL_1` y `NOTIFY_EMAIL_2` (con mail(), PHPMailer, o API de Resend/SendGrid).
5. En cada script de formulario (`contact.php`, `referral.php`, `i-need-help.php`, `loved-one-needs-help.php`):
   - Después de `$stmt->execute()` exitoso, llamar al helper con el tipo de formulario y los datos ya validados.
   - No cambiar la respuesta JSON al cliente: seguir devolviendo `{ ok: true }` aunque el envío de correo falle (opcional: registrar el fallo en `error_log` para no bloquear al usuario).

**Si es Astro/Netlify:**

4. Crear un módulo (p. ej. `src/lib/email.server.ts`) que envíe el correo (Nodemailer o Resend), leyendo `NOTIFY_EMAIL_1`, `NOTIFY_EMAIL_2` y las credenciales desde env.
5. En cada endpoint `src/pages/api/forms/contact.ts`, `referral.ts`, `i-need-help.ts`, `loved-one-needs-help.ts`:
   - Después del `conn.execute(...)` exitoso, llamar al helper de email con el tipo de formulario y los datos.
   - Mantener la respuesta `{ ok: true }` aunque falle el envío (y hacer `console.error` o logging).

### Fase 3: Seguridad y buenas prácticas

6. No incluir en el cuerpo del correo datos sensibles innecesarios; sí los necesarios para responder (nombre, email, mensaje).
7. Mantener secretos (SMTP password, API keys) solo en variables de entorno / config del servidor, nunca en el repositorio.
8. Probar en staging: enviar un formulario y comprobar que llega el correo a ambas direcciones y que no va a spam (sobre todo si usas mail() o SMTP del host).

### Fase 4: Documentación y checklist

9. Documentar en el repo:
   - Dónde está la lógica de notificación (PHP o Astro).
   - Qué variables de entorno se necesitan (`NOTIFY_EMAIL_1`, `NOTIFY_EMAIL_2`, y las de SMTP o API).
10. Añadir a tu checklist de deploy (Bluehost/Banahost/Netlify) que esas variables estén configuradas en producción.

---

## 5. Siguiente paso concreto

1. Elegir método de envío: **mail()/SMTP del host** (Banahost y luego Bluehost) o **Resend** (o SendGrid/Mailgun).
2. Crear el helper de envío en PHP y enlazarlo en los 4 scripts: `contact.php`, `referral.php`, `i-need-help.php`, `loved-one-needs-help.php`.

Con eso se implementa: helper reutilizable en `scripts/php/` y llamada después del INSERT en cada formulario. Al migrar a Bluehost, se suben los mismos PHP y se configuran las variables de correo en cPanel.
