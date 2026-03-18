<?php
/**
 * Proveedores de seguro (tabla insurance_provider).
 * GET  /api/insurance-providers     → lista (público, mismo origen que rates).
 * POST /api/insurance-providers    → crear (X-API-Key, mismo que content API).
 * PATCH/PUT /api/insurance-providers/:id → actualizar
 * DELETE /api/insurance-providers/:id → eliminar
 *
 * Body JSON (POST/PATCH): nameEn, nameEs (opcional), logoUrl, displayOrder (opcional).
 */
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, X-API-Key, Authorization');
if (($_SERVER['REQUEST_METHOD'] ?? '') === 'OPTIONS') {
  http_response_code(204);
  exit;
}

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
$id = trim($_GET['id'] ?? '');

$configFile = __DIR__ . '/forms/db_config.php';
if (!is_file($configFile)) {
  http_response_code(500);
  echo json_encode(['ok' => false, 'error' => 'Server config not found']);
  exit;
}
require $configFile;

function rowToProvider($row) {
  return [
    'id' => (int)($row['id'] ?? 0),
    'nameEn' => (string)($row['name_en'] ?? ''),
    'nameEs' => (string)($row['name_es'] ?? ''),
    'logoUrl' => (string)($row['logo_url'] ?? ''),
    'displayOrder' => (int)($row['display_order'] ?? 0),
  ];
}

function requireContentApiKey() {
  $configApiFile = __DIR__ . '/content_api_config.php';
  if (!is_file($configApiFile)) {
    http_response_code(500);
    echo json_encode(['ok' => false, 'error' => 'Content API config not found']);
    exit;
  }
  require $configApiFile;
  if (!defined('CONTENT_API_KEY') || CONTENT_API_KEY === '' || CONTENT_API_KEY === 'cambiar-por-clave-secreta-generada') {
    http_response_code(500);
    echo json_encode(['ok' => false, 'error' => 'CONTENT_API_KEY not configured']);
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
}

try {
  $conn = new mysqli(DB_HOST, DB_USER, DB_PASSWORD, DB_NAME);
  if ($conn->connect_error) {
    http_response_code(500);
    echo json_encode(['ok' => false, 'error' => 'Database connection failed']);
    exit;
  }
  $conn->set_charset('utf8mb4');

  // ---------- GET lista o uno por id ----------
  if ($method === 'GET') {
    if ($id !== '' && ctype_digit($id)) {
      $stmt = $conn->prepare('SELECT id, name_en, name_es, logo_url, display_order FROM insurance_provider WHERE id = ? LIMIT 1');
      $iid = (int)$id;
      $stmt->bind_param('i', $iid);
      $stmt->execute();
      $res = $stmt->get_result();
      $row = $res ? $res->fetch_assoc() : null;
      $stmt->close();
      $conn->close();
      if (!$row) {
        http_response_code(404);
        echo json_encode(['ok' => false, 'error' => 'Provider not found']);
        exit;
      }
      echo json_encode(rowToProvider($row));
      exit;
    }
    $result = $conn->query('SELECT id, name_en, name_es, logo_url, display_order FROM insurance_provider ORDER BY display_order ASC, name_en ASC');
    $conn->close();
    if (!$result) {
      http_response_code(500);
      echo json_encode(['ok' => false, 'error' => 'Query failed']);
      exit;
    }
    $list = [];
    while ($row = $result->fetch_assoc()) {
      $list[] = rowToProvider($row);
    }
    echo json_encode(['providers' => $list]);
    exit;
  }

  requireContentApiKey();

  $raw = file_get_contents('php://input');
  $body = is_string($raw) ? json_decode($raw, true) : null;
  if (!is_array($body) && in_array($method, ['POST', 'PUT', 'PATCH'], true)) {
    $body = [];
  }

  // ---------- POST crear ----------
  if ($method === 'POST' && $id === '') {
    $nameEn = trim((string)($body['nameEn'] ?? $body['name_en'] ?? ''));
    $nameEs = trim((string)($body['nameEs'] ?? $body['name_es'] ?? $nameEn));
    $logoUrl = trim((string)($body['logoUrl'] ?? $body['logo_url'] ?? ''));
    if ($nameEn === '') {
      $conn->close();
      http_response_code(400);
      echo json_encode(['ok' => false, 'error' => 'nameEn required']);
      exit;
    }
    $order = isset($body['displayOrder']) ? (int)$body['displayOrder'] : null;
    if ($order === null || $order < 0) {
      $r = $conn->query('SELECT COALESCE(MAX(display_order), 0) + 1 AS n FROM insurance_provider');
      $order = 1;
      if ($r && ($x = $r->fetch_assoc())) {
        $order = (int)$x['n'];
      }
    }
    $stmt = $conn->prepare('INSERT INTO insurance_provider (name_en, name_es, logo_url, display_order) VALUES (?, ?, ?, ?)');
    if (!$stmt) {
      $conn->close();
      http_response_code(500);
      echo json_encode(['ok' => false, 'error' => 'Insert failed']);
      exit;
    }
    $stmt->bind_param('sssi', $nameEn, $nameEs, $logoUrl, $order);
    if (!$stmt->execute()) {
      $err = $stmt->error;
      $stmt->close();
      $conn->close();
      http_response_code(409);
      echo json_encode(['ok' => false, 'error' => 'Duplicate or invalid: ' . $err]);
      exit;
    }
    $newId = $conn->insert_id;
    $stmt->close();
    $stmt2 = $conn->prepare('SELECT id, name_en, name_es, logo_url, display_order FROM insurance_provider WHERE id = ? LIMIT 1');
    $stmt2->bind_param('i', $newId);
    $stmt2->execute();
    $res = $stmt2->get_result();
    $row = $res ? $res->fetch_assoc() : null;
    $stmt2->close();
    $conn->close();
    http_response_code(201);
    echo json_encode($row ? rowToProvider($row) : ['ok' => true, 'id' => $newId]);
    exit;
  }

  // ---------- PATCH/PUT por id ----------
  if (($method === 'PATCH' || $method === 'PUT') && $id !== '' && ctype_digit($id)) {
    $iid = (int)$id;
    $nameEn = array_key_exists('nameEn', $body) || array_key_exists('name_en', $body)
      ? trim((string)($body['nameEn'] ?? $body['name_en'] ?? '')) : null;
    $nameEs = array_key_exists('nameEs', $body) || array_key_exists('name_es', $body)
      ? trim((string)($body['nameEs'] ?? $body['name_es'] ?? '')) : null;
    $logoUrl = array_key_exists('logoUrl', $body) || array_key_exists('logo_url', $body)
      ? trim((string)($body['logoUrl'] ?? $body['logo_url'] ?? '')) : null;
    $displayOrder = isset($body['displayOrder']) ? (int)$body['displayOrder'] : null;

    $updates = [];
    $types = '';
    $params = [];
    if ($nameEn !== null && $nameEn !== '') {
      $updates[] = 'name_en = ?';
      $types .= 's';
      $params[] = $nameEn;
    }
    if ($nameEs !== null) {
      $updates[] = 'name_es = ?';
      $types .= 's';
      $params[] = $nameEs;
    }
    if ($logoUrl !== null) {
      $updates[] = 'logo_url = ?';
      $types .= 's';
      $params[] = $logoUrl;
    }
    if ($displayOrder !== null) {
      $updates[] = 'display_order = ?';
      $types .= 'i';
      $params[] = $displayOrder;
    }
    if (count($updates) === 0) {
      $conn->close();
      http_response_code(400);
      echo json_encode(['ok' => false, 'error' => 'No fields to update']);
      exit;
    }
    $params[] = $iid;
    $types .= 'i';
    $sql = 'UPDATE insurance_provider SET ' . implode(', ', $updates) . ' WHERE id = ?';
    $stmt = $conn->prepare($sql);
    $stmt->bind_param($types, ...$params);
    $stmt->execute();
    $stmt->close();
    $stmt2 = $conn->prepare('SELECT id, name_en, name_es, logo_url, display_order FROM insurance_provider WHERE id = ? LIMIT 1');
    $stmt2->bind_param('i', $iid);
    $stmt2->execute();
    $res = $stmt2->get_result();
    $row = $res ? $res->fetch_assoc() : null;
    $stmt2->close();
    $conn->close();
    if (!$row) {
      http_response_code(404);
      echo json_encode(['ok' => false, 'error' => 'Provider not found']);
      exit;
    }
    echo json_encode(rowToProvider($row));
    exit;
  }

  // ---------- DELETE ----------
  if ($method === 'DELETE' && $id !== '' && ctype_digit($id)) {
    $iid = (int)$id;
    $stmt = $conn->prepare('DELETE FROM insurance_provider WHERE id = ?');
    $stmt->bind_param('i', $iid);
    $stmt->execute();
    $aff = $stmt->affected_rows;
    $stmt->close();
    $conn->close();
    if ($aff < 1) {
      http_response_code(404);
      echo json_encode(['ok' => false, 'error' => 'Provider not found']);
      exit;
    }
    echo json_encode(['ok' => true]);
    exit;
  }

  $conn->close();
  http_response_code(405);
  echo json_encode(['ok' => false, 'error' => 'Method not allowed']);
} catch (Throwable $e) {
  error_log('[insurance-providers.php] ' . $e->getMessage());
  http_response_code(500);
  echo json_encode(['ok' => false, 'error' => 'Server error']);
}
