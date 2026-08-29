# 000 — MedSIS Mobile Application: System Index & Master Overview

## 📌 Executive Summary
**MedSIS** (Medical Student Information System) is an enterprise mobile application designed for Southwestern University PHINMA School of Medicine. Built on **React Native** and **Expo SDK 53**, the application equips medical students with comprehensive academic record management, real-time peer messaging, AI-powered document verification, curriculum prospectus evaluations, and direct assistance via the integrated **MedGPT AI Assistant**.

---

## 🗂️ Master Documentation Sitemap

| Module ID | Document Name | Scope & Purpose |
| :--- | :--- | :--- |
| **`000`** | [000_IndexAndSystemOverview.md](./000_IndexAndSystemOverview.md) | Master index, architecture summary, tech stack, and environment matrix |
| **`001`** | [001_ArchitectureAndProjectStructure.md](./001_ArchitectureAndProjectStructure.md) | File-based Expo Router layout, component hierarchy, and modular design |
| **`002`** | [002_AuthenticationAndSecurity.md](./002_AuthenticationAndSecurity.md) | AuthContext, login lifecycle, 2FA OTP verification, policy acceptance, and session encryption |
| **`003`** | [003_RealTimeMessagingAndChatSystem.md](./003_RealTimeMessagingAndChatSystem.md) | Peer chat, message threading & replies, attachment handling, and unsend/edit mechanisms |
| **`004`** | [004_DocumentUploadAndAiValidation.md](./004_DocumentUploadAndAiValidation.md) | 3-step AI document analysis (blur checking, OpenAI Vision slot matching, NMAT extraction), and waiver exemptions |
| **`005`** | [005_StudentEvaluationAndProspectus.md](./005_StudentEvaluationAndProspectus.md) | Evaluation lifecycle, prospectus grade verification, evaluator signatures, and deficit tracking |
| **`006`** | [006_AiAssistantIntegration.md](./006_AiAssistantIntegration.md) | MedGPT assistant architecture, instant response rendering, suggested queries, and database-driven intents |
| **`007`** | [007_StateManagementAndOfflineCaching.md](./007_StateManagementAndOfflineCaching.md) | AsyncStorage persistence, message caching, offline network detection, and cache invalidation |
| **`008`** | [008_PushNotificationsAndBackgroundServices.md](./008_PushNotificationsAndBackgroundServices.md) | Expo push notifications, device token registration, listeners, and background task handling |
| **`009`** | [009_UiUxDesignSystemAndTheming.md](./009_UiUxDesignSystemAndTheming.md) | NativeWind Tailwind CSS v3 integration, medical color palette, light/dark themes, and modals |
| **`010`** | [010_TestingQualityAssuranceAndTroubleshooting.md](./010_TestingQualityAssuranceAndTroubleshooting.md) | Quality assurance, test coverage, network error troubleshooting, and production debugging |
| **`011`** | [011_BuildPipelinesAndDeployment.md](./011_BuildPipelinesAndDeployment.md) | Expo EAS Build pipelines, Android APK/AAB compilation, prebuild configs, and release checklists |
| **`ZZ`** | [ZZ_Archives/README.md](./ZZ_Archives/README.md) | Legacy documentation archive and historical design notes |

---

## 🛠️ Technology Stack Specifications

```
+-------------------------------------------------------------------------+
|                              MedSIS App                                 |
|      React Native 0.79.6  |  Expo SDK ~53.0.27  |  TypeScript ~5.8.3     |
+-------------------------------------------------------------------------+
|  Presentation & Theming       Routing & Navigation     State & Storage  |
|  - NativeWind (Tailwind CSS)  - Expo Router v5         - React Context  |
|  - Lucide React Native Icons  - Bottom Tabs            - AsyncStorage   |
|  - React Native Reanimated    - Deep Linking           - Secure Store   |
+-------------------------------------------------------------------------+
|  Hardware & Media APIs        Services & Intelligence  Networking       |
|  - Expo Camera & ImagePicker  - OpenAI Vision Models   - Axios HTTP     |
|  - Expo FileSystem & Sharing  - MedGPT AI Assistant    - Push Notifs    |
|  - Expo Notifications         - OCR / NMAT Extraction  - Form-Data Mime |
+-------------------------------------------------------------------------+
```

### Core Dependencies:
- **Framework Core**: `expo@~53.0.27`, `react-native@0.79.6`, `react@19.0.0`
- **Routing**: `expo-router@~5.1.11`, `@react-navigation/native@^7.1.6`, `@react-navigation/bottom-tabs@^7.3.10`
- **Styling**: `nativewind@^4.1.23`, `tailwindcss@^3.4.17`, `react-native-reanimated@~3.17.4`
- **Icons**: `lucide-react-native@^0.523.0`, `@expo/vector-icons@^14.1.0`
- **Persistence**: `@react-native-async-storage/async-storage@2.1.2`
- **Media & File System**: `expo-file-system@~18.1.11`, `expo-image-picker@~16.1.4`, `expo-document-picker@^13.1.6`, `expo-sharing@~13.1.5`
- **Notifications**: `expo-notifications@~0.31.5`, `expo-device@~7.1.4`

---

## ⚙️ Environment Configuration

The application communicates with the backend REST API located on the central server or local testing instance.

```typescript
// constants/Config.ts
export const API_BASE_URL = "https://swu-som.com"; 
// Local development alternative: "http://192.168.1.X:8000" or "http://10.0.2.2/Capstone/MSIS"
```

| Key Variable | Purpose | Location |
| :--- | :--- | :--- |
| `API_BASE_URL` | Base endpoint for authentication, messages, documents, and AI integration | `constants/Config.ts` |
| `OPENAI_API_KEY` | OpenAI secret key used for Vision document classification & OCR | `services/imageAnalysisService.ts` / Backend Environment |
| `EAS_PROJECT_ID` | Expo Application Services cloud build identifier | `app.json` |
