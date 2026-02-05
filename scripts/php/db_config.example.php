<?php
/**
 * Configuración de la base de datos para los formularios (plantilla).
 *
 * NUNCA subas db_config.php con credenciales reales a GitHub.
 *
 * En el servidor:
 * 1. Copia este archivo como db_config.php
 * 2. Sustituye los valores por los datos reales de cPanel (MySQL)
 * 3. db_config.php está en .gitignore y no se incluye en el repositorio
 */
define('DB_HOST', 'localhost');
define('DB_USER', 'TU_USUARIO_MYSQL');
define('DB_PASSWORD', 'TU_PASSWORD_MYSQL');
define('DB_NAME', 'TU_BASE_DE_DATOS');
