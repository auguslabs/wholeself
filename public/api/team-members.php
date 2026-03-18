<?php
/**
 * GET    /api/team-members        → { members: [...] }
 * GET    /api/team-members/:id    → un miembro (id varchar ej. member-10)
 * POST   /api/team-members        → crear (X-API-Key, mismo que content API)
 * PUT/PATCH /api/team-members/:id → actualizar
 * DELETE /api/team-members/:id    → eliminar
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
$memberId = trim($_GET['id'] ?? '');

$configFile = __DIR__ . '/forms/db_config.php';
if (!is_file($configFile)) {
  http_response_code(500);
  echo json_encode(['ok' => false, 'error' => 'Server config not found']);
  exit;
}
require $configFile;

function rowToMember($row) {
  return [
    'id' => (string)($row['id'] ?? ''),
    'photoFilename' => (string)($row['photo_filename'] ?? ''),
    'firstName' => (string)($row['first_name'] ?? ''),
    'lastName' => (string)($row['last_name'] ?? ''),
    'credentials' => (string)($row['credentials'] ?? ''),
    'pronouns' => (string)($row['pronouns'] ?? ''),
    'role' => (string)($row['role'] ?? ''),
    'roleEs' => isset($row['role_es']) && $row['role_es'] !== null && $row['role_es'] !== '' ? (string)$row['role_es'] : null,
    'language' => (string)($row['language'] ?? 'english'),
    'descriptionEn' => (string)($row['description_en'] ?? ''),
    'descriptionEs' => (string)($row['description_es'] ?? ''),
    'displayOrder' => (int)($row['display_order'] ?? 0),
  ];
}

/**
 * Normaliza valores que pueden venir como string o array/objeto desde editores.
 * - string/number/bool -> string
 * - null -> ''
 * - { en, es } -> en (caller puede usar es por separado)
 * - [..] -> join(', ') si son escalares; si no, json_encode
 */
function coerceText($v): string {
  if ($v === null) return '';
  if (is_string($v)) return $v;
  if (is_int($v) || is_float($v) || is_bool($v)) return (string)$v;
  if (is_array($v)) {
    // Localized object: { en, es }
    if (array_key_exists('en', $v) || array_key_exists('es', $v)) {
      $en = $v['en'] ?? '';
      if (is_string($en)) return $en;
      if ($en === null) return '';
      return is_scalar($en) ? (string)$en : json_encode($en, JSON_UNESCAPED_UNICODE);
    }
    // List: [a, b, c]
    $allScalar = true;
    foreach ($v as $item) {
      if (!is_scalar($item) && $item !== null) { $allScalar = false; break; }
    }
    if ($allScalar) {
      $parts = [];
      foreach ($v as $item) {
        $s = $item === null ? '' : (string)$item;
        if (trim($s) !== '') $parts[] = $s;
      }
      return implode(', ', $parts);
    }
    $json = json_encode($v, JSON_UNESCAPED_UNICODE);
    return $json !== false ? $json : '';
  }
  // object/resource
  $json = json_encode($v, JSON_UNESCAPED_UNICODE);
  return $json !== false ? $json : '';
}

function coerceNullableText($v): ?string {
  if ($v === null) return null;
  $s = coerceText($v);
  return $s === '' ? null : $s;
}

/** Devuelve el texto localized.es cuando $v es {en,es}. */
function coerceTextEs($v): string {
  if (is_array($v) && (array_key_exists('en', $v) || array_key_exists('es', $v))) {
    $es = $v['es'] ?? '';
    if ($es === null) return '';
    if (is_string($es)) return $es;
    return is_scalar($es) ? (string)$es : (json_encode($es, JSON_UNESCAPED_UNICODE) ?: '');
  }
  return '';
}

/** Resuelve id de fila (varchar member-N o literal). */
function resolveTeamMemberId(mysqli $conn, string $raw): ?string {
  if ($raw === '') {
    return null;
  }
  $stmt = $conn->prepare('SELECT id FROM team_members WHERE id = ? LIMIT 1');
  if (!$stmt) {
    return null;
  }
  $stmt->bind_param('s', $raw);
  if (!$stmt->execute()) { $stmt->close(); return null; }
  $id = null;
  $stmt->bind_result($id);
  $ok = $stmt->fetch();
  $stmt->close();
  if ($ok && $id !== null && $id !== '') {
    return (string)$id;
  }
  if (preg_match('/^\d+$/', $raw)) {
    $alt = 'member-' . $raw;
    $stmt = $conn->prepare('SELECT id FROM team_members WHERE id = ? LIMIT 1');
    $stmt->bind_param('s', $alt);
    if (!$stmt->execute()) { $stmt->close(); return null; }
    $id2 = null;
    $stmt->bind_result($id2);
    $ok2 = $stmt->fetch();
    $stmt->close();
    if ($ok2 && $id2 !== null && $id2 !== '') {
      return (string)$id2;
    }
  }
  return null;
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

/** Siguiente id member-N (numérico). */
function nextTeamMemberId(mysqli $conn): string {
  $max = 0;
  $res = $conn->query("SELECT id FROM team_members WHERE id REGEXP '^member-[0-9]+$'");
  if ($res) {
    while ($row = $res->fetch_assoc()) {
      if (preg_match('/^member-(\d+)$/', (string)$row['id'], $m)) {
        $max = max($max, (int)$m[1]);
      }
    }
  }
  return 'member-' . ($max + 1);
}

try {
  $conn = new mysqli(DB_HOST, DB_USER, DB_PASSWORD, DB_NAME);
  if ($conn->connect_error) {
    http_response_code(500);
    echo json_encode(['ok' => false, 'error' => 'Database connection failed']);
    exit;
  }
  $conn->set_charset('utf8mb4');

  // ---------- POST crear ----------
  if ($method === 'POST' && $memberId === '') {
    requireContentApiKey();
    $raw = file_get_contents('php://input');
    $body = is_string($raw) ? json_decode($raw, true) : null;
    if (!is_array($body)) {
      $conn->close();
      http_response_code(400);
      echo json_encode(['ok' => false, 'error' => 'Invalid JSON body']);
      exit;
    }
    $newId = isset($body['id']) ? trim((string)$body['id']) : '';
    if ($newId === '') {
      $newId = nextTeamMemberId($conn);
    } else {
      $chk = $conn->prepare('SELECT 1 FROM team_members WHERE id = ? LIMIT 1');
      $chk->bind_param('s', $newId);
      if (!$chk->execute()) { $chk->close(); $conn->close(); http_response_code(500); echo json_encode(['ok' => false, 'error' => 'Query failed']); exit; }
      $exists = null;
      $chk->bind_result($exists);
      $found = $chk->fetch();
      if ($found) {
        $chk->close();
        $conn->close();
        http_response_code(409);
        echo json_encode(['ok' => false, 'error' => 'Member id already exists']);
        exit;
      }
      $chk->close();
    }
    // Augushub manda: photo, name {en,es}, role {en,es}, credentials {en,es}, description {en,es}
    $photoFilename = coerceText($body['photoFilename'] ?? ($body['photo'] ?? ''));
    $firstName = coerceText($body['firstName'] ?? '');
    $lastName = coerceText($body['lastName'] ?? '');
    if ($firstName === '' && isset($body['name'])) {
      // name puede venir como "Andrea Lucero" o {en,es}
      $full = coerceText($body['name']);
      if (trim($full) !== '') {
        $parts = preg_split('/\s+/', trim($full));
        if ($parts && count($parts) > 0) {
          $firstName = array_shift($parts);
          $lastName = implode(' ', $parts);
        }
      }
    }
    $credentials = coerceText($body['credentials'] ?? '');
    $pronouns = coerceText($body['pronouns'] ?? '');
    $role = coerceText($body['role'] ?? 'Team member');
    $roleEs = '';
    if (array_key_exists('roleEs', $body)) {
      $roleEs = coerceText($body['roleEs']);
    } elseif (isset($body['role'])) {
      $roleEs = coerceTextEs($body['role']);
    }
    $language = coerceText($body['language'] ?? 'english');
    $descriptionEn = coerceText($body['descriptionEn'] ?? ($body['description'] ?? ''));
    $descriptionEs = coerceText($body['descriptionEs'] ?? (isset($body['description']) ? coerceTextEs($body['description']) : ''));
    $displayOrder = isset($body['displayOrder']) ? (int)$body['displayOrder'] : 0;
    if ($displayOrder <= 0) {
      $r = $conn->query('SELECT COALESCE(MAX(display_order), 0) + 1 AS n FROM team_members');
      if ($r && ($x = $r->fetch_assoc())) {
        $displayOrder = (int)$x['n'];
      } else {
        $displayOrder = 1;
      }
    }

    $stmt = $conn->prepare('INSERT INTO team_members (id, photo_filename, first_name, last_name, credentials, pronouns, role, role_es, language, description_en, description_es, display_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
    if (!$stmt) {
      $conn->close();
      http_response_code(500);
      echo json_encode(['ok' => false, 'error' => 'Query failed']);
      exit;
    }
    $stmt->bind_param('sssssssssssi', $newId, $photoFilename, $firstName, $lastName, $credentials, $pronouns, $role, $roleEs, $language, $descriptionEn, $descriptionEs, $displayOrder);
    if (!$stmt->execute()) {
      $stmt->close();
      $conn->close();
      http_response_code(500);
      echo json_encode(['ok' => false, 'error' => 'Insert failed: ' . $conn->error]);
      exit;
    }
    $stmt->close();
    $stmt2 = $conn->prepare('SELECT id, photo_filename, first_name, last_name, credentials, pronouns, role, role_es, language, description_en, description_es, display_order FROM team_members WHERE id = ? LIMIT 1');
    $stmt2->bind_param('s', $newId);
    if (!$stmt2->execute()) { $stmt2->close(); $conn->close(); http_response_code(500); echo json_encode(['ok' => false, 'error' => 'Query failed']); exit; }
    $id = $photo_filename = $first_name = $last_name = $credentials = $pronouns = $role = $role_es = $language = $description_en = $description_es = null;
    $display_order = 0;
    $stmt2->bind_result($id, $photo_filename, $first_name, $last_name, $credentials, $pronouns, $role, $role_es, $language, $description_en, $description_es, $display_order);
    $okRow = $stmt2->fetch();
    $stmt2->close();
    $conn->close();
    http_response_code(201);
    echo json_encode($okRow ? rowToMember([
      'id' => $id,
      'photo_filename' => $photo_filename,
      'first_name' => $first_name,
      'last_name' => $last_name,
      'credentials' => $credentials,
      'pronouns' => $pronouns,
      'role' => $role,
      'role_es' => $role_es,
      'language' => $language,
      'description_en' => $description_en,
      'description_es' => $description_es,
      'display_order' => $display_order,
    ]) : ['ok' => true, 'id' => $newId]);
    exit;
  }

  // ---------- GET un miembro ----------
  if ($method === 'GET' && $memberId !== '') {
    $idDb = resolveTeamMemberId($conn, $memberId);
    if ($idDb === null) {
      $conn->close();
      http_response_code(404);
      echo json_encode(['ok' => false, 'error' => 'Team member not found']);
      exit;
    }
    $stmt = $conn->prepare('SELECT id, photo_filename, first_name, last_name, credentials, pronouns, role, role_es, language, description_en, description_es, display_order FROM team_members WHERE id = ? LIMIT 1');
    $stmt->bind_param('s', $idDb);
    if (!$stmt->execute()) { $stmt->close(); $conn->close(); http_response_code(500); echo json_encode(['ok' => false, 'error' => 'Query failed']); exit; }
    $id = $photo_filename = $first_name = $last_name = $credentials = $pronouns = $role = $role_es = $language = $description_en = $description_es = null;
    $display_order = 0;
    $stmt->bind_result($id, $photo_filename, $first_name, $last_name, $credentials, $pronouns, $role, $role_es, $language, $description_en, $description_es, $display_order);
    $okRow = $stmt->fetch();
    $stmt->close();
    $conn->close();
    if (!$okRow) {
      http_response_code(404);
      echo json_encode(['ok' => false, 'error' => 'Team member not found']);
      exit;
    }
    echo json_encode(rowToMember([
      'id' => $id,
      'photo_filename' => $photo_filename,
      'first_name' => $first_name,
      'last_name' => $last_name,
      'credentials' => $credentials,
      'pronouns' => $pronouns,
      'role' => $role,
      'role_es' => $role_es,
      'language' => $language,
      'description_en' => $description_en,
      'description_es' => $description_es,
      'display_order' => $display_order,
    ]));
    exit;
  }

  // ---------- PUT/PATCH ----------
  if (($method === 'PUT' || $method === 'PATCH') && $memberId !== '') {
    requireContentApiKey();
    $idDb = resolveTeamMemberId($conn, $memberId);
    if ($idDb === null) {
      $conn->close();
      http_response_code(404);
      echo json_encode(['ok' => false, 'error' => 'Team member not found']);
      exit;
    }
    $raw = file_get_contents('php://input');
    $body = is_string($raw) ? json_decode($raw, true) : null;
    if (!is_array($body)) {
      $conn->close();
      http_response_code(400);
      echo json_encode(['ok' => false, 'error' => 'Invalid JSON body']);
      exit;
    }
    $updates = [];
    $types = '';
    $params = [];
    if (isset($body['photoFilename']) || isset($body['photo'])) {
      $updates[] = 'photo_filename = ?';
      $types .= 's';
      $params[] = coerceText($body['photoFilename'] ?? ($body['photo'] ?? ''));
    }
    if (isset($body['firstName'])) {
      $updates[] = 'first_name = ?';
      $types .= 's';
      $params[] = coerceText($body['firstName']);
    }
    if (isset($body['lastName'])) {
      $updates[] = 'last_name = ?';
      $types .= 's';
      $params[] = coerceText($body['lastName']);
    }
    // Augushub puede mandar name {en,es} (si no manda first/last)
    if (!isset($body['firstName']) && !isset($body['lastName']) && isset($body['name'])) {
      $full = coerceText($body['name']);
      if (trim($full) !== '') {
        $parts = preg_split('/\s+/', trim($full));
        $fn = $parts && count($parts) > 0 ? array_shift($parts) : '';
        $ln = $parts ? implode(' ', $parts) : '';
        $updates[] = 'first_name = ?';
        $types .= 's';
        $params[] = $fn;
        $updates[] = 'last_name = ?';
        $types .= 's';
        $params[] = $ln;
      }
    }
    if (isset($body['credentials'])) {
      $updates[] = 'credentials = ?';
      $types .= 's';
      $params[] = coerceText($body['credentials']);
    }
    if (isset($body['pronouns'])) {
      $updates[] = 'pronouns = ?';
      $types .= 's';
      $params[] = coerceText($body['pronouns']);
    }
    if (isset($body['role'])) {
      $updates[] = 'role = ?';
      $types .= 's';
      $params[] = coerceText($body['role']);
      // Si role viene localized {en,es}, aprovechar para role_es.
      $roleEsFromRole = coerceTextEs($body['role']);
      if ($roleEsFromRole !== '') {
        $updates[] = 'role_es = ?';
        $types .= 's';
        $params[] = $roleEsFromRole;
      }
    }
    if (array_key_exists('roleEs', $body)) {
      $updates[] = 'role_es = ?';
      $types .= 's';
      $params[] = $body['roleEs'] !== null ? coerceText($body['roleEs']) : '';
    }
    if (isset($body['language'])) {
      $updates[] = 'language = ?';
      $types .= 's';
      $params[] = coerceText($body['language']);
    }
    if (isset($body['descriptionEn']) || isset($body['description'])) {
      $updates[] = 'description_en = ?';
      $types .= 's';
      $params[] = coerceText($body['descriptionEn'] ?? ($body['description'] ?? ''));
    }
    if (isset($body['descriptionEs']) || (isset($body['description']) && coerceTextEs($body['description']) !== '')) {
      $updates[] = 'description_es = ?';
      $types .= 's';
      $params[] = coerceText($body['descriptionEs'] ?? coerceTextEs($body['description']));
    }
    if (isset($body['displayOrder'])) {
      $updates[] = 'display_order = ?';
      $types .= 'i';
      $params[] = (int)$body['displayOrder'];
    }
    if (count($updates) === 0) {
      $conn->close();
      http_response_code(400);
      echo json_encode(['ok' => false, 'error' => 'No fields to update']);
      exit;
    }
    $params[] = $idDb;
    $types .= 's';
    $sql = 'UPDATE team_members SET ' . implode(', ', $updates) . ' WHERE id = ?';
    $stmt = $conn->prepare($sql);
    $stmt->bind_param($types, ...$params);
    $stmt->execute();
    $stmt->close();
    $stmt2 = $conn->prepare('SELECT id, photo_filename, first_name, last_name, credentials, pronouns, role, role_es, language, description_en, description_es, display_order FROM team_members WHERE id = ? LIMIT 1');
    $stmt2->bind_param('s', $idDb);
    if (!$stmt2->execute()) { $stmt2->close(); $conn->close(); http_response_code(500); echo json_encode(['ok' => false, 'error' => 'Query failed']); exit; }
    $id = $photo_filename = $first_name = $last_name = $credentials = $pronouns = $role = $role_es = $language = $description_en = $description_es = null;
    $display_order = 0;
    $stmt2->bind_result($id, $photo_filename, $first_name, $last_name, $credentials, $pronouns, $role, $role_es, $language, $description_en, $description_es, $display_order);
    $okRow = $stmt2->fetch();
    $stmt2->close();
    $conn->close();
    echo json_encode($okRow ? rowToMember([
      'id' => $id,
      'photo_filename' => $photo_filename,
      'first_name' => $first_name,
      'last_name' => $last_name,
      'credentials' => $credentials,
      'pronouns' => $pronouns,
      'role' => $role,
      'role_es' => $role_es,
      'language' => $language,
      'description_en' => $description_en,
      'description_es' => $description_es,
      'display_order' => $display_order,
    ]) : ['ok' => true]);
    exit;
  }

  // ---------- DELETE ----------
  if ($method === 'DELETE' && $memberId !== '') {
    requireContentApiKey();
    $idDb = resolveTeamMemberId($conn, $memberId);
    if ($idDb === null) {
      $conn->close();
      http_response_code(404);
      echo json_encode(['ok' => false, 'error' => 'Team member not found']);
      exit;
    }
    $stmt = $conn->prepare('DELETE FROM team_members WHERE id = ?');
    $stmt->bind_param('s', $idDb);
    $stmt->execute();
    $aff = $stmt->affected_rows;
    $stmt->close();
    $conn->close();
    if ($aff < 1) {
      http_response_code(404);
      echo json_encode(['ok' => false, 'error' => 'Team member not found']);
      exit;
    }
    echo json_encode(['ok' => true]);
    exit;
  }

  // ---------- GET lista ----------
  if ($method !== 'GET') {
    $conn->close();
    http_response_code(405);
    echo json_encode(['ok' => false, 'error' => 'Method not allowed']);
    exit;
  }

  $result = $conn->query('SELECT id, photo_filename, first_name, last_name, credentials, pronouns, role, role_es, language, description_en, description_es, display_order FROM team_members ORDER BY display_order ASC');
  $conn->close();

  if (!$result) {
    http_response_code(500);
    echo json_encode(['ok' => false, 'error' => 'Query failed']);
    exit;
  }

  $members = [];
  while ($row = $result->fetch_assoc()) {
    $members[] = rowToMember($row);
  }

  echo json_encode(['members' => $members]);
} catch (Throwable $e) {
  error_log('[team-members.php] ' . $e->getMessage());
  http_response_code(500);
  echo json_encode(['ok' => false, 'error' => 'Failed to load team members']);
}
