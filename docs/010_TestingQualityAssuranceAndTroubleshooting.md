# 010 — Testing, Quality Assurance & Troubleshooting

## 🧪 Testing & Quality Standards
The MedSIS application undergoes automated linting, unit verification, and manual end-to-end integration testing across physical Android and iOS devices.

---

## 🔍 Quality Assurance Checklist

### 1. Code Quality & Linting
Run static analysis across all TypeScript and TSX files:
```bash
npm run lint
```
Enforces strict TypeScript compilation (`tsconfig.json`) and ESLint rules (`eslint.config.js`).

### 2. Manual Test Matrix
- [x] **Authentication Flow**: Login $\rightarrow$ 6-digit OTP verification $\rightarrow$ Policy acceptance $\rightarrow$ Dashboard load.
- [x] **Chat Messaging**: Peer message sending $\rightarrow$ Quoted message reply tap scroll $\rightarrow$ Image upload.
- [x] **Document Validation**: Blurred capture rejection $\rightarrow$ Valid capture upload $\rightarrow$ Auto-renaming verification.
- [x] **Evaluation Tab**: Year-level breakdown $\rightarrow$ Subject grades listing $\rightarrow$ Evaluator signature display.
- [x] **AI Assistant**: Evaluator query $\rightarrow$ Secretary query $\rightarrow$ Grade summary $\rightarrow$ Suggested chip tap $\rightarrow$ Instant reply rendering.

---

## 🛠️ Common Troubleshooting & Resolution Guide

| Issue / Symptom | Root Cause | Resolution |
| :--- | :--- | :--- |
| **"Technical difficulties. Check connection" in AI Assistant** | Endpoint unavailable or unhandled SQL exception on backend | Verify `API_BASE_URL` in `constants/Config.ts` and test `api/ai/ai_integration.php` connectivity |
| **Push Notifications not arriving** | Running in Android emulator or missing notification permissions | Push requires a physical device with active Google Play Services and registered push token |
| **Image upload fails / rejects** | Low lighting causing Laplacian blur score below threshold | Retake document photo under bright, direct light with all 4 corners visible |
| **Missing evaluator name** | Student is unevaluated in `student_grades` and `evaluation_history` | The AI Assistant will gracefully fall back to the active Faculty Evaluators list and evaluation guide |
