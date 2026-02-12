<?php
/**
 * GET /api/content.php?pageId=xxx&locale=es
 * PUT /api/content/home (vía .htaccess) → guardado desde Augushub
 * Misma URL para lectura (GET) y escritura (PUT/POST).
 */
header('Content-Type: application/json; charset=utf-8');

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

// CORS: permitir origen de Augushub y métodos PUT/POST
$configApiFile = __DIR__ . '/content_api_config.php';
if (is_file($configApiFile)) {
  require $configApiFile;
  $corsOrigins = defined('CONTENT_API_CORS_ORIGINS') && is_array(CONTENT_API_CORS_ORIGINS) && count(CONTENT_API_CORS_ORIGINS) > 0
    ? CONTENT_API_CORS_ORIGINS
    : ['*'];
  $origin = $_SERVER['HTTP_ORIGIN'] ?? '';
  if ($origin !== '' && (in_array('*', $corsOrigins) || in_array($origin, $corsOrigins))) {
    header('Access-Control-Allow-Origin: ' . ($origin ?: '*'));
  } elseif (in_array('*', $corsOrigins)) {
    header('Access-Control-Allow-Origin: *');
  }
} else {
  header('Access-Control-Allow-Origin: *');
}
header('Access-Control-Allow-Methods: GET, PUT, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, X-API-Key, Authorization');
header('Access-Control-Max-Age: 86400');

if ($method === 'OPTIONS') {
  http_response_code(204);
  exit;
}

if (!in_array($method, ['GET', 'PUT', 'POST'], true)) {
  http_response_code(405);
  echo json_encode(['ok' => false, 'error' => 'Method not allowed']);
  exit;
}

$pageId = trim($_GET['pageId'] ?? '');

// ---------- Escritura (PUT/POST) desde Augushub ----------
if ($method === 'PUT' || $method === 'POST') {
  if (!is_file($configApiFile)) {
    http_response_code(500);
    echo json_encode(['ok' => false, 'error' => 'Content API config not found. Copy content_api_config.sample.php to content_api_config.php.']);
    exit;
  }
  require $configApiFile;
  if (!defined('CONTENT_API_KEY') || CONTENT_API_KEY === '' || CONTENT_API_KEY === 'cambiar-por-clave-secreta-generada') {
    http_response_code(500);
    echo json_encode(['ok' => false, 'error' => 'Content API key not configured. Set CONTENT_API_KEY in content_api_config.php.']);
    exit;
  }

  $apiKey = null;
  if (!empty($_SERVER['HTTP_X_API_KEY'])) {
    $apiKey = trim($_SERVER['HTTP_X_API_KEY']);
  } elseif (!empty($_SERVER['HTTP_AUTHORIZATION']) && preg_match('/^Bearer\s+(.+)$/i', $_SERVER['HTTP_AUTHORIZATION'], $m)) {
    $apiKey = trim($m[1]);
  }
  if ($apiKey === null || $apiKey !== CONTENT_API_KEY) {
    http_response_code(401);
    echo json_encode(['ok' => false, 'error' => 'Unauthorized']);
    exit;
  }

  $raw = file_get_contents('php://input');
  $body = $raw !== false ? json_decode($raw, true) : null;
  if (!is_array($body)) {
    http_response_code(400);
    echo json_encode(['ok' => false, 'error' => 'Invalid JSON body']);
    exit;
  }

  $meta = $body['meta'] ?? null;
  $seo = $body['seo'] ?? null;
  $content = $body['content'] ?? null;
  if (!is_array($meta) || !is_array($seo) || !is_array($content)) {
    http_response_code(400);
    echo json_encode(['ok' => false, 'error' => 'Body must include meta, seo, and content (objects)']);
    exit;
  }

  $bodyPageId = isset($meta['pageId']) ? trim((string) $meta['pageId']) : '';
  if ($pageId === '' && $bodyPageId === '') {
    http_response_code(400);
    echo json_encode(['ok' => false, 'error' => 'pageId required (URL or meta.pageId)']);
    exit;
  }
  if ($pageId === '') {
    $pageId = $bodyPageId;
  }
  if ($bodyPageId !== '' && $bodyPageId !== $pageId) {
    http_response_code(400);
    echo json_encode(['ok' => false, 'error' => 'Invalid page_id: URL and meta.pageId must match']);
    exit;
  }

  $configFile = __DIR__ . '/forms/db_config.php';
  if (!is_file($configFile)) {
    http_response_code(500);
    echo json_encode(['ok' => false, 'error' => 'Server config not found']);
    exit;
  }
  require $configFile;

  try {
    $conn = new mysqli(DB_HOST, DB_USER, DB_PASSWORD, DB_NAME);
    if ($conn->connect_error) {
      http_response_code(500);
      echo json_encode(['ok' => false, 'error' => 'Database connection failed']);
      exit;
    }
    $conn->set_charset('utf8mb4');

    $metaJson = json_encode($meta, JSON_UNESCAPED_UNICODE);
    $seoJson = json_encode($seo, JSON_UNESCAPED_UNICODE);
    $contentJson = json_encode($content, JSON_UNESCAPED_UNICODE);
    if ($metaJson === false || $seoJson === false || $contentJson === false) {
      $conn->close();
      http_response_code(400);
      echo json_encode(['ok' => false, 'error' => 'Invalid meta/seo/content encoding']);
      exit;
    }

    $stmt = $conn->prepare('UPDATE page_content SET meta = ?, seo = ?, content = ? WHERE page_id = ?');
    if (!$stmt) {
      $conn->close();
      http_response_code(500);
      echo json_encode(['ok' => false, 'error' => 'Query failed']);
      exit;
    }
    $stmt->bind_param('ssss', $metaJson, $seoJson, $contentJson, $pageId);
    $stmt->execute();
    $affected = $stmt->affected_rows;
    $stmt->close();
    $conn->close();

    if ($affected === 0) {
      http_response_code(404);
      echo json_encode(['ok' => false, 'error' => 'Page not found']);
      exit;
    }

    http_response_code(200);
    echo json_encode(['ok' => true]);
  } catch (Throwable $e) {
    error_log('[content.php PUT] ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(['ok' => false, 'error' => 'Failed to save content']);
  }
  exit;
}

// ---------- Lectura (GET) ----------
if ($pageId === '') {
  http_response_code(400);
  echo json_encode(['ok' => false, 'error' => 'pageId required']);
  exit;
}

$configFile = __DIR__ . '/forms/db_config.php';
if (!is_file($configFile)) {
  http_response_code(500);
  echo json_encode(['ok' => false, 'error' => 'Server config not found']);
  exit;
}
require $configFile;

try {
  $conn = new mysqli(DB_HOST, DB_USER, DB_PASSWORD, DB_NAME);
  if ($conn->connect_error) {
    http_response_code(500);
    echo json_encode(['ok' => false, 'error' => 'Database connection failed']);
    exit;
  }
  $conn->set_charset('utf8mb4');

  $stmt = $conn->prepare('SELECT meta, seo, content, updated_at FROM page_content WHERE page_id = ? LIMIT 1');
  if (!$stmt) {
    $conn->close();
    http_response_code(500);
    echo json_encode(['ok' => false, 'error' => 'Query failed']);
    exit;
  }
  $stmt->bind_param('s', $pageId);
  $stmt->execute();
  $result = $stmt->get_result();
  $row = $result->fetch_assoc();
  $stmt->close();
  $conn->close();

  if (!$row) {
    http_response_code(404);
    echo json_encode(['ok' => false, 'error' => 'Page not found']);
    exit;
  }

  $meta   = is_string($row['meta'])   ? json_decode($row['meta'], true)   : $row['meta'];
  $seo    = is_string($row['seo'])   ? json_decode($row['seo'], true)    : $row['seo'];
  $content = is_string($row['content']) ? json_decode($row['content'], true) : $row['content'];
  $updatedAt = isset($row['updated_at']) ? date('c', strtotime($row['updated_at'])) : null;

  echo json_encode([
    'meta' => $meta ?: (object)[],
    'seo' => $seo ?: (object)[],
    'content' => $content ?: (object)[],
    'updatedAt' => $updatedAt,
  ]);
} catch (Throwable $e) {
  error_log('[content.php GET] ' . $e->getMessage());
  http_response_code(500);
  echo json_encode(['ok' => false, 'error' => 'Failed to load content']);
}
