# 008 — Push Notifications & Background Services

## 🔔 Subsystem Overview
The notifications subsystem (`services/pushNotificationService.ts`) manages real-time push notifications, in-app alerts, badge counters, and background listeners for incoming chat messages, requirement status updates, and emergency school bulletins.

---

## 📡 Push Notification Architecture

```
+-------------------+     +-------------------------+     +------------------------+     +-------------------+
| 1. Expo Device    | --> | 2. Permission Request   | --> | 3. Push Token Register | --> | 4. Backend Store  |
| (Physical Device) |     | (Push alert prompt)     |     | (Expo Push Token)      |     | (device_tokens db)|
+-------------------+     +-------------------------+     +------------------------+     +-------------------+
```

---

## 🛠️ Implementation Details

### 1. Token Registration (`registerForPushNotificationsAsync`)
- Validates that the application is running on a physical mobile device (emulators cannot receive standard APNs / FCM push).
- Requests system notification permissions (`Notifications.requestPermissionsAsync()`).
- Retrieves the unique Expo Push Token (`ExponentPushToken[...]`).
- Registers the token with the backend server associated with the logged-in student's ID (`/api/notifications/register_token.php`).

### 2. Android Notification Channels
Configures high-priority notification channels on Android 8.0+ devices:
- **Default Channel**: `id: 'default'`, `importance: Notifications.AndroidImportance.MAX`, `vibrationPattern: [0, 250, 250, 250]`, `lightColor: '#af1616'`.
- **Urgent Announcements**: Custom notification channel with distinct audio chime.

### 3. Notification Handling & Deep Linking
- **Foreground Listener (`addNotificationReceivedListener`)**: Triggers an in-app banner toast when a notification arrives while the app is active.
- **Response Listener (`addNotificationResponseReceivedListener`)**: When a student taps a notification, the app deep-links directly to the relevant screen:
  - Chat notification $\rightarrow$ navigates to `/chat/[id]`.
  - Requirement approval notification $\rightarrow$ navigates to `/(tabs)/folder`.
  - Announcement alert $\rightarrow$ navigates to `/screens/announcements`.
