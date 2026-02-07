# Historial: Notificaciones por email (formularios) — Problemas y solución

Documento que recoge todo el proceso de configuración de las notificaciones por correo cuando alguien envía un formulario: qué se intentó, qué falló, por qué y cómo se resolvió al final.

---

## Objetivo

Cuando una persona envía un formulario (contacto, referido, “necesito ayuda”, “mi ser querido necesita ayuda”) y el registro se guarda en la base de datos, enviar una **notificación por correo** a **dos direcciones** para que el equipo pueda responder.

---

## Contexto técnico

- **Sitio:** Netlify (front) → formularios envían a PHP en Banahost (o en el futuro Bluehost).
- **Backend:** scripts PHP en `scripts/php/` (contact.php, referral.php, i-need-help.php, loved-one-needs-help.php) que hacen INSERT en MySQL.
- **Config:** credenciales y correos en `db_config.php` en el servidor (no en el repo; `.gitignore`).

---

## Timeline de lo que se hizo y lo que falló

### 1. Plan inicial: enviar después del INSERT

Se decidió enviar el correo **justo después** de que el INSERT en la base de datos sea exitoso, en el mismo flujo de la petición (sin colas ni workers). Se creó un helper reutilizable `send_form_notification.php` y se integró en los cuatro scripts PHP.

**Constantes en config:** `NOTIFY_EMAIL_1`, `NOTIFY_EMAIL_2` (destinatarios), `NOTIFY_FROM` (remitente).

---

### 2. Primer intento: `mail()` de PHP

Se usó la función nativa `mail()` de PHP. El formulario guardaba bien en la BD, pero **no llegaba ningún correo** a las dos direcciones (ni a bandeja ni a spam).

**Qué estaba mal / qué se aprendió:**

- En hosting compartido (Banahost/cPanel), `mail()` suele ser poco fiable: el servidor puede “aceptar” el envío pero no entregarlo a Gmail u otros, o lo filtra.
- El log del **servidor web** (errores 404, etc.) **no** es el log de PHP; los `error_log()` del script pueden estar en otro archivo. Por eso se añadió un **archivo de depuración propio**: `notification_debug.log` en la misma carpeta que los PHP.

---

### 3. Segundo intento: SMTP del hosting (puerto 465)

Se implementó envío por **SMTP** usando la cuenta del dominio (ej. `noreply@ajamoment.com`) con puerto **465** (SSL), tal como aparece en cPanel → Email Accounts → Connect Devices.

En el log aparecía **"SMTP intentado | ok"**: el servidor de correo del host aceptaba el mensaje. Aun así, **no llegaba nada** a Gmail (ni a bandeja ni a spam).

**Qué estaba mal / qué se aprendió:**

- Que el servidor responda “ok” no significa que Gmail reciba el mensaje. Gmail puede **rechazar o descartar** el correo antes de guardarlo si la autenticación del dominio no es correcta o si el servidor se anuncia con un HELO que no encaja.

---

### 4. Revisión de entregabilidad en cPanel (SPF, DKIM, DMARC)

En cPanel → **Email Deliverability** el dominio mostraba **"Problems Exist (DMARC and SPF)"**. Se usó **Repair** y el estado pasó a **Valid** para SPF, DKIM y DMARC. Aun así, los correos enviados desde PHP **seguían sin llegar** a Gmail.

**Qué estaba mal / qué se aprendió:**

- Aunque SPF/DKIM/DMARC estén correctos en DNS, en muchos hostings el correo **enviado desde scripts PHP** no se firma con DKIM (por la forma en que está configurado Exim y PHP). Además, en la sección **Reverse DNS (PTR)** aparecía que el servidor usa un **HELO alternativo** (`single-3028.banahosting.com`) en lugar de algo como `mail.ajamoment.com`. Eso puede hacer que receptores como Gmail rechacen o descarten el mensaje.
- Conclusión: en ese entorno (hosting compartido, sin control del HELO ni de la firma DKIM para PHP), **no era viable** confiar en el correo saliente del propio hosting para que llegara a Gmail.

---

### 5. Plan B: Resend (servicio externo)

Se decidió usar un **servicio de correo transaccional** (Resend) que envía por sus propios servidores, con buena reputación y DKIM. Se implementó la llamada a la **API de Resend** desde `send_form_notification.php` (POST a `https://api.resend.com/emails` con la API Key en el header). Si está definida `RESEND_API_KEY`, el script usa Resend; si no, usa SMTP o `mail()`.

**Config necesaria:** `RESEND_API_KEY`, `NOTIFY_FROM_RESEND` (ej. `onboarding@resend.dev` para pruebas).

---

### 6. Confusión: “Solo recibí el test de Resend, no el de nuestro código”

El usuario recibió el correo de prueba **"Hello World"** enviado desde la web de Resend, pero no el correo que envía **nuestro** script al enviar un formulario. Se pensó que algo en nuestro código estaba mal.

**Qué estaba mal / qué se aclaró:**

- **Receiving** en Resend es otra función: sirve para recibir correos **en** una dirección de Resend y reenviarlos a un webhook. **No** hace falta configurar “Receiving” para que los correos que **nosotros enviamos** con la API lleguen a Gmail.
- Si en Resend → Emails el estado es **Delivered**, el mensaje **sí** llegó a los servidores de Gmail; a menudo va a **Spam** o **Promociones**. Hay que revisar esas carpetas.
- La **API Key** solo se usa para **enviar**; nuestro código ya la usa en el header `Authorization: Bearer ...`. No hace falta otra clave para “recibir” en Gmail.

---

### 7. El log nunca decía “Resend”, solo “SMTP intentado”

En `notification_debug.log` solo aparecían líneas como **"SMTP intentado | ok"** o **"mail() fallback intentado | ok"**, y **nunca** “Resend intentado”.

**Qué estaba mal:**

- En el **servidor**, en `db_config.php`, **no** estaba definida la constante **RESEND_API_KEY** (o estaba vacía). El usuario había añadido solo `NOTIFY_FROM_RESEND` (y las de SMTP). El script comprueba primero si existe y no está vacía `RESEND_API_KEY`; si no, usa SMTP o `mail()` y por eso el log nunca mostraba Resend.

**Qué se hizo:**

- Añadir en **`db_config.php` del servidor** (en la misma carpeta que los PHP) la línea:  
  `define('RESEND_API_KEY', 're_xxxxxxxxxxxxxxxx');`  
  con la clave real de Resend.
- Se añadió además una línea en el log **"Resend config: sí"** o **"Resend config: NO (añade RESEND_API_KEY en db_config.php)"** para ver de un vistazo si la API Key está disponible.

**Importante:** El archivo que debe contener la clave es el **`db_config.php` del servidor** (FTP / File Manager), no el `db_config.example.php` del repositorio. El ejemplo es solo plantilla.

---

### 8. Error 403 de Resend: “You can only send testing emails to your own email address”

Tras definir `RESEND_API_KEY`, el log mostró **"Resend intentado"** pero con **API 403** y el mensaje de que solo se pueden enviar correos de **prueba** a la dirección propia de la cuenta (wholeself.auguslabs@gmail.com), y que para enviar a otros destinatarios hay que **verificar un dominio**.

**Qué estaba mal:**

- En `db_config.php` se tenían dos destinatarios: `NOTIFY_EMAIL_1` y `NOTIFY_EMAIL_2`. Si una de ellas (por ejemplo augux607@gmail.com) **no** es la dirección de la cuenta de Resend, Resend en modo prueba **rechaza** ese envío con 403.

**Qué se hizo:**

- Mientras se use la cuenta en modo prueba (sin dominio verificado), poner **las dos** constantes con la **misma** dirección permitida:  
  `NOTIFY_EMAIL_1` = wholeself.auguslabs@gmail.com  
  `NOTIFY_EMAIL_2` = wholeself.auguslabs@gmail.com  
- Así el envío cumple la restricción de Resend y el correo llega. Cuando se verifique un dominio en Resend, se puede volver a poner un segundo correo distinto en `NOTIFY_EMAIL_2` si se desea.

---

### 9. Error: “NOTIFY_EMAIL_1 o NOTIFY_EMAIL_2 no definidos en db_config.php”

En el servidor se había definido solo **NOTIFY_EMAIL_1** y se había quitado o no se había añadido **NOTIFY_EMAIL_2**. El script **exige** que **ambas** constantes existan; si falta una, sale con ese mensaje y no envía.

**Qué se hizo:**

- Añadir en **`db_config.php` del servidor** también:  
  `define('NOTIFY_EMAIL_2', 'wholeself.auguslabs@gmail.com');`  
  (o la dirección que corresponda cuando el dominio esté verificado).

---

### 10. Estado final: Resend funcionando

Tras tener en el servidor:

- `RESEND_API_KEY` con la clave real
- `NOTIFY_FROM_RESEND` = `onboarding@resend.dev` (pruebas)
- `NOTIFY_EMAIL_1` y `NOTIFY_EMAIL_2` definidas (en prueba, ambas = wholeself.auguslabs@gmail.com)

el log muestra:

- **Resend config: sí**
- **Resend intentado | ok**

y los correos de notificación **llegan** a wholeself.auguslabs@gmail.com (revisar también Spam/Promociones la primera vez).

---

## Por qué hay dos constantes de correo (NOTIFY_EMAIL_1 y NOTIFY_EMAIL_2)

- El **requisito** era avisar a **dos** direcciones (dos personas del equipo). Por eso el script está hecho para **dos** destinatarios y usa dos constantes: `NOTIFY_EMAIL_1` y `NOTIFY_EMAIL_2`.
- El script **siempre** espera que **las dos** estén definidas en `db_config.php`. Si quieres que solo una persona reciba el aviso, igualmente tienes que definir **las dos** constantes; puedes poner **la misma dirección en ambas** (ej. wholeself.auguslabs@gmail.com en las dos). Resend enviará a esa dirección (en la práctica suele llegar un solo correo cuando los dos “to” son el mismo).
- **Resumen:**  
  - ¿Por qué dos constantes? Porque el producto pide dos correos de notificación.  
  - ¿Puede ser solo uno? El código no permite “solo uno”; hay que definir las dos. Si quieres un solo destinatario, usa el mismo correo en `NOTIFY_EMAIL_1` y `NOTIFY_EMAIL_2`.  
  - En **modo prueba de Resend** solo está permitido enviar a la dirección de la cuenta; por eso en esta fase se puso la misma dirección (wholeself.auguslabs@gmail.com) en ambas. Cuando verifiques un dominio, puedes usar dos direcciones distintas si lo necesitas.

---

## Resumen de errores y causas

| Qué pasaba | Causa | Solución |
|------------|--------|----------|
| No llegaba correo con `mail()` | Hosting compartido no entrega bien a Gmail | Usar Resend (Plan B) |
| No llegaba con SMTP del host | HELO genérico, DKIM no aplicado a PHP, rechazo por Gmail | Usar Resend |
| Log no mostraba “Resend” | `RESEND_API_KEY` no definida en `db_config.php` del servidor | Añadir la constante con la clave real en el `db_config.php` del servidor |
| API 403 de Resend | En modo prueba solo se puede enviar a la dirección de la cuenta | Poner la misma dirección en NOTIFY_EMAIL_1 y NOTIFY_EMAIL_2 (o verificar dominio) |
| “NOTIFY_EMAIL_1 o NOTIFY_EMAIL_2 no definidos” | Solo se había definido una de las dos en el servidor | Definir **ambas** constantes en `db_config.php` del servidor |
| “Solo recibo el test de Resend” | Nuestro envío no usaba Resend por falta de API Key, o el correo estaba en Spam | Añadir RESEND_API_KEY; revisar Spam/Promociones en Gmail |

---

## Configuración correcta en el servidor (resumen)

En **`db_config.php`** en la carpeta de los PHP (ej. `public_html/api/forms/` o la ruta que uses):

```php
// Base de datos
define('DB_HOST', '...');
define('DB_USER', '...');
define('DB_PASSWORD', '...');
define('DB_NAME', '...');

// Destinatarios de la notificación (ambas constantes obligatorias)
define('NOTIFY_EMAIL_1', 'wholeself.auguslabs@gmail.com');
define('NOTIFY_EMAIL_2', 'wholeself.auguslabs@gmail.com');  // Mismo correo en prueba; cuando verifiques dominio puedes usar otro

// Resend
define('RESEND_API_KEY', 're_xxxxxxxxxxxxxxxx');  // Clave real de Resend → API Keys
define('NOTIFY_FROM_RESEND', 'onboarding@resend.dev');  // Prueba; con dominio verificado: noreply@tudominio.com
```

Archivos que deben estar en esa carpeta: los 4 PHP de formularios, `send_form_notification.php`, `db_config.php`. El log `notification_debug.log` se crea ahí al enviar un formulario.

---

## Referencias en el proyecto

- **Plan y opciones:** `extra/planes/plan-notificaciones-email-formularios.md`
- **Plan B Resend:** `extra/planes/plan-b-servicio-email-resend.md`
- **Guía paso a paso Resend:** `extra/planes/guia-paso-a-paso-resend-notificaciones.md`
- **Depuración (Spam, SMTP, Resend):** `extra/planes/notificaciones-email-depuracion.md`
- **Ejemplo de config (sin datos reales):** `scripts/php/db_config.example.php`
- **Helper de envío:** `scripts/php/send_form_notification.php`
