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

mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);
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

    $type        = isset($data['type']) ? $data['type'] : 'message'; // 'message' | 'announcement' | 'notification'
    $sender_id   = isset($data['sender_id']) ? $data['sender_id'] : '';
    $receiver_id = isset($data['receiver_id']) ? $data['receiver_id'] : '';
    $message     = isset($data['message']) ? $data['message'] : '';
    $title       = isset($data['title']) ? $data['title'] : '';
    $sender_name = isset($data['sender_name']) ? $data['sender_name'] : 'Someone';
    $user_id     = isset($data['user_id']) ? $data['user_id'] : ''; // for single-user notification

    if (empty($message)) {
        http_response_code(400);
        echo json_encode(["success" => false, "message" => "Missing required fields"]);
        exit();
    }

    try {
        $results = [];

        // ── CHAT MESSAGE ──────────────────────────────────────────────────────────
        if ($type === 'message') {
            if (empty($sender_id) || empty($receiver_id)) {
                http_response_code(400);
                echo json_encode(["success" => false, "message" => "sender_id and receiver_id required for message type"]);
                exit();
            }

            // Resolve sender name
            if (empty($sender_name) || $sender_name === 'Someone') {
                $nameStmt = $conn->prepare("SELECT first_name, last_name FROM students WHERE id = ? LIMIT 1");
                $nameStmt->bind_param("s", $sender_id);
                $nameStmt->execute();
                $nameResult = $nameStmt->get_result()->fetch_assoc();
                if ($nameResult) {
                    $sender_name = trim($nameResult['first_name'] . ' ' . $nameResult['last_name']);
                }
                $nameStmt->close();
            }

            // Unread message badge count
            $countStmt = $conn->prepare("SELECT COUNT(*) as total FROM messages WHERE receiver_id = ? AND read_at IS NULL");
            $countStmt->bind_param("s", $receiver_id);
            $countStmt->execute();
            $countResult = $countStmt->get_result()->fetch_assoc();
            $badgeCount = min((int)($countResult['total'] ?? 0), 99);
            $countStmt->close();

            // Tokens for receiver only
            $tokenStmt = $conn->prepare("SELECT push_token FROM push_tokens WHERE user_id = ? AND user_id != ?");
            $tokenStmt->bind_param("ss", $receiver_id, $sender_id);
            $tokenStmt->execute();
            $tokenResult = $tokenStmt->get_result();

            while ($row = $tokenResult->fetch_assoc()) {
                $token = $row['push_token'];
                $res = sendPushNotification($token, $sender_name, $message, [
                    'type'      => 'message',
                    'sender_id' => $sender_id,
                    'chat_id'   => $receiver_id,
                ], $badgeCount);
                $results[] = $res;

                $status = (isset($res['data']['status']) && $res['data']['status'] === 'ok') ? 'sent' : 'failed';
                $logStmt = $conn->prepare("INSERT INTO notification_logs (sender_id, type, receiver_id, message, push_token, status, response_data, created_at) VALUES (?, 'message', ?, ?, ?, ?, ?, NOW())");
                $responseJson = json_encode($res);
                $logStmt->bind_param("ssssss", $sender_id, $receiver_id, $message, $token, $status, $responseJson);
                $logStmt->execute();
                $logStmt->close();
            }
            $tokenStmt->close();

        // ── ANNOUNCEMENT (broadcast to all users) ────────────────────────────────
        } elseif ($type === 'announcement') {
            $notifTitle = !empty($title) ? $title : 'New Announcement';

            $tokenStmt = $conn->prepare("SELECT user_id, push_token FROM push_tokens");
            $tokenStmt->execute();
            $tokenResult = $tokenStmt->get_result();

            while ($row = $tokenResult->fetch_assoc()) {
                $token  = $row['push_token'];
                $uid    = $row['user_id'];

                // Per-user unread notification badge count
                $badgeStmt = $conn->prepare("SELECT COUNT(*) as total FROM student_notifications WHERE user_id = ? AND status = 'unread'");
                $badgeStmt->bind_param("s", $uid);
                $badgeStmt->execute();
                $badgeRow   = $badgeStmt->get_result()->fetch_assoc();
                $badgeCount = min((int)($badgeRow['total'] ?? 1), 99);
                $badgeStmt->close();

                $res = sendPushNotification($token, $notifTitle, $message, [
                    'type' => 'announcement',
                ], $badgeCount);
                $results[] = $res;

                $status = (isset($res['data']['status']) && $res['data']['status'] === 'ok') ? 'sent' : 'failed';
                $logStmt = $conn->prepare("INSERT INTO notification_logs (sender_id, type, receiver_id, message, push_token, status, response_data, created_at) VALUES (NULL, 'announcement', ?, ?, ?, ?, ?, NOW())");
                $responseJson = json_encode($res);
                $logStmt->bind_param("sssss", $uid, $message, $token, $status, $responseJson);
                $logStmt->execute();
                $logStmt->close();
            }
            $tokenStmt->close();

        // ── SINGLE-USER NOTIFICATION (requirement approved/rejected etc.) ─────────
        } elseif ($type === 'notification') {
            if (empty($user_id)) {
                http_response_code(400);
                echo json_encode(["success" => false, "message" => "user_id required for notification type"]);
                exit();
            }

            $notifTitle = !empty($title) ? $title : 'MedSIS Notification';

            // Per-user unread badge count
            $badgeStmt = $conn->prepare("SELECT COUNT(*) as total FROM student_notifications WHERE user_id = ? AND status = 'unread'");
            $badgeStmt->bind_param("s", $user_id);
            $badgeStmt->execute();
            $badgeRow   = $badgeStmt->get_result()->fetch_assoc();
            $badgeCount = min((int)($badgeRow['total'] ?? 1), 99);
            $badgeStmt->close();

            $tokenStmt = $conn->prepare("SELECT push_token FROM push_tokens WHERE user_id = ?");
            $tokenStmt->bind_param("s", $user_id);
            $tokenStmt->execute();
            $tokenResult = $tokenStmt->get_result();

            while ($row = $tokenResult->fetch_assoc()) {
                $token = $row['push_token'];
                $res = sendPushNotification($token, $notifTitle, $message, [
                    'type' => 'notification',
                ], $badgeCount);
                $results[] = $res;

                $status = (isset($res['data']['status']) && $res['data']['status'] === 'ok') ? 'sent' : 'failed';
                $logStmt = $conn->prepare("INSERT INTO notification_logs (sender_id, type, receiver_id, message, push_token, status, response_data, created_at) VALUES (NULL, 'notification', ?, ?, ?, ?, ?, NOW())");
                $responseJson = json_encode($res);
                $logStmt->bind_param("sssss", $user_id, $message, $token, $status, $responseJson);
                $logStmt->execute();
                $logStmt->close();
            }
            $tokenStmt->close();
        }

        $conn->close();
        echo json_encode(["success" => true, "results" => $results]);

    } catch (Exception $e) {
        error_log("Push Notification Error: " . $e->getMessage());
        http_response_code(500);
        echo json_encode(["success" => false, "message" => $e->getMessage()]);
    }
}
?>