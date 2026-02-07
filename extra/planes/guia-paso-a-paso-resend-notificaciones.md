# Guía paso a paso: Notificaciones con Resend (ya tienes cuenta y API Key)

Esta guía asume que ya creaste la cuenta en Resend, tienes la API Key y la cuenta de Gmail **wholeself.auguslabs@gmail.com** para recibir las notificaciones. Sigue los pasos en orden.

---

## Resumen de lo que tienes

- **Resend:** cuenta creada, API Key disponible (empieza por `re_...`).
- **Gmail para notificaciones:** wholeself.auguslabs@gmail.com (entrar solo a esta para revisar avisos de formularios).
- **Destinatarios:** puedes usar uno o dos correos. Ejemplo: `augux607@gmail.com` y `wholeself.auguslabs@gmail.com`, o solo `wholeself.auguslabs@gmail.com` en ambos si quieres que todo llegue ahí.

---

## Paso 1: Decidir a qué correos llegan las notificaciones

En el servidor, en **`db_config.php`**, estas dos constantes son los destinatarios:

- **NOTIFY_EMAIL_1** → primer correo que recibe la notificación.
- **NOTIFY_EMAIL_2** → segundo correo que recibe la notificación.

**Ejemplo** (una notificación a la cuenta exclusiva de Wholeself y otra a tu correo personal):

```php
define('NOTIFY_EMAIL_1', 'wholeself.auguslabs@gmail.com');
define('NOTIFY_EMAIL_2', 'augux607@gmail.com');
```

Si quieres que **solo** llegue a la cuenta de Wholeself, pon el mismo correo en los dos (el script envía a ambos):

```php
define('NOTIFY_EMAIL_1', 'wholeself.auguslabs@gmail.com');
define('NOTIFY_EMAIL_2', 'wholeself.auguslabs@gmail.com');
```

---

## Paso 2: Remitente en Resend (From)

Resend solo permite enviar desde direcciones verificadas (o desde su dominio de prueba).

### Opción A: Prueba rápida (sin verificar dominio)

Para comprobar que todo funciona:

1. En **`db_config.php`** del servidor añade o deja:
   ```php
   define('NOTIFY_FROM_RESEND', 'onboarding@resend.dev');
   ```
2. Resend permite enviar desde `onboarding@resend.dev` en cuentas nuevas para pruebas. Los correos llegarán a wholeself.auguslabs@gmail.com (y al otro si lo configuraste).

### Opción B: Producción (dominio verificado)

Para que el correo salga de **noreply@ajamoment.com** (o tu dominio):

1. En **Resend** → **Domains** → **Add Domain**.
2. Escribe el dominio (ej. `ajamoment.com`) y sigue el asistente.
3. Resend te mostrará **registros DNS** (TXT para SPF, DKIM, etc.). Anota nombre y valor de cada uno.
4. En **cPanel** (o donde tengas el DNS del dominio) → **Zone Editor** (o DNS) → añade esos registros tal como Resend los indica.
5. En Resend, espera a que el dominio pase a **Verified** (puede tardar unos minutos).
6. En **`db_config.php`** pon:
   ```php
   define('NOTIFY_FROM_RESEND', 'noreply@ajamoment.com');
   ```

Recomendación: hacer primero **Opción A** para confirmar que llegan a wholeself.auguslabs@gmail.com; luego, si quieres, pasar a **Opción B**.

---

## Paso 3: Añadir la API Key de Resend en el servidor (obligatorio)

Si **RESEND_API_KEY** no está en `db_config.php` o está vacía, el script **no usará Resend** y seguirá con SMTP (en el log verás "SMTP intentado" y nunca "Resend intentado"). Tienes que añadir esta línea con tu clave real.

1. Conéctate al servidor por **FTP** o **cPanel → File Manager**.
2. Ve a la carpeta donde están los PHP de los formularios (ej. `public_html/api/forms/` o la ruta que uses).
3. Abre **`db_config.php`** (el archivo real del servidor, no el del repositorio).
4. Añade o edita la línea de la API Key con tu clave real (sustituye por la que te dio Resend):

   ```php
   define('RESEND_API_KEY', 're_xxxxxxxxxxxxxxxxxxxxxxxx');
   ```

   **Importante:** no subas este archivo a GitHub ni compartas la clave. `db_config.php` debe estar solo en el servidor y en `.gitignore`.

5. Si vas a usar la **Opción A** (prueba), asegúrate de tener también:
   ```php
   define('NOTIFY_FROM_RESEND', 'onboarding@resend.dev');
   ```
   Si usas la **Opción B**, usa:
   ```php
   define('NOTIFY_FROM_RESEND', 'noreply@ajamoment.com');
   ```

6. Guarda **`db_config.php`** en el servidor.

---

## Paso 4: Comprobar que el script de notificaciones está actualizado

El script que envía por Resend es **`send_form_notification.php`**. Debe ser la versión que incluye la llamada a la API de Resend (cuando existe `RESEND_API_KEY`).

1. En tu proyecto local (rama `feature/email-notifications` o donde tengas los cambios), verifica que **`scripts/php/send_form_notification.php`** existe y tiene la función `_send_via_resend`.
2. **Sube** ese archivo al servidor en la **misma carpeta** donde está **`db_config.php`** (sobrescribe el que haya).

---

## Paso 5: Probar el envío

1. Entra en tu sitio (el que apunta al servidor donde configuraste todo).
2. Envía un **formulario de prueba** (por ejemplo el de contacto) con datos de prueba.
3. Comprueba:
   - En **wholeself.auguslabs@gmail.com** (y en el otro correo si configuraste dos): bandeja de entrada y carpeta **Spam**.
   - En el servidor, en la carpeta de los PHP, el archivo **`notification_debug.log`**: debería aparecer una línea nueva como:
     ```
     YYYY-MM-DD HH:MM:SS | contact | Resend intentado | ok
     ```
4. Si en el log sale **"Resend intentado | ok"** y no llega el correo, revisa Spam y la sección **Emails** o **Logs** en el panel de Resend por si hay errores de entrega.

---

## Paso 6: Checklist final (resumen)

Antes de dar por cerrada la configuración, verifica:

- [ ] **NOTIFY_EMAIL_1** y **NOTIFY_EMAIL_2** en `db_config.php` con los correos correctos (incluido wholeself.auguslabs@gmail.com).
- [ ] **RESEND_API_KEY** en `db_config.php` con la clave real (re_...).
- [ ] **NOTIFY_FROM_RESEND** en `db_config.php`: `onboarding@resend.dev` (prueba) o `noreply@ajamoment.com` (si ya verificaste el dominio).
- [ ] **send_form_notification.php** subido al servidor (versión con Resend).
- [ ] Prueba de envío hecha y correo recibido en wholeself.auguslabs@gmail.com (o en ambos destinatarios).
- [ ] **notification_debug.log** con línea "Resend intentado | ok".

---

## Si algo falla

- **Log dice "Resend intentado | FALLÓ":** revisa que la API Key esté bien pegada (sin espacios), que Resend no haya desactivado la clave y que el servidor pueda hacer peticiones HTTPS a `api.resend.com`. Si en el log aparece **"API 4xx: ..."** o **"API 5xx: ..."**, el texto que sigue es el mensaje de error de Resend (ej. dominio no verificado, from inválido).
- **Log dice "ok" pero no llega el correo:** revisa Spam en wholeself.auguslabs@gmail.com; en Resend → Emails o Logs mira si el envío aparece y si hay error de rechazo.
- **Resend rechaza el "from":** si usas un correo que no está verificado (ej. @ajamoment.com sin haber completado Domains), cambia a `onboarding@resend.dev` para la prueba.

---

## Si ni el test de Resend (“Send first email”) llega a Gmail

Si **incluso el envío de prueba desde la web de Resend** (con tu API Key y destino wholeself.auguslabs@gmail.com) no llega, el fallo está entre Resend y Gmail, no en tu código. Sigue esto:

1. **Resend → Emails (o Logs)**  
   En el panel de Resend entra a la sección donde se listan los envíos. Busca el correo de prueba (y el de tu formulario si lo enviaste). Ahí suele decir: **Sent**, **Delivered**, **Bounced**, **Complained**, etc.  
   - Si pone **Delivered** o **Sent**: Resend lo envió; Gmail lo recibió pero puede estar en **Spam**, **Promociones** o **Social**. Revisa todas las pestañas en wholeself.auguslabs@gmail.com.  
   - Si pone **Bounced** o error: anota el mensaje; suele indicar rechazo (ej. dominio no verificado, dirección inválida).

2. **Revisar Spam y más en Gmail**  
   En **wholeself.auguslabs@gmail.com** abre **Spam**, **Promociones** y **Social**. Los correos de Resend a veces caen ahí la primera vez.

3. **Probar con otro destinatario**  
   En el test de Resend (o en NOTIFY_EMAIL_1) pon **augux607@gmail.com** (u otro que uses mucho). Si a ese sí llega y a wholeself.auguslabs@gmail.com no, puede que la cuenta nueva de Gmail tenga filtros más estrictos o que haya que marcar algo como “no spam” la primera vez.

4. **Cuenta nueva de Gmail**  
   Las cuentas recién creadas a veces retienen más o filtran más. Revisa que no haya límites o avisos en la cuenta wholeself.auguslabs@gmail.com (configuración, seguridad).

5. **Respuesta de la API en tu servidor**  
   Después de subir la versión nueva de `send_form_notification.php`, si Resend devuelve error (ej. 422 por “from” no verificado), en **notification_debug.log** aparecerá una línea tipo **"resend | API 422: ..."** con el mensaje. Eso te dice qué corregir (por ejemplo usar `onboarding@resend.dev` o verificar el dominio).

Cuando todo funcione, puedes usar **wholeself.auguslabs@gmail.com** como cuenta exclusiva para revisar las notificaciones de formularios.

---

## En Resend dice "Delivered" pero no veo el correo en Gmail

Si en Resend → **Emails → Sending** el estado es **Delivered**, Resend ya entregó el mensaje a los servidores de Gmail. No hace falta configurar nada de **"Receiving"** en Resend.

- **Receiving** en Resend es otra cosa: sirve para cuando alguien envía un correo **a una dirección tuya en Resend** (ej. `algo@ulkitwun.resend.app`) y Resend te lo reenvía a un webhook de tu app. No es para que los correos que **tú envías** desde Resend aparezcan en Gmail.
- **API Key:** solo se usa para **enviar** (sending). Para "Receiving" se usan webhooks y un secret, pero ese flujo no aplica a las notificaciones de formularios.

Si Resend muestra **Delivered**, el mensaje está en Gmail pero suele estar en **Spam**, **Promociones** o **Social**, no en Bandeja de entrada.

**Qué hacer:**

1. En **wholeself.auguslabs@gmail.com** abre la web de Gmail.
2. Revisa la pestaña **Principal** (Bandeja de entrada).
3. Revisa **Promociones** y **Social** (pestañas arriba).
4. Revisa **Spam** (Correo no deseado) en el menú lateral.
5. Si lo encuentras en Spam: ábrelo → **"No es spam"** / **"Report not spam"**. Los siguientes suelen ir a Bandeja de entrada.
6. Opcional: añade **onboarding@resend.dev** (o el remitente que uses) a contactos para que Gmail priorice esos correos.
