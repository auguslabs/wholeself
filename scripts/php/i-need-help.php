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

  $name = trim($data['name'] ?? '');
  if ($name === '') { echo json_encode(['ok' => false, 'error' => 'name is required']); exit; }
  $name = substr($name, 0, 255);
  $contact_method = substr(trim($data['contactMethod'] ?? ''), 0, 50);
  $phone = substr(trim($data['phone'] ?? ''), 0, 50);
  $email = substr(trim($data['email'] ?? ''), 0, 255);
  $best_time = substr(trim($data['bestTime'] ?? ''), 0, 50);
  $message = trim($data['message'] ?? '');
  $insurance = substr(trim($data['insurance'] ?? ''), 0, 255);
  $preferred_therapist = substr(trim($data['preferredTherapist'] ?? ''), 0, 255);
  $hear_about = substr(trim($data['hearAbout'] ?? ''), 0, 50);
  $language = substr(trim($data['language'] ?? ''), 0, 2);

  $configFile = __DIR__ . '/db_config.php';
  if (!is_file($configFile)) {
    $msg = 'Server: db_config.php not found in api/forms/';
    error_log('[i-need-help.php] ' . $msg);
    echo json_encode(['ok' => false, 'error' => $msg]); exit;
  }
  require $configFile;

  $conn = new mysqli(DB_HOST, DB_USER, DB_PASSWORD, DB_NAME);
  if ($conn->connect_error) {
    $msg = 'DB connection: ' . $conn->connect_error;
    error_log('[i-need-help.php] ' . $msg);
    echo json_encode(['ok' => false, 'error' => $msg]); exit;
  }
  $conn->set_charset('utf8mb4');

  $stmt = $conn->prepare('INSERT INTO form_i_need_help (name, contact_method, phone, email, best_time, message, insurance, preferred_therapist, hear_about, language) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
  if (!$stmt) {
    $msg = 'DB prepare: ' . $conn->error;
    error_log('[i-need-help.php] ' . $msg);
    echo json_encode(['ok' => false, 'error' => $msg]); exit;
  }
  $stmt->bind_param('ssssssssss', $name, $contact_method, $phone, $email, $best_time, $message, $insurance, $preferred_therapist, $hear_about, $language);
  if (!$stmt->execute()) {
    $msg = 'DB save: ' . $stmt->error;
    error_log('[i-need-help.php] ' . $msg);
    echo json_encode(['ok' => false, 'error' => $msg]); exit;
  }
  $stmt->close();
  $conn->close();

  require_once __DIR__ . '/send_form_notification.php';
  send_form_notification('i-need-help', [
    'Nombre' => $name,
    'Método de contacto' => $contact_method,
    'Teléfono' => $phone,
    'Correo electrónico' => $email,
    'Mejor horario' => $best_time,
    'Mensaje' => $message,
    'Seguro' => $insurance,
    'Terapeuta preferido' => $preferred_therapist,
    'Cómo nos conoció' => $hear_about,
    'Idioma' => $language ?: '(no indicado)',
  ]);

  echo json_encode(['ok' => true]);
} catch (Throwable $e) {
  $msg = 'Server error: ' . $e->getMessage();
  error_log('[i-need-help.php] ' . $msg . ' at ' . $e->getFile() . ':' . $e->getLine());
  echo json_encode(['ok' => false, 'error' => $msg]);
}
