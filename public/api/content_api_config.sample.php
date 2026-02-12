<?php
/**
 * Configuración del endpoint de guardado de contenido (Augushub).
 * Copiar este archivo a content_api_config.php y definir la clave real.
 * No subas content_api_config.php con la clave al repositorio.
 */

// Clave que Augushub enviará en el header X-API-Key. Debe coincidir con la configurada en Augushub.
//
// ¿Dónde genero la clave? La generas UNA vez (en tu PC, en este proyecto o en Augushub, da igual).
// Luego la pones en DOS sitios: (1) aquí en content_api_config.php en el servidor de WholeSelf,
// y (2) en la config de Augushub (variable de entorno o panel del sitio), para que Augushub la envíe al llamar al endpoint.
// Generar en terminal:
//   Con PHP:  php -r "echo bin2hex(random_bytes(32));"
//   Con Node: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
//
if (!defined('CONTENT_API_KEY')) {
  define('CONTENT_API_KEY', 'cambiar-por-clave-secreta-generada');
}

// Orígenes permitidos para CORS (dominio de Augushub y desarrollo).
// Dejar vacío para permitir cualquier origen (*); en producción es mejor listar los orígenes.
if (!defined('CONTENT_API_CORS_ORIGINS')) {
  define('CONTENT_API_CORS_ORIGINS', [
    'https://augushub.com',
    'https://www.augushub.com',
    'http://localhost:5173',
    'http://127.0.0.1:5173',
  ]);
}
