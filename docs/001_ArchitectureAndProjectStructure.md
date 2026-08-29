# 001 — Architecture & Project Structure

## 🏗️ Architectural Overview
MedSIS Mobile follows a **Layered Domain-Driven Component Architecture** with file-based routing via **Expo Router v5**. The application separates UI presentation, business domain logic, navigation state, and backend data access layers.

```
                  +-----------------------------------+
                  |        Expo Router (app/)         |
                  |  (Tabs, Auth Flows, Dynamic Chat) |
                  +-----------------+-----------------+
                                    |
                  +-----------------v-----------------+
                  |   Feature Components (components/)|
                  | (Domain Modals, Inputs, Skeletons)|
                  +-----------------+-----------------+
                                    |
                  +-----------------v-----------------+
                  |    Context Layer (contexts/)      |
                  |   (AuthContext, ThemeContext)     |
                  +-----------------+-----------------+
                                    |
                  +-----------------v-----------------+
                  |   Service Layer (services/)       |
                  | (Image Analysis, Messages, Push)  |
                  +-----------------+-----------------+
                                    |
                  +-----------------v-----------------+
                  |      Backend REST API (MSIS)      |
                  | (Authentication, Documents, Grades)|
                  +-----------------------------------+
```

---

## 📂 Project Directory Structure

```
MedSIS-App/
├── @types/                    # TypeScript interfaces and domain schemas
│   ├── auth.ts                # Auth request/response types & User credentials
│   ├── chat.ts                # Message models, thread payloads, replies
│   ├── documents.ts           # Uploaded files, requirements, waiver exemptions
│   ├── evaluation.ts          # Grade reports, prospectus subjects, evaluations
│   └── tabs.ts                # Tab state, quick links, UI configuration
│
├── app/                       # Expo Router file-based pages & layouts
│   ├── _layout.tsx            # Root layout (Provider hierarchy, theme container)
│   ├── index.tsx              # Splash / initial authentication router gate
│   ├── +not-found.tsx         # 404 error fallback screen
│   │
│   ├── (tabs)/                # Main student navigation tabs
│   │   ├── _layout.tsx        # Bottom tab bar configuration & icons
│   │   ├── home.tsx           # Dashboard (Announcements, Quick Services, GWA summary)
│   │   ├── folder.tsx         # Document locker (Requirements, uploads, blur AI, waivers)
│   │   ├── evaluations.tsx    # Prospectus viewer, evaluated grades, evaluator status
│   │   ├── ai-assistant.tsx   # MedGPT AI chat, suggestion pills, instant replies
│   │   └── profile.tsx        # Student identity, contact, emergency info, security
│   │
│   ├── auth/                  # Authentication stack
│   │   ├── login.tsx          # Credentials entry (Student ID / Password)
│   │   ├── otp-verification.tsx # Two-factor email OTP code verification
│   │   ├── policy-acceptance.tsx # Mandatory institutional terms & privacy policy
│   │   ├── forgot-password.tsx# Password recovery request
│   │   └── reset-password.tsx # New password setting with requirements validator
│   │
│   ├── chat/                  # Messaging interface
│   │   └── [id].tsx           # Real-time peer chat room with quote reply support
│   │
│   ├── chat-info/             # Messaging recipient metadata
│   │   └── [id].tsx           # Peer profile details, role, and department
│   │
│   ├── notifications/         # Notification drawer
│   │   └── index.tsx          # Real-time institutional & system alerts
│   │
│   └── screens/               # Auxiliary sub-screens
│       ├── announcements.tsx  # Extended bulletin board
│       ├── calendar.tsx       # Interactive monthly/weekly event schedule
│       ├── school-calendar.tsx# Official academic calendar PDF / viewer
│       ├── learning-materials.tsx # Course materials & e-learning downloads
│       ├── messages.tsx       # Message inbox list & conversation search
│       └── change-password.tsx# In-app security credential update
│
├── components/                # Domain-isolated UI component library
│   ├── ai-assistant/          # MedGPT header, input area, message bubbles, chips
│   ├── announcements/         # Priority filter dropdowns, list cards, loaders
│   ├── auth/                  # Login inputs, OTP grids, policy cards, modals
│   ├── calendar/              # MonthView, WeekView, DayView, EventModals
│   ├── change-password/       # Verification steps, feedback modals
│   ├── chat/                  # Message items, quoted bubbles, input composer, context menus
│   ├── evaluations/           # Prospectus subject cards, grade lists, upload modals
│   ├── folder/                # Requirement cards, file pickers, blur preview modals, waivers
│   ├── home/                  # Quick service grids, announcement carousels, status headers
│   ├── messages/              # Conversation list items, unread badges, search bar
│   ├── profile/               # Personal info cards, avatar uploaders, emergency contact edit
│   └── ui/                    # Reusable primitives (Avatar, Card, Input, Label, Skeleton)
│
├── constants/                 # Immutable application constants
│   ├── Colors.ts              # Semantic theme color definitions (Light & Dark)
│   └── Config.ts              # Central API_BASE_URL and system endpoints
│
├── contexts/                  # Global React Context providers
│   ├── AuthContext.tsx        # Authentication session, login/logout, user credentials
│   └── ThemeContext.tsx       # Dark/Light mode theme state & persistence
│
├── hooks/                     # Custom React hooks
│   ├── useColorScheme.ts      # Device / user-selected theme detector
│   └── useThemeColor.ts       # Semantic theme resolver hook
│
├── services/                  # Business & external integration services
│   ├── imageAnalysisService.ts # Local Laplacian blur check + OpenAI Vision classifier
│   ├── messageService.ts      # HTTP polling, message sending, reply payloads
│   ├── nmatExtractionService.ts # OCR NMAT score parser & percentile rank matcher
│   ├── notificationService.ts # In-app notification parser
│   └── pushNotificationService.ts # Expo push token registration & notification channels
│
└── docs/                      # Numbered technical documentation repository
```

---

## 🧩 Architectural Principles

1. **Strict Separation of Concerns**: Screens located in `app/` are lightweight containers. Heavy UI, forms, and dialogs are delegated to dedicated components in `components/`.
2. **Type Safety Across Layers**: Full TypeScript typing from `@types/` ensures that API payloads, component props, and context states are strictly validated at compile time.
3. **Resilient Network Handling**: All API communication through `services/` contains fallback handlers and error boundaries to prevent app crashes when offline.
