<?php
/**
 * Configuración de la base de datos y notificaciones por correo (plantilla).
 *
 * NUNCA subas db_config.php con credenciales reales a GitHub.
 *
 * En el servidor:
 * 1. Copia este archivo como db_config.php
 * 2. Sustituye los valores por los datos reales de cPanel (MySQL)
 * 3. Rellena RESEND_API_KEY y los correos de notificación
 * 4. db_config.php está en .gitignore y no se incluye en el repositorio
 */

// Base de datos (formularios)
define('DB_HOST', 'localhost');
define('DB_USER', 'TU_USUARIO_MYSQL');
define('DB_PASSWORD', 'TU_PASSWORD_MYSQL');
define('DB_NAME', 'TU_BASE_DE_DATOS');

// Notificaciones: correos que reciben el aviso cuando alguien envía un formulario
define('NOTIFY_EMAIL_1', 'wholeself.auguslabs@gmail.com');
define('NOTIFY_EMAIL_2', 'augux607@gmail.com');

// Resend (resend.com). Plan gratuito ~100 emails/día.
// API Key: Resend → API Keys → Create → copiar (empieza por re_).
define('RESEND_API_KEY', 're_xxxxxxxxxxxxxxxxxxxxxxxx');

// Remitente del correo. Prueba: onboarding@resend.dev. Producción: verifica tu dominio en Resend y usa ej. noreply@tudominio.com
define('NOTIFY_FROM_RESEND', 'onboarding@resend.dev');
