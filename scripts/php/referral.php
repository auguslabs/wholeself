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

  $name_credentials = trim($data['nameCredentials'] ?? '');
  $referral_reason = trim($data['referralReason'] ?? '');
  if ($name_credentials === '' || $referral_reason === '') {
    echo json_encode(['ok' => false, 'error' => 'nameCredentials and referralReason are required']); exit;
  }

  $organization = substr(trim($data['organization'] ?? ''), 0, 255);
  $phone = substr(trim($data['phone'] ?? ''), 0, 50);
  $email = substr(trim($data['email'] ?? ''), 0, 255);
  $client_name = substr(trim($data['clientName'] ?? ''), 0, 255);
  $client_dob = !empty($data['clientDob']) ? $data['clientDob'] : null;
  $client_contact = substr(trim($data['clientContact'] ?? ''), 0, 255);
  $preferred_therapist = trim($data['preferredTherapist'] ?? '');
  $insurance = substr(trim($data['insurance'] ?? ''), 0, 255);
  $additional_notes = trim($data['additionalNotes'] ?? '');
  $language = substr(trim($data['language'] ?? ''), 0, 2);

  $configFile = __DIR__ . '/db_config.php';
  if (!is_file($configFile)) {
    $msg = 'Server: db_config.php not found in api/forms/';
    error_log('[referral.php] ' . $msg);
    echo json_encode(['ok' => false, 'error' => $msg]); exit;
  }
  require $configFile;

  $conn = new mysqli(DB_HOST, DB_USER, DB_PASSWORD, DB_NAME);
  if ($conn->connect_error) {
    $msg = 'DB connection: ' . $conn->connect_error;
    error_log('[referral.php] ' . $msg);
    echo json_encode(['ok' => false, 'error' => $msg]); exit;
  }
  $conn->set_charset('utf8mb4');

  $stmt = $conn->prepare('INSERT INTO form_referral (name_credentials, organization, phone, email, client_name, client_dob, client_contact, referral_reason, preferred_therapist, insurance, additional_notes, language) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
  if (!$stmt) {
    $msg = 'DB prepare: ' . $conn->error;
    error_log('[referral.php] ' . $msg);
    echo json_encode(['ok' => false, 'error' => $msg]); exit;
  }
  $stmt->bind_param('ssssssssssss', $name_credentials, $organization, $phone, $email, $client_name, $client_dob, $client_contact, $referral_reason, $preferred_therapist, $insurance, $additional_notes, $language);
  if (!$stmt->execute()) {
    $msg = 'DB save: ' . $stmt->error;
    error_log('[referral.php] ' . $msg);
    echo json_encode(['ok' => false, 'error' => $msg]); exit;
  }
  $stmt->close();
  $conn->close();
  echo json_encode(['ok' => true]);
} catch (Throwable $e) {
  $msg = 'Server error: ' . $e->getMessage();
  error_log('[referral.php] ' . $msg . ' at ' . $e->getFile() . ':' . $e->getLine());
  echo json_encode(['ok' => false, 'error' => $msg]);
}
