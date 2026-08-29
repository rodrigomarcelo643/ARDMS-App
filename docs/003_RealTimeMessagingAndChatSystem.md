# 003 — Real-Time Messaging & Chat System

## 💬 Subsystem Overview
The messaging subsystem allows bidirectional peer communication between students, faculty members, and administrative staff. It includes direct thread conversation, quoted message replies, document and image attachments, unsend actions, in-flight optimistic UI updates, and offline message caching.

---

## 🏛️ Chat Architecture

```
+-----------------------------------------------------------------------------------+
|                            Chat Room Screen (chat/[id].tsx)                       |
+-----------------------------------------------------------------------------------+
|  ChatHeader: Avatar, Name, Online Status, Call Actions, Info Navigation           |
|  ChatMessageList: FlatList, inverted or chrono, auto-scroll, reaction menus      |
|  ChatMessageItem: Message Bubble, Quoted Parent Message Preview, Status Ticks     |
|  ChatInputArea: Replying To Banner, Multiline TextInput, Attachment Drawer, Send  |
+-----------------------------------------------------------------------------------+
```

---

## 🔄 Core Features & Implementation Details

### 1. Message Threading & Reply System
Students can long-press or tap **Reply** on any message bubble to cite the referenced message:
- **Replying Banner ([`ChatInputArea.tsx`](file:///D:/DevApp/MedSIS-App/components/chat/ChatInputArea.tsx))**:
  - Displays the sender name and a truncated text preview of the message being replied to.
  - Includes a cancel (`X`) button to dismiss the reply context.
- **Quoted Message Bubble ([`ChatMessageItem.tsx`](file:///D:/DevApp/MedSIS-App/components/chat/ChatMessageItem.tsx))**:
  - Displays a distinct left-bordered quoted preview block above the main text.
  - Tapping the quote preview executes a smooth scroll directly to the original target message.
- **Backend Storage ([`send_message.php`](file:///d:/Program%20Files/Databases/htdocs/Capstone/MSIS/api/chat/send_message.php))**:
  - Stores `reply_to_id`, `reply_to_text`, `reply_to_sender_name`, and `reply_to_type` in the database records.

### 2. Real-Time Polling & In-Flight Optimistic UI
- **Polling Loop**: The active chat room polls `${API_BASE_URL}/api/chat/get_messages.php` on an active interval with exponential backoff when idle.
- **Optimistic Send**: When the user presses send, the message is immediately appended to the local state with a temporary ID and status `sending`, providing instant visual feedback. Upon HTTP 200 confirmation, the temporary ID is reconciled with the database ID.

### 3. Attachment Handling
- Supports camera captures, image gallery selections (`expo-image-picker`), and document uploads (`expo-document-picker`).
- Media is converted to multipart form data and transmitted via `${API_BASE_URL}/api/chat/send_attachment.php`.
- Full-screen zoom and preview modal enabled for received image attachments.

### 4. Unsend & Deletion
- Authenticated senders can unsend their own messages within the allowable time window.
- Deletion flags the record as `is_deleted = 1` or removes the entry, notifying participants to update their local thread state.
