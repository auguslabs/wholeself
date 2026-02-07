# Notificaciones por email: si no llegan los correos

Cuando el formulario guarda bien en la base de datos pero **no llega el correo** a las dos direcciones configuradas, sigue estos pasos.

---

## Problema: "SMTP intentado | ok" pero no llega ni a bandeja ni a spam

**Qué significa:** El servidor de correo (`mail.ajamoment.com`) **aceptó** el mensaje (por eso el script registra "ok"). El fallo ocurre **después**: cuando ese servidor intenta entregar el correo a Gmail (u otro), el destinatario **rechaza o descarta** el mensaje antes de guardarlo. Por eso no ves nada ni en bandeja ni en spam.

**Causa más habitual:** El dominio **no tiene bien configurada la autenticación de correo (SPF y/o DKIM)**. Gmail y otros proveedores exigen que el servidor que envía esté autorizado en los registros DNS del dominio. Si falta o está mal, rechazan el mensaje en silencio.

**Qué hacer (en este orden):**

1. **cPanel → Email → Email Deliverability**  
   Abre la herramienta de entregabilidad para el dominio desde el que envías (ej. `ajamoment.com`).

2. **Revisar el resultado del análisis**  
   Te dirá si faltan o están mal:
   - **SPF** (registro TXT que autoriza a `mail.ajamoment.com` a enviar por tu dominio).
   - **DKIM** (firma que verifica que el correo viene de tu servidor).
   - A veces **DMARC** (política de qué hacer con correos que no pasan SPF/DKIM).

3. **Aplicar las correcciones que sugiera cPanel**  
   Suele ofrecer el valor del registro TXT o un botón para añadirlo. Los cambios son en **DNS** (en cPanel → Zone Editor o donde gestiones los registros del dominio). Pueden tardar unos minutos u horas en propagarse.

4. **Vuelve a enviar un formulario de prueba**  
   Cuando SPF (y DKIM si lo activas) estén correctos, los correos deberían empezar a llegar a bandeja o, como mucho, a spam. Si siguen sin llegar, en Email Deliverability puede aparecer más información o errores concretos.

**Resumen:** El código y el SMTP están bien (el log lo confirma). El problema es **entregabilidad del dominio**: hay que corregir **SPF/DKIM** en cPanel → **Email Deliverability** y en los DNS del dominio.

---

## Si ya reparaste SPF/DMARC y sigue sin llegar: lo que dice la doc de cPanel

Según [Email Deliverability in cPanel](https://docs.cpanel.net/cpanel/email/email-deliverability-in-cpanel/):

1. **Correo enviado desde PHP puede no firmarse con DKIM**  
   Aunque el dominio tenga DKIM instalado, los correos **enviados desde scripts PHP** (como nuestro formulario) a veces **no se firman con DKIM** si el servidor usa el handler PHP DSO sin el módulo MPM ITK. En ese caso el mensaje sale pero Gmail no puede verificar DKIM y puede rechazarlo.  
   **Qué hacer:** Abrir un ticket con el hosting (Banahost) y pedir que en **WHM → Exim Configuration Manager** activen:
   - *Query Apache server status to determine the sender of email sent from processes running as nobody*
   - *Trust X-PHP-Script headers to determine the sender of email sent from processes running as nobody*  
   Así el servidor puede asociar el envío PHP al dominio y aplicar la firma DKIM.

2. **Reverse DNS (PTR)**  
   En **Manage** el dominio tiene una sección **Reverse DNS (PTR)**. Si el IP del servidor no tiene un PTR correcto (apuntando al hostname del correo), muchos receptores rechazan o bajan la confianza del mensaje. Revisa en Manage si aparece algún aviso en PTR; si hay problema, solo el proveedor del servidor (tu host) puede corregir el PTR del IP.

3. **Revisar Manage a fondo**  
   En Email Deliverability → **Manage** para `ajamoment.com` revisa que **DKIM**, **SPF** y **DMARC** muestren estado correcto (no solo que Repair haya corrido). Si DKIM dice "Generate Local DKIM Key" o hay valores sugeridos sin instalar, hay que instalarlos. Si el DNS del dominio no está en el mismo servidor (nameservers externos), hay que copiar los registros sugeridos y añadirlos en el panel DNS donde gestiones el dominio.

4. **Plan B: servicio de correo transaccional**  
   Si el host no puede o no quiere activar las opciones de Exim para PHP, la opción fiable es enviar las notificaciones por un servicio externo (Resend, SendGrid, Mailgun): ellos firman con DKIM y tienen buena entregabilidad. Implicaría cambiar el script para usar su API en lugar del SMTP del hosting.

---

## 1. Revisar el archivo de depuración (lo más útil)

El script escribe en un archivo **en la misma carpeta que los PHP** (p. ej. `public_html/api/forms/` o la ruta donde estén):

- **`notification_debug.log`**

Cada vez que se envía un formulario, se añade una línea con:
- Fecha/hora
- Nombre del formulario (contact, referral, etc.)
- Si se intentó enviar y si `mail()` devolvió ok o FALLÓ

**Qué hacer:** Después de enviar un formulario de prueba, abre ese archivo por FTP o por cPanel → File Manager en esa carpeta. Verás algo como:

```
2026-02-06 15:30:00 | contact | envío intentado | mail()=ok
```

o

```
2026-02-06 15:30:00 | contact | envío intentado | mail()=FALLÓ
```

- Si aparece **`mail()=FALLÓ`**: el servidor está rechazando el envío (ver sección 3).
- Si **no existe el archivo** o no se crea ninguna línea nueva: el código de notificación no se está ejecutando (p. ej. `NOTIFY_EMAIL_1`/`NOTIFY_EMAIL_2` no definidos; revisa `db_config.php`).
- Si aparece **`mail()=ok`** pero no llega el correo: suele ser filtro antispam o que el host acepta el envío pero luego lo descarta; revisa Spam y la sección 3.

---

## 2. El log que viste en cPanel no es el de PHP

Lo que muestra **“Latest web server error log messages”** son errores del **servidor web** (p. ej. 404, archivo no encontrado). Los mensajes de **PHP** (`error_log(...)`) suelen ir a:

- Un archivo **error_log** en la raíz de tu cuenta (p. ej. `/home/tu_usuario/error_log`) o dentro de `public_html`
- O en cPanel, a veces en **Errors** pero eligiendo otro log (si hay un desplegable “Select Log” o “PHP errors”)

Así que es normal no ver ahí nada relacionado con el envío de correo. Por eso se añadió **`notification_debug.log`** en la carpeta de la API: para no depender de encontrar el log de PHP.

---

## 3. Configuración en cPanel para que el correo salga

En hosting compartido (Banahost, Bluehost, etc.) **`mail()` de PHP** suele tener restricciones:

1. **Correo “From” válido del dominio**  
   Si el From no es una cuenta real del dominio, muchos hosts rechazan o bloquean el envío.
   - En **db_config.php** define **NOTIFY_FROM** con una cuenta que exista en tu dominio, por ejemplo una que crees en cPanel:
     - cPanel → **Email Accounts** → Create → ej. `noreply@ajamoment.com` (o el dominio que uses).
   - En **db_config.example.php** está el ejemplo: `define('NOTIFY_FROM', 'noreply@ajamoment.com');`. En el servidor, en tu **db_config.php** real, pon la misma dirección (o la que hayas creado).

2. **Revisar Spam / Promociones**  
   Aunque `mail()` devuelva ok, el mensaje puede llegar a Spam en **augux607@gmail.com** y **auguslabs@gmail.com**. Revisa esas carpetas.

3. **Entregabilidad del dominio**  
   En cPanel → **Email** → **Email Deliverability** puedes ver si el dominio está marcado con problemas de entrega. Si el host bloquea envíos desde ese dominio, los correos no llegarán aunque PHP diga ok.

4. **Envío por SMTP (implementado)**  
   El script ya puede enviar por **SMTP** usando la cuenta del dominio (ej. `noreply@ajamoment.com`). En **db_config.php** define:
   - `NOTIFY_SMTP_HOST` (ej. `mail.ajamoment.com` — en cPanel → Email Accounts suele decir "Server" o "Manual settings")
   - `NOTIFY_SMTP_USER` = el correo completo (ej. `noreply@ajamoment.com`)
   - `NOTIFY_SMTP_PASS` = contraseña de esa cuenta
   - `NOTIFY_SMTP_PORT` = `587` (o 465 si tu host usa SSL directo)
   Si estas constantes están definidas, se usará SMTP en lugar de `mail()`. En `notification_debug.log` verás "SMTP intentado" cuando se use SMTP.

---

## Resumen rápido

1. Sube la **versión nueva** de **`send_form_notification.php`** (la que escribe `notification_debug.log`).
2. En **db_config.php** del servidor, añade **NOTIFY_FROM** con un correo real del dominio (ej. `noreply@ajamoment.com` creado en Email Accounts).
3. Envía de nuevo un formulario de prueba.
4. Abre **`notification_debug.log`** en la carpeta de la API y mira si sale `mail()=ok` o `mail()=FALLÓ` y si hay líneas de “NOTIFY_EMAIL no definidos”.
5. Revisa **Spam** en ambos correos de destino.

Con eso sabrás si el fallo es de configuración (constantes), del servidor (`mail()=FALLÓ`) o de entrega (ok pero va a spam / bloqueo del host).
