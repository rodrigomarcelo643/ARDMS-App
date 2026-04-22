<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

// Handle preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

include __DIR__ . "/../config/connection.php";

if ($conn->connect_error) {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => "Database connection failed"
    ]);
    exit();
}

$data = json_decode(file_get_contents('php://input'), true);

// Send push via Expo
function sendPushNotification($expoPushToken, $title, $body, $data = [], $badge = 1) {
    $message = [
        'to' => $expoPushToken,
        'sound' => 'default',
        'title' => $title,
        'body' => $body,
        'data' => $data,
        'priority' => 'high',
        'channelId' => 'default',
        'badge' => $badge,
        'android' => [
            'sound' => true,
            'priority' => 'high',
            'vibrate' => [0, 250, 250, 250],
            'channelId' => 'default',
        ],
        'ios' => [
            'sound' => true,
            'badge' => $badge,
        ],
    ];

    $ch = curl_init('https://exp.host/--/api/v2/push/send');
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Accept: application/json',
        'Accept-Encoding: gzip, deflate',
        'Content-Type: application/json',
    ]);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($message));
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    $result = json_decode($response, true);
    error_log("Push notification response (HTTP $httpCode): " . json_encode($result));

    return $result;
}

// Handle request
if ($_SERVER['REQUEST_METHOD'] === 'POST') {

    $sender_id = isset($data['sender_id']) ? $data['sender_id'] : '';
    $receiver_id = isset($data['receiver_id']) ? $data['receiver_id'] : '';
    $message = isset($data['message']) ? $data['message'] : '';
    $sender_name = isset($data['sender_name']) ? $data['sender_name'] : 'Someone';
    $notify_sender = isset($data['notify_sender']) ? $data['notify_sender'] : false;

    if (empty($sender_id) || empty($receiver_id) || empty($message)) {
        http_response_code(400);
        echo json_encode([
            "success" => false,
            "message" => "Missing required fields"
        ]);
        exit();
    }

    try {
        // Get sender's name from database if not provided
        if (empty($sender_name) || $sender_name === 'Someone') {
            error_log("Fetching sender name for ID: " . $sender_id);
            
            $nameSql = "SELECT first_name, middle_name, last_name FROM students WHERE id = ? LIMIT 1";
            $nameStmt = $conn->prepare($nameSql);
            $nameStmt->bind_param("s", $sender_id);
            $nameStmt->execute();
            $nameResult = $nameStmt->get_result()->fetch_assoc();
            
            if ($nameResult) {
                $sender_name = trim($nameResult['first_name'] . ' ' . $nameResult['last_name']);
                error_log("Found sender name: " . $sender_name);
            } else {
                error_log("No student found with ID: " . $sender_id);
            }
            $nameStmt->close();
        }
        
        error_log("Final sender name: " . $sender_name);
        
        // Get unread message count (messages where read_at is NULL)
        $countSql = "SELECT COUNT(*) as total FROM messages WHERE receiver_id = ? AND read_at IS NULL";
        $countStmt = $conn->prepare($countSql);
        $countStmt->bind_param("s", $receiver_id);
        $countStmt->execute();
        $countResult = $countStmt->get_result()->fetch_assoc();

        $unreadCount = isset($countResult['total']) ? (int)$countResult['total'] : 0;
        $badgeCount = $unreadCount > 99 ? 99 : $unreadCount;

        $countStmt->close();

        // Get push tokens only for receiver (not sender)
        $tokenSql = "SELECT push_token FROM push_tokens WHERE user_id = ? AND user_id != ?";
        $tokenStmt = $conn->prepare($tokenSql);
        $tokenStmt->bind_param("ss", $receiver_id, $sender_id);
        $tokenStmt->execute();
        $result = $tokenStmt->get_result();

        $results = [];

        while ($row = $result->fetch_assoc()) {
            $token = $row['push_token'];

            $res = sendPushNotification(
                $token,
                $sender_name,
                $message,
                [
                    'type' => 'message',
                    'sender_id' => $sender_id,
                    'chat_id' => $receiver_id,
                ],
                $badgeCount
            );

            $results[] = $res;
            
            // Log notification
            $logSql = "INSERT INTO notification_logs (sender_id, receiver_id, message, push_token, status, response_data, created_at) VALUES (?, ?, ?, ?, ?, ?, NOW())";
            $logStmt = $conn->prepare($logSql);
            $status = isset($res['data']['status']) && $res['data']['status'] === 'ok' ? 'sent' : 'failed';
            $responseJson = json_encode($res);
            $logStmt->bind_param("ssssss", $sender_id, $receiver_id, $message, $token, $status, $responseJson);
            $logStmt->execute();
            $logStmt->close();
        }

        $tokenStmt->close();
        $conn->close();

        echo json_encode([
            "success" => true,
            "results" => $results
        ]);

    } catch (Exception $e) {
        error_log("Push Notification Error: " . $e->getMessage());

        http_response_code(500);
        echo json_encode([
            "success" => false,
            "message" => "Internal server error"
        ]);
    }
}
?>