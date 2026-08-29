# 005 — Student Evaluation & Curriculum Prospectus

## 🎓 Subsystem Overview
The Evaluation subsystem (`app/(tabs)/evaluations.tsx`) provides students with a real-time overview of their academic standing across the 4-year Doctor of Medicine curriculum. It tracks evaluated grades, passing units, GWA/GPA metrics, deficiency flags, and official evaluator sign-offs.

---

## 📋 Curriculum Prospectus Workflow

```
+---------------------------+     +--------------------------+     +--------------------------+
|  1. SIS Screenshot Upload | --> | 2. Faculty Evaluation    | --> | 3. Official Stamping     |
| (Student submits grades)  |     | (Curriculum subject map) |     | (Signed prospectus view) |
+---------------------------+     +--------------------------+     +--------------------------+
```

---

## 📊 Core Features & Data Architecture

### 1. Curriculum Course Breakdown
- Courses are organized chronologically by **Year Level** (Year 1 to Year 4) and **Semester** (First Semester, Second Semester, Summer/Clerkship).
- Subject properties include:
  - Course Code (e.g., `MED 101`, `ANAT 102`, `PHARM 201`)
  - Course Title & Description
  - Academic Units (Lecture / Lab)
  - Evaluated Numerical Grade
  - Remarks: `Passed` (✅), `Failed` (❌), `Incomplete` (⚠️), or `Pending` (⏳).

### 2. Live Performance Metrics
- **Cumulative Units Earned**: Aggregates all passing subjects against total curriculum requirements.
- **Deficiency Tracking**: Surfaces failed or uncredited prerequisite subjects that require remediation prior to promotion.
- **GWA / GPA Calculation**: Weighted average calculated across all graded academic units.

### 3. Evaluator Authentication & Signatures
- Once an evaluation is reviewed by an authorized department faculty or administrator, the record logs:
  - **Evaluator Name & Role** (e.g., `Dr. Maria Santos — Faculty Evaluator`).
  - **Evaluation Timestamp**.
  - **Official Signature Stamp**: Rendered on the digital Curriculum Prospectus document.
- Historical modifications to course grades are archived in the `evaluation_history` audit trail table.

---

## 🔗 Direct Prospectus Access
Students can launch a high-resolution, printable digital prospectus directly from the Evaluation tab or through direct navigation deep links received from the AI Assistant.
