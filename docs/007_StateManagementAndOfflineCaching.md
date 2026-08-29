# 007 — State Management & Offline Caching

## 📦 Subsystem Overview
MedSIS uses a hybrid state architecture combining **React Context API** for global application state, **Component-Level Hooks** for local interactions, and **AsyncStorage** for persistent offline data caching.

---

## 🗄️ Storage Architecture & Cache Keys

The application persists critical user state and offline records in `@react-native-async-storage/async-storage`:

| Storage Key | Type | Description |
| :--- | :--- | :--- |
| `@medsis_user_data` | `JSON Object` | Logged-in student profile (ID, name, email, year level, evaluation status) |
| `@medsis_auth_token` | `String` | JWT authentication / session token |
| `@medsis_theme_mode` | `'light' \| 'dark' \| 'system'` | User-selected UI color scheme preference |
| `@medsis_cached_messages_{id}` | `JSON Array` | Cached chat history for instant thread display prior to network fetch |
| `@medsis_cached_announcements` | `JSON Array` | Latest bulletin board announcements for offline reading |
| `@medsis_cached_calendar` | `JSON Array` | Cached upcoming events and academic deadlines |

---

## ⚡ Cache Strategies

### 1. Stale-While-Revalidate (SWR) Pattern
- When opening screens such as **Announcements**, **Calendar**, or **Chat**, cached data is rendered immediately.
- Background network requests fetch fresh data from the server.
- The UI seamlessly updates with any newly received entries without blocking the student.

### 2. Offline Network Detection (`NetworkStatusBanner.tsx`)
- Detects network connectivity changes in real time.
- Displays a non-intrusive offline notification banner when connectivity is lost.
- Queues outgoing actions or displays graceful fallback states until connection is restored.

### 3. Cache Invalidation on Logout
- Triggering `logout()` in `AuthContext` wipes `@medsis_user_data`, `@medsis_auth_token`, and active chat cache entries to protect student privacy on shared devices.
