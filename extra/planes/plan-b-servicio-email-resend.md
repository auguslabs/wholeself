# Plan B: Notificaciones por correo con Resend (servicio externo)

Cuando el SMTP del hosting no entrega a Gmail (p. ej. por HELO alternativo o DKIM en PHP), usar un **servicio de correo transaccional** asegura que los mensajes lleguen. Este plan usa **Resend**.

---

## 1. ¿Es de pago?

**No para tu volumen.** Resend tiene **plan gratuito**:

- **100 correos al día** (aprox. 3.000 al mes).
- Incluye 1 dominio propio, API, DKIM/SPF/DMARC.
- Sin tarjeta para empezar.

Para 2 notificaciones por envío (dos direcciones) y pocos formularios al día, el plan gratuito basta. Si más adelante superas el límite, tienen planes de pago.

**Alternativas:** SendGrid (están retirando el plan gratis), Mailgun (tiene tier gratuito limitado). Resend es sencillo de integrar y el free tier es generoso.

---

## 2. Cómo funciona

1. **Te registras** en [resend.com](https://resend.com) y creas una cuenta.
2. **Obtienes una API Key** en el panel (API Keys → Create). Es un token secreto (empieza por `re_...`) que el script usará para autenticarse.
3. **Opcional pero recomendado:** en Resend añades tu dominio (ej. `ajamoment.com`) y verificas con los registros DNS que te indiquen. Así los correos salen de `noreply@ajamoment.com` y se ven profesionales. Si no verificas dominio, Resend puede permitir enviar desde un dominio de prueba (con límites); para producción conviene verificar.
4. **En el servidor** pones la API Key en `db_config.php` (solo ahí, nunca en el repo). El script, si detecta esa clave, envía por la **API de Resend** en lugar del SMTP del hosting.
5. Resend **envía el correo** por sus servidores (con DKIM y buena reputación), por eso suele llegar a bandeja o spam sin ser rechazado.

---

## 3. Qué tienes que hacer (paso a paso)

### Paso 1: Cuenta y API Key en Resend

1. Entra en **[resend.com](https://resend.com)** → Sign up (email o Google).
2. En el panel: **API Keys** → **Create API Key**. Pon un nombre (ej. "Wholeself formularios") y crea.
3. **Copia la API Key** (solo se muestra una vez; si la pierdes, creas otra).

### Paso 2: (Opcional) Verificar tu dominio

1. En Resend: **Domains** → **Add Domain**.
2. Indica el dominio desde el que quieres enviar (ej. `ajamoment.com`).
3. Resend te dará unos **registros DNS** (SPF, DKIM, etc.). Añádelos en cPanel → Zone Editor (o donde gestiones el DNS). Si ya tienes SPF/DKIM por el correo de cPanel, Resend puede dar otros valores; a veces hace falta un subdominio tipo `send.ajamoment.com` para no chocar. Sigue las instrucciones de Resend.
4. Cuando el dominio esté **Verified**, podrás usar `noreply@ajamoment.com` (o el que configures) como remitente.

**Importante:** Para enviar desde `noreply@ajamoment.com` (o cualquier @ajamoment.com) debes **verificar el dominio** en Resend (Domains → Add Domain → añadir los registros DNS que indiquen). Si aún no has verificado, puedes hacer una **prueba rápida** enviando desde el dominio por defecto de Resend: en Resend → Domains suele aparecer algo como `onboarding@resend.dev` para pruebas; en ese caso en `db_config.php` pon temporalmente `define('NOTIFY_FROM_RESEND', 'onboarding@resend.dev');` y verifica que los correos lleguen. Luego añade y verifica `ajamoment.com` para usar `noreply@ajamoment.com` en producción.

### Paso 3: Configurar en el servidor

1. En el servidor (Banahost), abre **`db_config.php`** (el que ya usas para la BD y SMTP).
2. Añade una línea con tu API Key (sustituye por la clave real):

   ```php
   define('RESEND_API_KEY', 're_xxxxxxxxxxxxxxxxxxxxxxxx');
   ```

3. **Opcional:** si quieres forzar el remitente cuando uses Resend, puedes definir:

   ```php
   define('NOTIFY_FROM_RESEND', 'noreply@ajamoment.com');
   ```

   Si no está definido, el script usará el mismo `NOTIFY_FROM` que ya tienes.

4. **Sube la nueva versión** de `send_form_notification.php` al servidor (la que incluye el envío por Resend).

### Paso 4: Probar

1. Envía un formulario de prueba desde el sitio.
2. Revisa que en **augux607@gmail.com** y **auguslabs@gmail.com** llegue el correo (bandeja o spam).
3. En **`notification_debug.log`** debería aparecer algo como "Resend intentado | ok".

---

## 4. Comportamiento del script

- Si en **db_config.php** está definido **RESEND_API_KEY** (y no está vacío), el script **envía solo por Resend** (no usa SMTP ni `mail()`).
- Si **no** está definida la clave, se sigue usando SMTP / `mail()` como hasta ahora.
- Así puedes dejar el SMTP configurado y, al añadir la API Key, pasar a Resend sin tocar más archivos.

---

## 5. Resumen

| Qué | Dónde |
|-----|--------|
| ¿Pago? | Plan gratuito (100 emails/día); suficiente para notificaciones. |
| Cuenta | [resend.com](https://resend.com) → Sign up. |
| API Key | Resend → API Keys → Create → copiar. |
| Config | En `db_config.php`: `define('RESEND_API_KEY', 're_...');` |
| Dominio | Opcional pero recomendado: Resend → Domains → Add → verificar con DNS. |
| Código | `send_form_notification.php` ya preparado para usar Resend si existe la clave. |

Cuando tengas la API Key y la hayas puesto en `db_config.php`, sube el script actualizado y prueba. Si algo no llega, revisa `notification_debug.log` y la sección de Activity/Logs en el panel de Resend.
