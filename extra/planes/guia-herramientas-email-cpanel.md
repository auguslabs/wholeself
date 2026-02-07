# Guía: Herramientas de email en cPanel

Documento de referencia sobre las opciones de **Email** que aparecen en la sección **Tools** de cPanel: qué es cada una, para qué sirve, cómo se usa y cómo se utiliza en la industria. Útil para crear y gestionar correos como `info@wholeself.com` y el resto de la comunicación por email del dominio.

---

## Índice

1. [Email Accounts (Cuentas de correo)](#1-email-accounts-cuentas-de-correo)
2. [Forwarders (Reenvíos)](#2-forwarders-reenvíos)
3. [Email Routing (Enrutamiento de correo)](#3-email-routing-enrutamiento-de-correo)
4. [Autoresponders (Respuestas automáticas)](#4-autoresponders-respuestas-automáticas)
5. [Default Address (Dirección por defecto)](#5-default-address-dirección-por-defecto)
6. [Mailing Lists (Listas de correo)](#6-mailing-lists-listas-de-correo)
7. [Track Delivery (Seguimiento de entrega)](#7-track-delivery-seguimiento-de-entrega)
8. [Global Email Filters (Filtros globales)](#8-global-email-filters-filtros-globales)
9. [Email Filters (Filtros por cuenta)](#9-email-filters-filtros-por-cuenta)
10. [Email Deliverability (Entregabilidad)](#10-email-deliverability-entregabilidad)
11. [Address Importer (Importador de direcciones)](#11-address-importer-importador-de-direcciones)
12. [Spam Filters (Filtros antispam)](#12-spam-filters-filtros-antispam)
13. [Email Marketing (Email marketing)](#13-email-marketing-email-marketing)
14. [Encryption (Cifrado)](#14-encryption-cifrado)
15. [Calendars and Contacts Configuration](#15-calendars-and-contacts-configuration)
16. [Calendars and Contacts Sharing](#16-calendars-and-contacts-sharing)
17. [Calendars and Contacts Management](#17-calendars-and-contacts-management)
18. [Email Disk Usage (Uso de disco)](#18-email-disk-usage-uso-de-disco)

---

## 1. Email Accounts (Cuentas de correo)

**Qué es:** La herramienta principal para crear, eliminar y administrar direcciones de correo de tu dominio (por ejemplo `info@wholeself.com`, `support@wholeself.com`).

**Para qué sirve:**
- Crear cuentas de correo profesionales con tu dominio.
- Definir contraseña, cuota de almacenamiento y acceso webmail.
- Obtener los datos de configuración para clientes de correo (IMAP, POP3, SMTP).

**Cómo se utiliza:**
- Entras en *Email Accounts*, pulsas *Create* y defines usuario (ej. `info`), dominio y contraseña.
- Desde ahí gestionas cada cuenta: cambiar contraseña, ver uso de espacio, acceder a webmail o ver instrucciones para Outlook/Thunderbird/móvil.

**Uso en la industria:** Es la opción básica y necesaria. Cualquier negocio que quiera correo con su dominio crea aquí las cuentas. Es donde crearías `info@wholeself.com` para contacto general.

---

## 2. Forwarders (Reenvíos)

**Qué es:** Permite redirigir automáticamente el correo que llega a una dirección hacia otra dirección (o varias) ya existentes.

**Para qué sirve:**
- Hacer que `ventas@tudominio.com` reenvíe a tu correo personal o a un equipo.
- Mantener correos antiguos activos reenviándolos a la nueva dirección.
- Consolidar en una sola bandeja el correo de varios alias o roles.

**Cómo se utiliza:**
- Creas un forwarder indicando la dirección de origen (ej. `sales@wholeself.com`) y la(s) dirección(es) de destino.
- No necesitas crear una “cuenta” con buzón para la dirección de origen; solo defines a dónde se reenvía.

**Uso en la industria:** Muy usado para roles (info, ventas, soporte) que no tienen buzón propio y quieres que todo llegue a una o varias personas. También en migraciones o cambios de correo sin perder mensajes.

---

## 3. Email Routing (Enrutamiento de correo)

**Qué es:** Define **dónde** se entrega el correo entrante de tu dominio: en los buzones del servidor de cPanel o en un servidor externo (Google Workspace, Microsoft 365, etc.).

**Para qué sirve:**
- Decidir si el correo de `@wholeself.com` lo gestiona el hosting (cPanel) o un proveedor externo.
- Evitar que los mensajes reboten o se pierdan por una configuración incorrecta del correo.

**Cómo se utiliza:**
- Eliges la opción adecuada: por ejemplo “Remote Mail Exchanger” si usas Google Workspace o Microsoft 365, o “Local” si usas solo las cuentas de cPanel.
- Suele ir acompañado de cambios en los registros MX del dominio (en DNS).

**Uso en la industria:** Imprescindible cuando usas correo corporativo externo (Gmail/Outlook con tu dominio). Sin un routing correcto, los servidores no saben a qué servidor enviar el correo y puede fallar la entrega.

---

## 4. Autoresponders (Respuestas automáticas)

**Qué es:** Envía automáticamente un mensaje predefinido a quien envía un correo a una dirección concreta.

**Para qué sirve:**
- Mensajes de “fuera de oficina”.
- Confirmar recepción de consultas (“Hemos recibido su mensaje, le responderemos en 24 h”).
- Envío automático de información básica (horarios, enlaces) al recibir un correo.

**Cómo se utiliza:**
- Asocias el autoresponder a una cuenta o dirección, escribes el asunto y el cuerpo del mensaje y defines el intervalo (para no enviar el mismo mensaje 50 veces al mismo remitente).

**Uso en la industria:** Muy usado en atención al cliente y soporte para dar respuesta inmediata y gestionar expectativas. También en formularios o páginas de contacto cuando se confirma por email que se recibió el mensaje.

---

## 5. Default Address (Dirección por defecto)

**Qué es:** La dirección “catch-all”: recibe todo el correo enviado a tu dominio que **no** coincida con ninguna cuenta ni forwarder existente.

**Para qué sirve:**
- Evitar que un correo se pierda por un error tipográfico (ej. `infi@wholeself.com` en vez de `info@wholeself.com`).
- Recibir en un solo buzón todo lo que llegue a direcciones no definidas.

**Cómo se utiliza:**
- Configuras una cuenta o forwarder como “default” para el dominio. Todo lo que no tenga cuenta ni forwarder irá ahí.

**Uso en la industria:** Útil en dominios donde quieres no perder ningún mensaje; en contrapartida puede recibir mucho spam si no se combina con filtros. Muchas empresas lo usan para roles genéricos o para detectar typos.

---

## 6. Mailing Lists (Listas de correo)

**Qué es:** Listas de distribución: envías un solo correo y se entrega a todos los suscriptores de la lista (ej. `equipo@wholeself.com`, `clientes@wholeself.com`).

**Para qué sirve:**
- Comunicación interna (anuncios a todo el equipo).
- Newsletters o avisos a un grupo de personas.
- Grupos de debate o listas de soporte.

**Cómo se utiliza:**
- Creas la lista, añades direcciones (o permites suscripción) y envías el correo a la dirección de la lista; el servidor lo reenvía a todos.

**Uso en la industria:** Se usa para equipos pequeños/medianos y newsletters básicas. Para marketing masivo o listas muy grandes suele usarse un servicio externo (Mailchimp, SendGrid, etc.), pero las listas de cPanel son prácticas para uso interno o listas reducidas.

---

## 7. Track Delivery (Seguimiento de entrega)

**Qué es:** Registro (log) del correo entrante y saliente de tu dominio, con el estado de cada mensaje.

**Para qué sirve:**
- Comprobar si un correo concreto se envió o se recibió.
- Diagnosticar por qué un mensaje no llegó (rebotes, rechazos, etc.).
- Entender el flujo de correo del dominio.

**Cómo se utiliza:**
- Abres la herramienta y consultas los registros por dirección, fecha o criterios de búsqueda para ver el estado de envíos/recepciones.

**Uso en la industria:** Herramienta de diagnóstico esencial para administradores y soporte. Permite responder a usuarios (“su mensaje llegó correctamente” o “fue rechazado por…”) y corregir problemas de entrega.

---

## 8. Global Email Filters (Filtros globales)

**Qué es:** Reglas de filtrado que se aplican a **todas** las cuentas de correo del dominio.

**Para qué sirve:**
- Bloquear o marcar spam de determinados remitentes o dominios para todo el mundo.
- Reenviar ciertos tipos de correo a un buzón central (ej. archivo de facturas).
- Aplicar políticas de correo a nivel de dominio (bloqueo de adjuntos, palabras, etc.).

**Cómo se utiliza:**
- Creas reglas por criterios (remitente, asunto, contenido) y defines la acción (eliminar, mover, reenviar, marcar).

**Uso en la industria:** Sirve para centralizar políticas y seguridad (por ejemplo filtrar phishing conocido) sin que cada usuario tenga que configurar lo mismo. Muy útil en entornos corporativos con varias cuentas.

---

## 9. Email Filters (Filtros por cuenta)

**Qué es:** Reglas de filtrado que cada usuario configura **solo para su propia** cuenta.

**Para qué sirve:**
- Organizar el buzón: mover correos de ciertos remitentes a carpetas (ej. “Ventas”, “Soporte”).
- Marcar como leído, archivar o eliminar según remitente, asunto o contenido.
- Gestionar spam y prioridades a nivel personal.

**Cómo se utiliza:**
- El usuario entra en *Email Filters* (o desde webmail/cuenta), crea reglas “si el remitente contiene X” o “si el asunto contiene Y”, y elige la acción.

**Uso en la industria:** Uso cotidiano en cualquier empresa. Mejora la productividad y el orden del correo sin depender del administrador; cada persona adapta las reglas a su trabajo.

---

## 10. Email Deliverability (Entregabilidad)

**Qué es:** Herramienta que revisa y ayuda a corregir la configuración que afecta a que tus correos **lleguen** y no caigan en spam: SPF, DKIM, DMARC y a veces registros MX.

**Para qué sirve:**
- Detectar problemas de autenticación (SPF/DKIM/DMARC) que hacen que los servidores receptores rechacen o marquen como spam tus envíos.
- Obtener recomendaciones o pasos para reparar la configuración DNS.

**Cómo se utiliza:**
- Ejecutas el análisis; cPanel revisa los registros DNS del dominio y muestra qué falta o está mal. Suele ofrecer valores sugeridos o enlaces a zonas DNS para corregir.

**Uso en la industria:** Crítica para cualquier dominio que envíe correo (notificaciones, newsletters, respuestas automáticas). Sin buena entregabilidad, los correos de `@wholeself.com` pueden no llegar o ir a spam. Se revisa al configurar el correo y periódicamente.

---

## 11. Address Importer (Importador de direcciones)

**Qué es:** Importación masiva de cuentas de correo o forwarders desde un archivo (CSV o similar).

**Para qué sirve:**
- Crear muchas cuentas o forwarders de una vez sin hacerlo una a una.
- Migrar desde otro proveedor o desde una hoja de cálculo con la lista de correos.

**Cómo se utiliza:**
- Preparas un archivo con el formato que indica cPanel (usuario, dominio, contraseña o destino del forwarder) y subes el archivo; cPanel crea las cuentas o forwarders en bloque.

**Uso en la industria:** Se usa en migraciones, cambios de hosting o cuando se configuran muchos correos nuevos (nuevos empleados, nuevos departamentos). Ahorra tiempo y reduce errores frente a la creación manual.

---

## 12. Spam Filters (Filtros antispam)

**Qué es:** Configuración del filtro antispam del servidor (normalmente Apache SpamAssassin) para todo el dominio o por cuenta.

**Para qué sirve:**
- Reducir el correo no deseado y el riesgo de phishing.
- Ajustar la sensibilidad (qué se considera spam) y decidir qué hacer con él (mover a carpeta spam, eliminar, marcar).
- Gestionar listas blancas y negras (remitentes o dominios permitidos o bloqueados).

**Cómo se utiliza:**
- Activas o desactivas el filtro, modificas la puntuación de spam y las acciones. Opcionalmente defines excepciones por remitente o dominio.

**Uso en la industria:** Estándar en cualquier servidor de correo. Sin filtros antispam el buzón se llena de basura y aumenta el riesgo de que los usuarios abran enlaces maliciosos. Se combina con filtros globales y por cuenta.

---

## 13. Email Marketing (Email marketing)

**Qué es:** Herramienta de cPanel para envío de correo masivo (newsletters, campañas) o enlace a servicios de marketing por email integrados con el panel.

**Para qué sirve:**
- Enviar newsletters o anuncios a una lista de suscriptores.
- Realizar campañas promocionales o informativas desde el mismo hosting.

**Cómo se utiliza:**
- Depende del host: puede ser un módulo propio para crear y enviar campañas o un acceso a un servicio externo (p. ej. integrado con el panel). Se configuran listas, plantillas y envíos.

**Uso en la industria:** Para volúmenes pequeños o pruebas puede bastar. Para marketing serio (muchos suscriptores, métricas, automatizaciones) la industria suele usar plataformas dedicadas (Mailchimp, SendGrid, Constant Contact, etc.). La opción de cPanel sirve como punto de partida o uso muy básico.

---

## 14. Encryption (Cifrado)

**Qué es:** Gestión de cifrado para el correo: claves GnuPG (GPG) por cuenta y opciones de SSL/TLS para las conexiones de los clientes de correo.

**Para qué sirve:**
- Cifrado de extremo a extremo con GPG (solo el destinatario con la clave puede leer el mensaje).
- Asegurar que las conexiones IMAP/POP/SMTP usen SSL/TLS y no se envíen contraseñas en claro.

**Cómo se utiliza:**
- Generas o importas claves GPG para una cuenta y, si el cliente lo soporta, firmas/cifras mensajes. La parte SSL/TLS suele estar en la configuración del servidor y en las instrucciones que se dan a los usuarios para configurar Outlook, Thunderbird, etc.

**Uso en la industria:** Importante en sectores con datos sensibles (salud, legal, finanzas) y para cumplir buenas prácticas de seguridad. No todo el mundo usa GPG en el día a día, pero el uso de SSL/TLS para correo es considerado estándar.

---

## 15. Calendars and Contacts Configuration

**Qué es:** Proporciona instrucciones y datos para configurar clientes (Outlook, Thunderbird, Apple, móviles) y que sincronicen calendarios (CalDAV) y contactos (CardDAV) alojados en el servidor.

**Para qué sirve:**
- Que los usuarios vean el mismo calendario y la misma libreta de contactos en el escritorio y en el móvil.
- Centralizar agendas y contactos en el servidor en lugar de solo en un dispositivo.

**Cómo se utiliza:**
- El usuario consulta la sección, elige su cliente o sistema operativo y sigue los pasos (URLs CalDAV/CardDAV, usuario, contraseña) para añadir la cuenta de calendario/contactos.

**Uso en la industria:** Útil en empresas que quieren calendario y contactos compartidos sin depender solo de Google/Microsoft. Menos común que el correo solo, pero habitual cuando se usa la suite de correo+calendario+contactos del hosting.

---

## 16. Calendars and Contacts Sharing

**Qué es:** Gestión de **permisos** para compartir calendarios y libretas de contactos con otros usuarios o equipos.

**Para qué sirve:**
- Compartir un calendario con un compañero (solo lectura o edición).
- Compartir una libreta de contactos de un departamento.
- Publicar calendarios de solo lectura (ej. horarios de atención).

**Cómo se utiliza:**
- Desde esta sección (o desde la de gestión de calendarios/contactos) defines con quién se comparte cada calendario o libreta y con qué nivel de acceso.

**Uso en la industria:** Facilita el trabajo en equipo y la coordinación. Se usa cuando la organización quiere calendarios y contactos en su propio servidor en lugar de solo en servicios en la nube externos.

---

## 17. Calendars and Contacts Management

**Qué es:** Interfaz web para crear, editar y eliminar eventos de calendario y contactos directamente en el servidor (suele estar integrada con webmail, p. ej. Horde o Roundcube).

**Para qué sirve:**
- Gestionar agendas y contactos desde el navegador sin instalar un programa.
- Mantener los datos en el servidor para que se sincronicen con los clientes configurados (ver punto 15).

**Cómo se utiliza:**
- Accedes desde el panel o webmail a la parte de calendario y contactos y añades/editas eventos y contactos como en cualquier aplicación de agenda.

**Uso en la industria:** Complementa la configuración y el uso de CalDAV/CardDAV. Es la opción para quien prefiere administrar todo desde la web en lugar de solo desde el cliente de escritorio o móvil.

---

## 18. Email Disk Usage (Uso de disco)

**Qué es:** Resumen del espacio en disco que consume cada cuenta de correo del dominio.

**Para qué sirve:**
- Ver qué buzones ocupan más espacio.
- Detectar cuentas que conviene limpiar, archivar o limitar con cuotas para no agotar el espacio del hosting.

**Cómo se utiliza:**
- Abres la herramienta y ves la lista de cuentas con su uso (MB/GB). Con esa información puedes pedir a los usuarios que borren o archiven correo o ajustar cuotas en *Email Accounts*.

**Uso en la industria:** Parte de la administración habitual del correo. Evita quedarse sin espacio y ayuda a planificar almacenamiento o políticas de retención de correo.

---

## Resumen rápido: ¿Qué usar para qué?

| Objetivo | Herramienta principal |
|----------|------------------------|
| Crear `info@wholeself.com` u otras cuentas | **Email Accounts** |
| Que un correo se reenvíe a otro sin tener buzón | **Forwarders** |
| Usar Gmail/Outlook con tu dominio | **Email Routing** (+ DNS) |
| Mensaje automático al recibir un correo | **Autoresponders** |
| Recibir todo lo que llegue a direcciones no definidas | **Default Address** |
| Enviar un correo a muchas personas (lista) | **Mailing Lists** |
| Ver por qué un correo no llegó | **Track Delivery** |
| Reglas para todas las cuentas del dominio | **Global Email Filters** |
| Reglas solo para tu buzón | **Email Filters** |
| Que tus envíos no vayan a spam | **Email Deliverability** |
| Crear muchas cuentas a la vez | **Address Importer** |
| Reducir spam y phishing | **Spam Filters** |
| Newsletters o campañas básicas | **Email Marketing** |
| Cifrado y seguridad del correo | **Encryption** |
| Calendario y contactos en el servidor | **Calendars and Contacts** (Configuration, Sharing, Management) |
| Ver quién gasta más espacio en correo | **Email Disk Usage** |

---

*Documento creado para el proyecto Whole Self. Puedes ir leyendo por secciones y ampliar con la documentación de tu proveedor (cPanel/Bluehost) cuando necesites más detalle sobre una herramienta concreta.*
