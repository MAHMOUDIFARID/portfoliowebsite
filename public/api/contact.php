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

// Ultra-Simple HTML Email Body with Verdana Font
$htmlContent = '
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 24px; background-color: #ffffff; font-family: Verdana, Geneva, sans-serif; color: #222222; font-size: 14px; line-height: 1.6;">
  <div style="max-width: 650px;">
    
    <div style="white-space: pre-wrap; margin-bottom: 24px; color: #222222; font-size: 14px; line-height: 1.6;">' . nl2br(htmlspecialchars($message)) . '</div>

    <hr style="border: 0; border-top: 1px solid #e0e0e0; margin: 24px 0 16px 0;">

    <div style="font-size: 13px; color: #555555; line-height: 1.6;">
      <p style="margin: 0 0 4px 0;"><strong>Name:</strong> ' . htmlspecialchars($name) . '</p>
      <p style="margin: 0;"><strong>Email:</strong> <a href="mailto:' . htmlspecialchars($email) . '" style="color: #0066cc; text-decoration: none;">' . htmlspecialchars($email) . '</a></p>
    </div>

  </div>
</body>
</html>
';

// Email Headers
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
