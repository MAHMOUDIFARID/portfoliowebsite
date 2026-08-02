<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit;
}

// Read raw JSON body or Form data
$input = json_decode(file_get_contents('php://input'), true);

if (!$input) {
    $input = $_POST;
}

$name = isset($input['name']) ? trim($input['name']) : '';
$email = isset($input['email']) ? trim($input['email']) : '';
$subjectInput = isset($input['subject']) ? trim($input['subject']) : 'New Contact Message';
$message = isset($input['message']) ? trim($input['message']) : '';

if (empty($name) || empty($email) || empty($message)) {
    echo json_encode(['success' => false, 'message' => 'Please fill in all required fields']);
    exit;
}

// Recipient email
$to = 'contact@mahmoudi.ma';

// Subject is EXACTLY what the user typed in the contact form
$subject = $subjectInput;

// Simple, Clean Minimalist HTML Email Body with Manrope Font
$htmlContent = '
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700&display=swap" rel="stylesheet">
</head>
<body style="margin: 0; padding: 0; background-color: #ffffff; font-family: \'Manrope\', -apple-system, BlinkMacSystemFont, \'Segoe UI\', Roboto, sans-serif; color: #111827; line-height: 1.7; font-size: 15px;">
  <div style="max-width: 680px; margin: 0 auto; padding: 40px 24px;">
    
    <p style="margin-top: 0; margin-bottom: 24px; font-size: 16px; font-weight: 600; color: #111827;">
      Good day Farid,
    </p>

    <div style="margin-bottom: 32px; color: #1f2937; font-weight: 400; white-space: pre-wrap; font-size: 15px; line-height: 1.7;">' . nl2br(htmlspecialchars($message)) . '</div>

    <div style="border-top: 1px solid #e5e7eb; padding-top: 24px; margin-top: 40px; font-size: 14px; color: #4b5563;">
      <p style="margin: 0 0 6px 0; font-weight: 600; color: #111827;">Sender Details:</p>
      <p style="margin: 0 0 4px 0;"><strong>Name:</strong> ' . htmlspecialchars($name) . '</p>
      <p style="margin: 0;"><strong>Email:</strong> <a href="mailto:' . htmlspecialchars($email) . '" style="color: #2563eb; text-decoration: none;">' . htmlspecialchars($email) . '</a></p>
    </div>

  </div>
</body>
</html>
';

// Email Headers (Simple & Clean with "MAHMOUDI")
$headers = array();
$headers[] = "MIME-Version: 1.0";
$headers[] = "Content-type: text/html; charset=UTF-8";
$headers[] = "From: MAHMOUDI <contact@mahmoudi.ma>";
$headers[] = "Reply-To: " . $name . " <" . $email . ">";
$headers[] = "X-Mailer: PHP/" . phpversion();

$sent = @mail($to, $subject, $htmlContent, implode("\r\n", $headers));

if ($sent) {
    echo json_encode(['success' => true, 'message' => 'Your message has been sent successfully']);
} else {
    echo json_encode(['success' => false, 'message' => 'Failed to send message via mail server']);
}
