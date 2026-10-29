<?php
declare(strict_types=1);

namespace PortfolioContact;

const MAIL_ADDRESS = 'contact@mahmoudi.ma';
const MAX_BYTES = 24576;
const WINDOW_SECONDS = 900;

function result(int $status, string $message, array $headers = []): array
{
    return [$status, ['success' => $status === 200, 'message' => $message], $headers];
}

function validate($body): ?array
{
    if (!is_object($body)) return null;
    $fields = [];
    foreach (['name' => 161, 'email' => 254, 'subject' => 200, 'message' => 5000] as $key => $max) {
        $value = property_exists($body, $key) ? $body->$key : '';
        if (!is_string($value) || preg_match('//u', $value) !== 1) return null;
        // Check before trimming, including leading/trailing injected headers.
        $controls = $key === 'message' ? '/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/' : '/[\x00-\x1F\x7F]/';
        if (preg_match($controls, $value)) return null;
        $value = trim($value);
        if (preg_match_all('/./us', $value) > $max) return null;
        $fields[$key] = $value;
    }
    if ($fields['name'] === '' || $fields['message'] === '' ||
        strlen($fields['email']) > 254 || !filter_var($fields['email'], FILTER_VALIDATE_EMAIL)) return null;
    if ($fields['subject'] === '') $fields['subject'] = 'New Contact Message';
    return $fields;
}

// Only generated MIME folding contains newlines; visitor input cannot add headers.
function mailSubject(string $subject): string
{
    if (!preg_match('/[^\x20-\x7E]/', $subject)) return $subject;
    $words = [];
    $chunk = '';
    foreach (preg_split('//u', $subject, -1, PREG_SPLIT_NO_EMPTY) as $character) {
        if (strlen($chunk . $character) > 45) {
            $words[] = '=?UTF-8?B?' . base64_encode($chunk) . '?=';
            $chunk = '';
        }
        $chunk .= $character;
    }
    if ($chunk !== '') $words[] = '=?UTF-8?B?' . base64_encode($chunk) . '?=';
    return implode("\r\n ", $words);
}

// Counters are shared by PHP workers and stored outside public_html. Only the
// server's REMOTE_ADDR is used; visitor-controlled forwarding headers are ignored.
function rateLimit(string $ip, string $kind, string $email = '', ?string $directory = null, ?int $now = null): int
{
    $packed = inet_pton($ip);
    if ($packed === false) throw new \RuntimeException('Invalid client IP');
    $now = $now ?? time();
    $directory = $directory ?? sys_get_temp_dir() . '/portfolio-contact-' . substr(hash('sha256', __DIR__), 0, 20);
    if (is_link($directory)) throw new \RuntimeException('Unsafe limiter directory');
    if (!is_dir($directory) && !@mkdir($directory, 0700, true) && !is_dir($directory)) {
        throw new \RuntimeException('Cannot create limiter directory');
    }
    // Clear expired identities occasionally; never remove a counter in use.
    if (random_int(1, 100) === 1) {
        foreach (glob($directory . '/*.json') ?: [] as $old) {
            if (is_link($old) || @filemtime($old) >= $now - 86400) continue;
            $expired = @fopen($old, 'r+');
            if (!$expired) continue;
            if (flock($expired, LOCK_EX | LOCK_NB)) {
                if ((fstat($expired)['mtime'] ?? $now) < $now - 86400) @unlink($old);
                flock($expired, LOCK_UN);
            }
            fclose($expired);
        }
    }
    $filePath = $directory . '/' . hash('sha256', $packed) . '.json';
    if (is_link($filePath)) throw new \RuntimeException('Unsafe limiter file');
    $file = @fopen($filePath, 'c+');
    if (!$file) throw new \RuntimeException('Cannot open limiter');
    try {
        if (!flock($file, LOCK_EX)) throw new \RuntimeException('Cannot lock limiter');
        $raw = stream_get_contents($file);
        $state = $raw === '' ? null : json_decode($raw, true, 16, JSON_THROW_ON_ERROR);
        if (!is_array($state) || ($state['reset'] ?? 0) <= $now) {
            $state = ['reset' => $now + WINDOW_SECONDS, 'requests' => 0, 'messages' => 0, 'emails' => []];
        }
        $key = hash('sha256', strtolower($email));
        $blocked = $kind === 'request'
            ? $state['requests'] >= 30
            : $state['messages'] >= 5 || ($state['emails'][$key] ?? 0) >= 3;
        if ($blocked) return max(1, $state['reset'] - $now);
        if ($kind === 'request') $state['requests']++;
        else {
            $state['messages']++;
            $state['emails'][$key] = ($state['emails'][$key] ?? 0) + 1;
        }
        $encoded = json_encode($state, JSON_THROW_ON_ERROR);
        rewind($file);
        if (!ftruncate($file, 0) || fwrite($file, $encoded) !== strlen($encoded) || !fflush($file)) {
            throw new \RuntimeException('Cannot persist limiter');
        }
        return 0;
    } finally {
        flock($file, LOCK_UN);
        fclose($file);
    }
}

// Inject the transport and limiter for tests; including this file sends no mail.
function handle(array $server, string $raw, callable $send, callable $limit): array
{
    if (($server['REQUEST_METHOD'] ?? '') !== 'POST') return result(405, 'Method not allowed', ['Allow' => 'POST']);
    if (isset($server['HTTP_ORIGIN']) && !in_array($server['HTTP_ORIGIN'], ['https://mahmoudi.ma', 'https://www.mahmoudi.ma'], true)) {
        return result(403, 'This request origin is not allowed.');
    }
    if (strtolower(trim(explode(';', $server['CONTENT_TYPE'] ?? '')[0])) !== 'application/json') {
        return result(415, 'Please send a JSON request.');
    }
    if (strlen($raw) > MAX_BYTES || (int)($server['CONTENT_LENGTH'] ?? 0) > MAX_BYTES) {
        return result(413, 'Your message is too large.');
    }
    $ip = $server['REMOTE_ADDR'] ?? '';
    if (!filter_var($ip, FILTER_VALIDATE_IP)) return result(503, 'Contact is temporarily unavailable. Please email ' . MAIL_ADDRESS . ' directly.');
    $retry = $limit($ip, 'request', '');
    if ($retry) return result(429, 'Too many requests. Please try again in a few minutes or email us directly.', ['Retry-After' => (string)$retry]);
    try { $body = json_decode($raw, false, 16, JSON_THROW_ON_ERROR); }
    catch (\JsonException $error) { return result(400, 'Invalid request data.'); }
    if (is_object($body) && isset($body->website)) {
        if (!is_string($body->website)) return result(400, 'Invalid request data.');
        if ($body->website !== '') return result(200, 'Your message has been sent successfully');
    }
    $contact = validate($body);
    if (!$contact) return result(400, 'Please check your name, email, subject and message (5,000 characters maximum).');
    $retry = $limit($ip, 'message', $contact['email']);
    if ($retry) return result(429, 'Too many messages. Please try again in a few minutes or email us directly.', ['Retry-After' => (string)$retry]);
    $escape = static fn(string $text): string => htmlspecialchars($text, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
    $html = '<!DOCTYPE html><html><head><meta charset="utf-8"></head>' .
        '<body style="padding:24px;font:14px/1.6 Verdana,sans-serif;color:#222">' .
        '<div style="white-space:pre-wrap">' . $escape($contact['message']) . '</div><hr>' .
        '<p><strong>Name:</strong> ' . $escape($contact['name']) . '<br>' .
        '<strong>Email:</strong> ' . $escape($contact['email']) . '</p></body></html>';
    $headers = [
        'MIME-Version' => '1.0', 'Content-Type' => 'text/html; charset=UTF-8',
        'From' => 'MAHMOUDI <' . MAIL_ADDRESS . '>', 'Reply-To' => $contact['email'],
    ];
    try { $accepted = $send(MAIL_ADDRESS, mailSubject($contact['subject']), $html, $headers); }
    catch (\Throwable $error) { $accepted = false; }
    if (!$accepted) return result(503, 'Could not send your message. Please email ' . MAIL_ADDRESS . ' directly.');
    return result(200, 'Your message has been sent successfully');
}

if (realpath($_SERVER['SCRIPT_FILENAME'] ?? '') === __FILE__) {
    ini_set('display_errors', '0');
    header('Content-Type: application/json; charset=UTF-8');
    header('Cache-Control: no-store');
    header('X-Content-Type-Options: nosniff');
    try {
        // Bound the read even when Content-Length is absent or incorrect.
        $raw = file_get_contents('php://input', false, null, 0, MAX_BYTES + 1);
        [$status, $body, $headers] = handle($_SERVER, $raw === false ? '' : $raw,
            static fn($to, $subject, $html, $headers) => function_exists('mail') && @mail($to, $subject, $html, $headers),
            __NAMESPACE__ . '\rateLimit');
    } catch (\Throwable $error) {
        error_log('Portfolio contact: request could not be processed.');
        [$status, $body, $headers] = result(503, 'Contact is temporarily unavailable. Please email ' . MAIL_ADDRESS . ' directly.');
    }
    http_response_code($status);
    foreach ($headers as $name => $value) header($name . ': ' . $value);
    echo json_encode($body, JSON_UNESCAPED_UNICODE | JSON_INVALID_UTF8_SUBSTITUTE);
}
