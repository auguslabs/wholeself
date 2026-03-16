<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(204); exit; }
if ($_SERVER['REQUEST_METHOD'] !== 'POST') { echo json_encode(['ok' => false, 'error' => 'Method not allowed']); exit; }
if (strpos($_SERVER['CONTENT_TYPE'] ?? '', 'application/json') === false) { echo json_encode(['ok' => false, 'error' => 'Content-Type must be application/json']); exit; }

try {
  error_log('[forms] contact-form: request received');
  $raw = file_get_contents('php://input');
  $data = json_decode($raw, true);
  if (!is_array($data)) {
    error_log('[forms] contact-form: invalid JSON');
    echo json_encode(['ok' => false, 'error' => 'Invalid JSON']); exit;
  }

  $name = trim($data['name'] ?? '');
  $email = trim($data['email'] ?? '');
  $comment = trim($data['comment'] ?? '');
  $language = trim($data['language'] ?? '');
  if ($name === '' || $email === '' || $comment === '') {
    error_log('[forms] contact-form: validation failed (name/email/comment required)');
    echo json_encode(['ok' => false, 'error' => 'name, email and comment are required']); exit;
  }
  $name = substr($name, 0, 255);
  $email = substr($email, 0, 255);
  $language = substr($language, 0, 2);

  $configFile = __DIR__ . '/db_config.php';
  if (!is_file($configFile)) {
    $msg = 'Server: db_config.php not found in api/forms/';
    error_log('[forms] contact-form: ' . $msg);
    echo json_encode(['ok' => false, 'error' => $msg]); exit;
  }
  require $configFile;

  $conn = new mysqli(DB_HOST, DB_USER, DB_PASSWORD, DB_NAME);
  if ($conn->connect_error) {
    $msg = 'DB connection: ' . $conn->connect_error;
    error_log('[forms] contact-form: ' . $msg);
    echo json_encode(['ok' => false, 'error' => $msg]); exit;
  }
  $conn->set_charset('utf8mb4');

  $stmt = $conn->prepare('INSERT INTO form_contact (name, email, comment, language) VALUES (?, ?, ?, ?)');
  if (!$stmt) {
    $msg = 'DB prepare: ' . $conn->error;
    error_log('[forms] contact-form: ' . $msg);
    echo json_encode(['ok' => false, 'error' => $msg]); exit;
  }
  $stmt->bind_param('ssss', $name, $email, $comment, $language);
  if (!$stmt->execute()) {
    $msg = 'DB save: ' . $stmt->error;
    error_log('[forms] contact-form: ' . $msg);
    echo json_encode(['ok' => false, 'error' => $msg]); exit;
  }
  $stmt->close();
  $conn->close();
  error_log('[forms] contact-form: DB insert ok');

  require_once __DIR__ . '/send_form_notification.php';
  error_log('[forms] contact-form: sending email notification');
  send_form_notification('contact', [
    'Language' => $language ?: '(not specified)',
    'Name' => $name,
    'Email' => $email,
    'Comment / Message' => $comment,
  ]);

  echo json_encode(['ok' => true]);
  error_log('[forms] contact-form: response ok');
} catch (Throwable $e) {
  $msg = 'Server error: ' . $e->getMessage();
  error_log('[forms] contact-form: ' . $msg . ' at ' . $e->getFile() . ':' . $e->getLine());
  echo json_encode(['ok' => false, 'error' => $msg]);
}
