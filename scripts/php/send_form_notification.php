<?php
/**
 * Envía notificación por correo cuando se recibe un envío de formulario.
 * Se usa desde contact.php, referral.php, i-need-help.php, loved-one-needs-help.php
 * después de un INSERT exitoso.
 *
 * En db_config.php:
 *   NOTIFY_EMAIL_1, NOTIFY_EMAIL_2 (destinatarios)
 *   NOTIFY_FROM (remitente para SMTP/mail)
 *   Opción A - SMTP: NOTIFY_SMTP_HOST, NOTIFY_SMTP_USER, NOTIFY_SMTP_PASS [, NOTIFY_SMTP_PORT]
 *   Opción B - Resend (prioridad si está definido): RESEND_API_KEY [, NOTIFY_FROM_RESEND]
 *
 * Depuración: notification_debug.log en esta misma carpeta.
 */

if (!function_exists('send_form_notification')) {

  function _notification_debug(string $form_slug, string $message, $mail_result = null): void {
    $log_file = __DIR__ . '/notification_debug.log';
    $line = date('Y-m-d H:i:s') . ' | ' . $form_slug . ' | ' . $message;
    if ($mail_result !== null) {
      $line .= ' | ' . ($mail_result ? 'ok' : 'FALLÓ');
    }
    @file_put_contents($log_file, $line . "\n", FILE_APPEND | LOCK_EX);
  }

  /**
   * Envía un correo por SMTP (AUTH LOGIN).
   * Puerto 465: conexión SSL desde el inicio (ssl://).
   * Puerto 587: conexión TCP y luego STARTTLS.
   */
  function _send_via_smtp(string $from, array $to_list, string $subject, string $body_plain): bool {
    $host = trim(NOTIFY_SMTP_HOST);
    $user = trim(NOTIFY_SMTP_USER);
    $pass = (string) (defined('NOTIFY_SMTP_PASS') ? NOTIFY_SMTP_PASS : '');
    $port = (int) (defined('NOTIFY_SMTP_PORT') ? NOTIFY_SMTP_PORT : 587);
    if ($host === '' || $user === '' || $pass === '') {
      return false;
    }
    $errno = 0;
    $errstr = '';
    $ctx = stream_context_create(['ssl' => ['verify_peer' => false, 'verify_peer_name' => false]]);
    if ($port === 465) {
      $sock = @stream_socket_client(
        'ssl://' . $host . ':' . $port,
        $errno,
        $errstr,
        15,
        STREAM_CLIENT_CONNECT,
        $ctx
      );
    } else {
      $sock = @stream_socket_client(
        'tcp://' . $host . ':' . $port,
        $errno,
        $errstr,
        15,
        STREAM_CLIENT_CONNECT
      );
    }
    if (!is_resource($sock)) {
      return false;
    }
    stream_set_timeout($sock, 15);

    if (_smtp_read($sock) === '') {
      fclose($sock);
      return false;
    }
    _smtp_cmd($sock, 'EHLO ' . ($_SERVER['SERVER_NAME'] ?? 'localhost'));
    if ($port === 587) {
      if (!_smtp_cmd($sock, 'STARTTLS')) {
        fclose($sock);
        return false;
      }
      if (!@stream_socket_enable_crypto($sock, true, STREAM_CRYPTO_METHOD_TLS_CLIENT)) {
        fclose($sock);
        return false;
      }
      _smtp_cmd($sock, 'EHLO ' . ($_SERVER['SERVER_NAME'] ?? 'localhost'));
    }
    if (!_smtp_cmd($sock, 'AUTH LOGIN')) {
      fclose($sock);
      return false;
    }
    if (!_smtp_cmd($sock, base64_encode($user))) {
      fclose($sock);
      return false;
    }
    if (!_smtp_cmd($sock, base64_encode($pass))) {
      fclose($sock);
      return false;
    }
    if (!_smtp_cmd($sock, 'MAIL FROM:<' . $from . '>')) {
      fclose($sock);
      return false;
    }
    foreach ($to_list as $to) {
      $to = trim($to);
      if ($to !== '' && !_smtp_cmd($sock, 'RCPT TO:<' . $to . '>')) {
        fclose($sock);
        return false;
      }
    }
    if (!_smtp_cmd($sock, 'DATA')) {
      fclose($sock);
      return false;
    }
    $to_header = implode(', ', $to_list);
    $headers = "From: $from\r\nReply-To: $to_header\r\nContent-Type: text/plain; charset=UTF-8\r\n";
    $message = "Subject: $subject\r\n$headers\r\n\r\n$body_plain";
    $message = str_replace(["\r\n.", "\n."], ["\r\n..", "\n.."], $message);
    fwrite($sock, $message . "\r\n.\r\n");
    $line = fgets($sock, 512);
    fclose($sock);
    return $line !== false && (int) substr($line, 0, 3) === 250;
  }

  function _smtp_read($sock): string {
    $line = @fgets($sock, 512);
    return $line === false ? '' : $line;
  }

  function _smtp_cmd($sock, string $cmd): bool {
    fwrite($sock, $cmd . "\r\n");
    $line = _smtp_read($sock);
    $code = (int) substr($line, 0, 3);
    return $code >= 200 && $code < 400;
  }

  /**
   * Envía un correo por la API de Resend (https://resend.com).
   * Requiere RESEND_API_KEY en db_config.php. From debe ser dominio verificado en Resend.
   */
  function _send_via_resend(string $from, array $to_list, string $subject, string $body_plain): bool {
    if (!defined('RESEND_API_KEY') || trim(RESEND_API_KEY) === '') {
      return false;
    }
    $key = trim(RESEND_API_KEY);
    $to_list = array_values(array_filter(array_map('trim', $to_list)));
    if (empty($to_list)) {
      return false;
    }
    $payload = [
      'from' => $from,
      'to' => $to_list,
      'subject' => $subject,
      'text' => $body_plain,
    ];
    $ctx = stream_context_create([
      'http' => [
        'method' => 'POST',
        'header' =>
          "Content-Type: application/json\r\n" .
          "Authorization: Bearer " . $key . "\r\n",
        'content' => json_encode($payload),
        'timeout' => 15,
        'ignore_errors' => true,
      ],
    ]);
    $response = @file_get_contents('https://api.resend.com/emails', false, $ctx);
    $code = 0;
    if (isset($http_response_header[0])) {
      $code = (int) preg_replace('/^HTTP\/\S+\s+(\d+).*$/', '$1', $http_response_header[0]);
    }
    if ($response === false) {
      _notification_debug('resend', 'API request failed (no response)', false);
      return false;
    }
    if ($code < 200 || $code >= 300) {
      _notification_debug('resend', 'API ' . $code . ': ' . substr($response, 0, 200), false);
      return false;
    }
    return true;
  }

  function send_form_notification(string $form_slug, array $fields): void {
    if (empty($fields)) {
      _notification_debug($form_slug, 'campos vacíos');
      return;
    }
    if (!defined('NOTIFY_EMAIL_1') || !defined('NOTIFY_EMAIL_2')) {
      _notification_debug($form_slug, 'NOTIFY_EMAIL_1 o NOTIFY_EMAIL_2 no definidos en db_config.php');
      error_log('[send_form_notification] NOTIFY_EMAIL_1 o NOTIFY_EMAIL_2 no definidos en db_config.php');
      return;
    }
    $to1 = trim(NOTIFY_EMAIL_1);
    $to2 = trim(NOTIFY_EMAIL_2);
    if ($to1 === '' || $to2 === '') {
      _notification_debug($form_slug, 'NOTIFY_EMAIL_1 o NOTIFY_EMAIL_2 vacíos');
      return;
    }

    $titles = [
      'contact' => 'Contacto',
      'referral' => 'Referido',
      'i-need-help' => 'Necesito ayuda',
      'loved-one-needs-help' => 'Mi ser querido necesita ayuda',
    ];
    $title = $titles[$form_slug] ?? $form_slug;
    $subject_raw = '[Wholeself] Nuevo registro de formulario - ' . $title;

    $lines = [];
    $lines[] = 'Se ha recibido un nuevo envío del formulario: ' . $title;
    $lines[] = 'Fecha/Hora: ' . date('Y-m-d H:i:s');
    $lines[] = '';
    $lines[] = '--- Datos del formulario ---';
    foreach ($fields as $label => $value) {
      $value = $value === null || $value === '' ? '(vacío)' : (string) $value;
      $lines[] = $label . ': ' . $value;
    }
    $body = implode("\r\n", $lines);

    $from = defined('NOTIFY_FROM') && trim(NOTIFY_FROM) !== ''
      ? trim(NOTIFY_FROM)
      : 'noreply@' . ($_SERVER['HTTP_HOST'] ?? 'wholeselfnm.com');
    $to_list = [$to1, $to2];

    $sent = false;
    $method = 'mail()';
    $resend_available = defined('RESEND_API_KEY') && trim(RESEND_API_KEY) !== '';
    _notification_debug($form_slug, $resend_available ? 'Resend config: sí' : 'Resend config: NO (añade RESEND_API_KEY en db_config.php)', null);

    if ($resend_available) {
      $method = 'Resend';
      $from_resend = defined('NOTIFY_FROM_RESEND') && trim(NOTIFY_FROM_RESEND) !== ''
        ? trim(NOTIFY_FROM_RESEND)
        : $from;
      $sent = _send_via_resend($from_resend, $to_list, $subject_raw, $body);
    }

    if (!$sent && $method === 'Resend') {
      $method = 'SMTP fallback';
      if (defined('NOTIFY_SMTP_HOST') && trim(NOTIFY_SMTP_HOST) !== '') {
        $subject = '=?UTF-8?B?' . base64_encode($subject_raw) . '?=';
        $sent = _send_via_smtp($from, $to_list, $subject, $body);
      }
    }

    if (!$sent && $method === 'SMTP fallback') {
      $method = 'mail() fallback';
      $subject = '=?UTF-8?B?' . base64_encode($subject_raw) . '?=';
      $headers = "From: $from\r\nReply-To: $to1\r\nContent-Type: text/plain; charset=UTF-8\r\n";
      $sent = @mail($to1 . ', ' . $to2, $subject, $body, $headers);
    } elseif (!$sent && $method === 'mail()') {
      if (defined('NOTIFY_SMTP_HOST') && trim(NOTIFY_SMTP_HOST) !== '') {
        $method = 'SMTP';
        $subject = '=?UTF-8?B?' . base64_encode($subject_raw) . '?=';
        $sent = _send_via_smtp($from, $to_list, $subject, $body);
      }
      if (!$sent && $method === 'SMTP') {
        $method = 'mail() fallback';
        $headers = "From: $from\r\nReply-To: $to1\r\nContent-Type: text/plain; charset=UTF-8\r\n";
        $sent = @mail($to1 . ', ' . $to2, $subject, $body, $headers);
      } elseif (!$sent) {
        $subject = '=?UTF-8?B?' . base64_encode($subject_raw) . '?=';
        $headers = "From: $from\r\nReply-To: $to1\r\nContent-Type: text/plain; charset=UTF-8\r\n";
        $sent = @mail($to1 . ', ' . $to2, $subject, $body, $headers);
      }
    }

    _notification_debug($form_slug, $method . ' intentado', $sent);
    if (!$sent) {
      error_log('[send_form_notification] envío falló para formulario: ' . $form_slug);
    }
  }
}
