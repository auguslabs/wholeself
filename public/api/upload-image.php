<?php
/**
 * POST /api/upload-image
 * Subida de imagen para secciones editables (hero home, services, rates).
 * Requiere X-API-Key. Body: multipart/form-data con "file" (imagen) y "slot" (ej: home-hero).
 * Devuelve la ruta pública para usar en content (ej: content.hero.backgroundImage).
 */

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, X-API-Key, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
  header('Access-Control-Allow-Origin: *');
  header('Access-Control-Allow-Methods: POST, OPTIONS');
  header('Access-Control-Allow-Headers: Content-Type, X-API-Key, Authorization');
  http_response_code(204);
  exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
  http_response_code(405);
  echo json_encode(['ok' => false, 'error' => 'Method not allowed']);
  exit;
}

$configApiFile = __DIR__ . '/content_api_config.php';
if (!is_file($configApiFile)) {
  http_response_code(500);
  echo json_encode(['ok' => false, 'error' => 'API config not found']);
  exit;
}
require $configApiFile;

$apiKey = null;
if (!empty($_SERVER['HTTP_X_API_KEY'])) {
  $apiKey = trim($_SERVER['HTTP_X_API_KEY']);
} elseif (!empty($_SERVER['HTTP_AUTHORIZATION']) && preg_match('/^Bearer\s+(.+)$/i', $_SERVER['HTTP_AUTHORIZATION'], $m)) {
  $apiKey = trim($m[1]);
}
if ($apiKey === null || !defined('CONTENT_API_KEY') || $apiKey !== CONTENT_API_KEY) {
  http_response_code(401);
  echo json_encode(['ok' => false, 'error' => 'Unauthorized']);
  exit;
}

// Slots permitidos: clave => nombre de archivo fijo (hero) o null = nombre desde archivo en uploads/insurance/
$allowedSlots = [
  'home-hero'              => ['dir' => 'hero', 'filename' => 'home.webp'],
  'services-hero'          => ['dir' => 'hero', 'filename' => 'services.webp'],
  'rates-hero'             => ['dir' => 'hero', 'filename' => 'rates.webp'],
  'about-hero'             => ['dir' => 'hero', 'filename' => 'about.webp'],
  'rates-insurance-logo'   => ['dir' => 'insurance', 'filename' => null], // nombre desde archivo subido
];

$slot = trim($_POST['slot'] ?? '');
if ($slot === '' || !isset($allowedSlots[$slot])) {
  http_response_code(400);
  echo json_encode(['ok' => false, 'error' => 'Invalid or missing slot. Use: home-hero, services-hero, rates-hero, about-hero, rates-insurance-logo']);
  exit;
}

if (empty($_FILES['file']) || $_FILES['file']['error'] !== UPLOAD_ERR_OK) {
  http_response_code(400);
  echo json_encode(['ok' => false, 'error' => 'No file uploaded or upload error']);
  exit;
}

$file = $_FILES['file'];
$maxSize = 2 * 1024 * 1024; // 2 MB
$allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

$finfo = finfo_open(FILEINFO_MIME_TYPE);
$mime = finfo_file($finfo, $file['tmp_name']);
finfo_close($finfo);

if (!in_array($mime, $allowedTypes, true)) {
  http_response_code(400);
  echo json_encode(['ok' => false, 'error' => 'Invalid file type. Use JPEG, PNG, WebP or GIF']);
  exit;
}
if ($file['size'] > $maxSize) {
  http_response_code(400);
  echo json_encode(['ok' => false, 'error' => 'File too large. Max 2 MB']);
  exit;
}

$slotConfig = $allowedSlots[$slot];
$uploadDir = $slotConfig['dir'];
$baseDir = __DIR__ . '/../uploads/' . $uploadDir;
if (!is_dir($baseDir)) {
  if (!mkdir($baseDir, 0755, true)) {
    http_response_code(500);
    echo json_encode(['ok' => false, 'error' => 'Could not create upload directory']);
    exit;
  }
}

if ($slotConfig['filename'] !== null) {
  $filename = $slotConfig['filename'];
} else {
  // rates-insurance-logo: nombre desde archivo subido (sanitizado)
  $ext = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
  if (!in_array($ext, ['jpg', 'jpeg', 'png', 'webp', 'gif'], true)) {
    $ext = 'webp';
  }
  $base = preg_replace('/[^a-zA-Z0-9_-]+/', '-', pathinfo($file['name'], PATHINFO_FILENAME));
  $base = substr(trim($base, '-') ?: 'logo', 0, 80);
  $filename = ($base ?: 'logo') . '-' . substr(uniqid(), -6) . '.' . $ext;
}

$targetPath = $baseDir . '/' . $filename;

if (!move_uploaded_file($file['tmp_name'], $targetPath)) {
  http_response_code(500);
  echo json_encode(['ok' => false, 'error' => 'Failed to save file']);
  exit;
}

// Ruta pública (sin base URL; el sitio la interpreta desde la raíz)
$publicPath = '/uploads/' . $uploadDir . '/' . $filename;
http_response_code(200);
echo json_encode(['ok' => true, 'path' => $publicPath]);
