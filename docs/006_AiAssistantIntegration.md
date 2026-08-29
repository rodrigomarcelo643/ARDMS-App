# 006 — AI Assistant (MedGPT) Integration

## 🤖 Subsystem Overview
The **MedGPT AI Assistant** (`app/(tabs)/ai-assistant.tsx`) serves as an intelligent academic guide tailored specifically for medical students. It handles natural language inquiries regarding the student's evaluator, secretary office, pending document requirements, evaluated prospectus grades, upcoming campus events, and general medical study topics.

---

## ⚡ Key Capabilities & Architecture

```
                                +------------------------------------------+
                                |          MedGPT Mobile Assistant        |
                                +--------------------+---------------------+
                                                     |
                                                     v
                                +------------------------------------------+
                                |  POST /api/ai/ai_integration.php         |
                                +--------------------+---------------------+
                                                     |
                 +-----------------------------------+-----------------------------------+
                 |                                                                       |
                 v                                                                       v
   +---------------------------+                                           +---------------------------+
   |  Predefined Intent Engine |                                           |  OpenAI GPT Medical Model |
   |  - Evaluator on Record    |                                           |  - Live Student Context   |
   |  - Secretary Credentials  |                                           |  - Medical Study Guidance |
   |  - Evaluation Results     |                                           |  - Clinical Concepts      |
   |  - Requirements Checklist |                                           |                           |
   +---------------------------+                                           +---------------------------+
```

---

## 🚀 Architectural Highlights

### 1. Instant Response Rendering (Zero-Delay)
- AI responses render **immediately** without artificial character-by-character typewriter loops, ensuring instant feedback and high responsiveness.

### 2. Live Database-Driven Intent Handlers
- **Academic Evaluator Discovery**: Queries `student_grades`, `evaluation_history`, and `endorsements` to provide the assigned evaluator's full name, role, evaluation date, and prospectus signature status.
- **Secretary Office Inquiries**: Provides current secretary contact info, email, office hours, and services (document validation, endorsements, room reservations).
- **Evaluation & Grades**: Generates a live summary of passed units, deficiencies, and course grade breakdowns.
- **Requirements Checklist**: Lists completed vs. missing admission documents with real-time status badges.
- **Announcements & Calendar**: Retrieves upcoming events and official institutional memorandums.

### 3. Suggested Inquiry Chips (`AIQuickLinks.tsx`)
- Displays interactive horizontal query suggestions matching the web student chatbot:
  - *"Who is my academic evaluator?"*
  - *"Who is the current secretary?"*
  - *"Show my semester requirements"*
  - *"Check my current grades"*
  - *"How do I request an evaluation?"*
  - *"What are the latest announcements?"*

### 4. Rich Formatted Markdown & Deep Links (`AIMessageItem.tsx`)
- **Key-Value Bullet Points**: Bold headers with medical icons (`• **Evaluator Name**: Dr. Smith`).
- **Status Badges**: Visual indicators (`✅ Uploaded`, `❌ Missing`).
- **Callout Containers**: Highlighted tip boxes (`💡 Tip: ...`).
- **Interactive Navigation Links**: Tapping links like `[Evaluation Tab]` navigates the student directly to `/(tabs)/evaluations`.

### 5. Custom "New Chat" Session Modal
- Clean, themed confirmation modal allowing students to clear conversation history and reset the session cleanly.
