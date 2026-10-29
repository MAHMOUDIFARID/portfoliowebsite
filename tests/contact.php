<?php
declare(strict_types=1);

require __DIR__ . '/../public/api/contact.php';

set_error_handler(static function ($severity, $message, $file, $line) {
    if (error_reporting() & $severity) throw new ErrorException($message, 0, $severity, $file, $line);
    return false;
});

if (($argv[1] ?? '') === '--limit-worker') {
    $accepted = 0;
    for ($i = 0; $i < 30; $i++) {
        if (PortfolioContact\rateLimit('192.0.2.200', 'request', '', $argv[2], 1000) === 0) $accepted++;
    }
    echo $accepted;
    exit;
}

$passed = 0;
$failed = 0;
$sent = [];
$valid = ['name' => 'Test Visitor', 'email' => 'visitor@example.test', 'subject' => 'Project inquiry', 'message' => "Hello,\nI would like to discuss a project."];
$server = ['REQUEST_METHOD' => 'POST', 'CONTENT_TYPE' => 'application/json; charset=UTF-8', 'HTTP_ORIGIN' => 'https://mahmoudi.ma', 'REMOTE_ADDR' => '192.0.2.1'];
$directory = sys_get_temp_dir() . '/portfolio-contact-test-' . bin2hex(random_bytes(8));

function expect(bool $condition, string $reason = 'Unexpected result'): void {
    if (!$condition) throw new RuntimeException($reason);
}
function test(string $name, callable $run): void {
    global $passed, $failed, $sent;
    $sent = [];
    try { $run(); $passed++; echo "PASS: $name\n"; }
    catch (Throwable $error) { $failed++; fwrite(STDERR, "FAIL: $name: {$error->getMessage()}\n"); }
}
function request($body, array $changes = [], ?callable $transport = null, ?callable $limiter = null): array {
    global $server, $sent;
    $transport = $transport ?? static function (...$args) use (&$sent): bool { $sent[] = $args; return true; };
    return PortfolioContact\handle(array_replace($server, $changes), json_encode($body, JSON_THROW_ON_ERROR | JSON_UNESCAPED_UNICODE), $transport, $limiter ?? static fn() => 0);
}

test('valid submission preserves the fixed recipient, subject, multiline message and JSON contract', function () use ($valid) {
    global $sent;
    [$status, $body] = request($valid);
    expect($status === 200 && $body['success'] === true && isset($body['message']));
    expect(count($sent) === 1 && $sent[0][0] === 'contact@mahmoudi.ma');
    expect($sent[0][1] === $valid['subject'] && $sent[0][3]['Reply-To'] === $valid['email']);
    expect($sent[0][3]['From'] === 'MAHMOUDI <contact@mahmoudi.ma>');
    expect(str_contains($sent[0][2], $valid['message']));
});
test('rejects missing, non-object and non-string input without sending mail', function () use ($valid) {
    global $sent;
    foreach ([null, [], false, 'text', 42, (object)[], array_replace($valid, ['name' => []]), array_replace($valid, ['email' => 12]), array_replace($valid, ['subject' => []]), array_replace($valid, ['subject' => null]), array_replace($valid, ['message' => false])] as $body) {
        expect(request($body)[0] === 400);
    }
    expect($sent === []);
});
test('rejects blank fields and malformed email addresses', function () use ($valid) {
    global $sent;
    foreach (['', 'invalid', 'a@example.test,b@example.test', 'Visitor <a@example.test>'] as $email) {
        expect(request(array_replace($valid, ['email' => $email]))[0] === 400);
    }
    expect(request(array_replace($valid, ['name' => '  ']))[0] === 400);
    expect(request(array_replace($valid, ['message' => " \r\n "]))[0] === 400);
    expect($sent === []);
});
test('blocks header injection, including leading and trailing CRLF and control characters', function () use ($valid) {
    global $sent;
    foreach (['name', 'email', 'subject'] as $field) {
        foreach (["\r\nBcc: other@example.test", "\n", "\r", "\x00", "\x7F", "\t"] as $control) {
            expect(request(array_replace($valid, [$field => $valid[$field] . $control]))[0] === 400, $field);
            expect(request(array_replace($valid, [$field => $control . $valid[$field]]))[0] === 400, $field);
        }
    }
    expect($sent === []);
});
test('enforces field limits on the server with Unicode counted as characters', function () use ($valid) {
    global $sent;
    foreach (['name' => 161, 'subject' => 200, 'message' => 5000] as $field => $max) {
        expect(request(array_replace($valid, [$field => str_repeat('x', $max + 1)]))[0] === 400, $field);
    }
    expect($sent === []);
    expect(request(array_replace($valid, ['message' => str_repeat('é', 5000)]))[0] === 200);
});
test('escapes HTML, accepts Unicode names and keeps display names out of Reply-To', function () use ($valid) {
    global $sent;
    expect(request(array_replace($valid, ['name' => 'Frédéric <Admin>', 'message' => '<img src=x onerror=alert(1)>']))[0] === 200);
    expect(!str_contains($sent[0][2], '<img') && str_contains($sent[0][2], '&lt;img'));
    expect(!str_contains($sent[0][2], '<Admin>'));
    expect($sent[0][3]['Reply-To'] === $valid['email']);
});
test('encodes long Unicode subjects into valid MIME words without changing their text', function () use ($valid) {
    global $sent;
    $subject = str_repeat('Été ', 45);
    expect(request(array_replace($valid, ['subject' => $subject]))[0] === 200);
    $decoded = '';
    foreach (explode("\r\n ", $sent[0][1]) as $word) {
        expect(strlen($word) <= 75 && preg_match('/^=\?UTF-8\?B\?(.+)\?=$/', $word, $match) === 1);
        $decoded .= base64_decode($match[1], true);
    }
    expect($decoded === trim($subject));
});
test('defaults a blank subject and rejects NUL in the message', function () use ($valid) {
    global $sent;
    expect(request(array_replace($valid, ['subject' => ' ']))[0] === 200);
    expect($sent[0][1] === 'New Contact Message');
    expect(request(array_replace($valid, ['message' => "Hello\x00world"]))[0] === 400);
});
test('rejects malformed JSON and invalid UTF-8', function () use ($server, $valid) {
    foreach (['{broken', "{\"message\":\"\xFF\"}"] as $raw) {
        expect(PortfolioContact\handle($server, $raw, static fn() => throw new RuntimeException('must not send'), static fn() => 0)[0] === 400);
    }
    expect(PortfolioContact\validate((object)array_replace($valid, ['name' => "bad\xFF"])) === null);
});
test('bounds raw bodies even with absent or misleading Content-Length', function () use ($server, $valid) {
    $send = static fn() => throw new RuntimeException('must not send');
    expect(PortfolioContact\handle($server, str_repeat('x', PortfolioContact\MAX_BYTES + 1), $send, static fn() => 0)[0] === 413);
    expect(request($valid, ['CONTENT_LENGTH' => (string)(PortfolioContact\MAX_BYTES + 1)], $send)[0] === 413);
});
test('rejects foreign origins, unsupported methods and content types', function () use ($valid) {
    global $sent;
    foreach (['https://other.test', 'https://mahmoudi.ma.attacker.test', 'null', 'http://mahmoudi.ma'] as $origin) {
        expect(request($valid, ['HTTP_ORIGIN' => $origin])[0] === 403);
    }
    foreach (['GET', 'OPTIONS'] as $method) {
        $response = request($valid, ['REQUEST_METHOD' => $method]);
        expect($response[0] === 405 && $response[2]['Allow'] === 'POST');
    }
    expect(request($valid, ['CONTENT_TYPE' => 'text/plain'])[0] === 415);
    expect($sent === []);
    expect(request($valid, ['HTTP_ORIGIN' => 'https://www.mahmoudi.ma'])[0] === 200);
});
test('honeypot submissions send nothing and invalid honeypot types are rejected', function () use ($valid) {
    global $sent;
    expect(request(array_replace($valid, ['website' => 'spam.test']))[0] === 200);
    expect(request(array_replace($valid, ['website' => []]))[0] === 400);
    expect($sent === []);
});
test('mail transport failures produce useful errors and never claim success', function () use ($valid) {
    foreach ([static fn() => false, static fn() => throw new RuntimeException('private server details')] as $send) {
        [$status, $body] = request($valid, [], $send);
        expect($status === 503 && $body['success'] === false && !str_contains($body['message'], 'private'));
    }
});
test('rate limited requests expose Retry-After and never send mail', function () use ($valid) {
    global $sent;
    $response = request($valid, [], null, static fn() => 42);
    expect($response[0] === 429 && $response[1]['success'] === false && $response[2]['Retry-After'] === '42');
    expect($sent === []);
});
test('missing client IP fails closed instead of creating a shared anonymous quota', function () use ($valid) {
    global $sent;
    expect(request($valid, ['REMOTE_ADDR' => ''])[0] === 503);
    expect($sent === []);
});

try {
    test('persistent limits enforce three messages per email/IP and five per IP, independently', function () use ($directory) {
        for ($i = 0; $i < 3; $i++) expect(PortfolioContact\rateLimit('192.0.2.1', 'message', 'visitor@example.test', $directory, 1000) === 0);
        expect(PortfolioContact\rateLimit('192.0.2.1', 'message', 'VISITOR@EXAMPLE.TEST', $directory, 1000) === 900);
        for ($i = 0; $i < 2; $i++) expect(PortfolioContact\rateLimit('192.0.2.1', 'message', 'other@example.test', $directory, 1000) === 0);
        expect(PortfolioContact\rateLimit('192.0.2.1', 'message', 'third@example.test', $directory, 1000) === 900);
        expect(PortfolioContact\rateLimit('192.0.2.2', 'message', 'visitor@example.test', $directory, 1000) === 0);
        expect(PortfolioContact\rateLimit('192.0.2.1', 'message', 'visitor@example.test', $directory, 1900) === 0);
    });
    test('request floods and spoofed forwarding headers cannot bypass limits or block other visitors', function () use ($directory, $valid) {
        $limit = static fn($ip, $kind, $email) => PortfolioContact\rateLimit($ip, $kind, $email, $directory, 1000);
        for ($i = 0; $i < 30; $i++) expect(request([], ['REMOTE_ADDR' => '192.0.2.3'], null, $limit)[0] === 400);
        expect(request($valid, ['REMOTE_ADDR' => '192.0.2.3', 'HTTP_X_FORWARDED_FOR' => '192.0.2.99'], null, $limit)[0] === 429);
        expect(request($valid, ['REMOTE_ADDR' => '192.0.2.4', 'HTTP_X_FORWARDED_FOR' => '192.0.2.3'], null, $limit)[0] === 200);
    });
    test('equivalent IPv6 representations share the same counters', function () use ($directory) {
        for ($i = 0; $i < 3; $i++) expect(PortfolioContact\rateLimit('2001:db8::1', 'message', 'a@example.test', $directory, 1000) === 0);
        expect(PortfolioContact\rateLimit('2001:0db8:0000:0000:0000:0000:0000:0001', 'message', 'a@example.test', $directory, 1000) === 900);
    });
    test('four PHP workers atomically share the request quota', function () use ($directory) {
        $workers = [];
        for ($i = 0; $i < 4; $i++) {
            $process = proc_open([PHP_BINARY, '-n', __FILE__, '--limit-worker', $directory], [1 => ['pipe', 'w'], 2 => ['pipe', 'w']], $pipes);
            expect(is_resource($process), 'cannot start PHP worker');
            $workers[] = [$process, $pipes];
        }
        $accepted = 0;
        foreach ($workers as [$process, $pipes]) {
            $output = stream_get_contents($pipes[1]);
            $errors = stream_get_contents($pipes[2]);
            fclose($pipes[1]); fclose($pipes[2]);
            expect(proc_close($process) === 0 && $errors === '', $errors);
            $accepted += (int)$output;
        }
        expect($accepted === 30, 'concurrent workers accepted ' . $accepted);
    });
    test('rate-limit storage failures stop processing before any email is sent', function () use ($valid) {
        global $sent;
        try {
            request($valid, [], null, static fn() => throw new RuntimeException('unwritable counter storage'));
            throw new LogicException('limiter failure was swallowed');
        } catch (RuntimeException $error) {
            expect($error->getMessage() === 'unwritable counter storage');
        }
        expect($sent === []);
    });
} finally {
    // This uniquely named directory contains only this run's counter fixtures.
    foreach (glob($directory . '/*.json') ?: [] as $file) unlink($file);
    if (is_dir($directory)) rmdir($directory);
}

echo "$passed passed; $failed failed. No real emails sent.\n";
exit($failed === 0 ? 0 : 1);
