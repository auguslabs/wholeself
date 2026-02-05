<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(204); exit; }
if ($_SERVER['REQUEST_METHOD'] !== 'POST') { echo json_encode(['ok' => false, 'error' => 'Method not allowed']); exit; }
if (strpos($_SERVER['CONTENT_TYPE'] ?? '', 'application/json') === false) { echo json_encode(['ok' => false, 'error' => 'Content-Type must be application/json']); exit; }

try {
  $raw = file_get_contents('php://input');
  $data = json_decode($raw, true);
  if (!is_array($data)) { echo json_encode(['ok' => false, 'error' => 'Invalid JSON']); exit; }

  $your_name = trim($data['yourName'] ?? '');
  if ($your_name === '') { echo json_encode(['ok' => false, 'error' => 'yourName is required']); exit; }
  $your_name = substr($your_name, 0, 255);
  $relationship = substr(trim($data['relationship'] ?? ''), 0, 50);
  $phone = substr(trim($data['phone'] ?? ''), 0, 50);
  $email = substr(trim($data['email'] ?? ''), 0, 255);
  $contact_method = substr(trim($data['contactMethod'] ?? ''), 0, 50);
  $situation = trim($data['situation'] ?? '');
  $questions = trim($data['questions'] ?? '');
  $how_help = trim($data['howHelp'] ?? '');
  $language = substr(trim($data['language'] ?? ''), 0, 2);

  $configFile = __DIR__ . '/db_config.php';
  if (!is_file($configFile)) {
    $msg = 'Server: db_config.php not found in api/forms/';
    error_log('[loved-one-needs-help.php] ' . $msg);
    echo json_encode(['ok' => false, 'error' => $msg]); exit;
  }
  require $configFile;

  $conn = new mysqli(DB_HOST, DB_USER, DB_PASSWORD, DB_NAME);
  if ($conn->connect_error) {
    $msg = 'DB connection: ' . $conn->connect_error;
    error_log('[loved-one-needs-help.php] ' . $msg);
    echo json_encode(['ok' => false, 'error' => $msg]); exit;
  }
  $conn->set_charset('utf8mb4');

  $stmt = $conn->prepare('INSERT INTO form_loved_one (your_name, relationship, phone, email, contact_method, situation, questions, how_help, language) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)');
  if (!$stmt) {
    $msg = 'DB prepare: ' . $conn->error;
    error_log('[loved-one-needs-help.php] ' . $msg);
    echo json_encode(['ok' => false, 'error' => $msg]); exit;
  }
  $stmt->bind_param('sssssssss', $your_name, $relationship, $phone, $email, $contact_method, $situation, $questions, $how_help, $language);
  if (!$stmt->execute()) {
    $msg = 'DB save: ' . $stmt->error;
    error_log('[loved-one-needs-help.php] ' . $msg);
    echo json_encode(['ok' => false, 'error' => $msg]); exit;
  }
  $stmt->close();
  $conn->close();
  echo json_encode(['ok' => true]);
} catch (Throwable $e) {
  $msg = 'Server error: ' . $e->getMessage();
  error_log('[loved-one-needs-help.php] ' . $msg . ' at ' . $e->getFile() . ':' . $e->getLine());
  echo json_encode(['ok' => false, 'error' => $msg]);
}
