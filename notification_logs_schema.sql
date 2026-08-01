-- Notification logs table to record all sent push notifications
CREATE TABLE IF NOT EXISTS notification_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    sender_id VARCHAR(50) DEFAULT NULL,
    type VARCHAR(20) DEFAULT 'message',
    receiver_id VARCHAR(50) DEFAULT NULL,
    message TEXT NOT NULL,
    push_token VARCHAR(255) NOT NULL,
    status VARCHAR(20) DEFAULT 'sent',
    response_data TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_receiver (receiver_id),
    INDEX idx_sender (sender_id),
    INDEX idx_type (type),
    INDEX idx_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Run these if the table already exists on Hostinger:
-- ALTER TABLE notification_logs MODIFY sender_id VARCHAR(50) DEFAULT NULL;
-- ALTER TABLE notification_logs MODIFY receiver_id VARCHAR(50) DEFAULT NULL;
-- ALTER TABLE notification_logs ADD COLUMN type VARCHAR(20) DEFAULT 'message' AFTER sender_id;
