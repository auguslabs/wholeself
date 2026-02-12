<?php
/**
 * GET /api/team-members.php
 * Devuelve { members: [...] } desde team_members (misma BD que los formularios).
 * Campos en camelCase para el frontend.
 */
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(204); exit; }
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
  echo json_encode(['ok' => false, 'error' => 'Method not allowed']);
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

  $result = $conn->query('SELECT id, photo_filename, first_name, last_name, credentials, pronouns, role, role_es, language, description_en, description_es, display_order FROM team_members ORDER BY display_order ASC');
  $conn->close();

  if (!$result) {
    http_response_code(500);
    echo json_encode(['ok' => false, 'error' => 'Query failed']);
    exit;
  }

  $members = [];
  while ($row = $result->fetch_assoc()) {
    $members[] = [
      'id' => (string)($row['id'] ?? ''),
      'photoFilename' => (string)($row['photo_filename'] ?? ''),
      'firstName' => (string)($row['first_name'] ?? ''),
      'lastName' => (string)($row['last_name'] ?? ''),
      'credentials' => (string)($row['credentials'] ?? ''),
      'pronouns' => (string)($row['pronouns'] ?? ''),
      'role' => (string)($row['role'] ?? ''),
      'roleEs' => $row['role_es'] !== null && $row['role_es'] !== '' ? (string)$row['role_es'] : null,
      'language' => (string)($row['language'] ?? 'english'),
      'descriptionEn' => (string)($row['description_en'] ?? ''),
      'descriptionEs' => (string)($row['description_es'] ?? ''),
      'displayOrder' => (int)($row['display_order'] ?? 0),
    ];
  }

  echo json_encode(['members' => $members]);
} catch (Throwable $e) {
  error_log('[team-members.php] ' . $e->getMessage());
  http_response_code(500);
  echo json_encode(['ok' => false, 'error' => 'Failed to load team members']);
}
