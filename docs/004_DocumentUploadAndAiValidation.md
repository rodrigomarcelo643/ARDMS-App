# 004 — Document Upload & AI Validation Subsystem

## 📄 Subsystem Overview
The Document Upload and Folder subsystem (`app/(tabs)/folder.tsx`) manages official student admission requirements (e.g., PSA Birth Certificate, Transcript of Records, Good Moral Certificate, NMAT Score Report, Medical Clearance, Honorable Dismissal).

To ensure high data integrity, the system implements an automated **3-Tier AI Validation Pipeline**:
1. **Local Image Blur & Legibility Analysis**
2. **OpenAI Vision Slot Classification & Name Matching**
3. **Automated NMAT Score & Percentile Rank Extraction**

---

## 🔬 3-Tier AI Validation Workflow

```
+------------------+     +------------------------+     +------------------------+     +-------------------+
|  1. File Select  | --> |  2. Local Blur Check   | --> |  3. OpenAI Vision      | --> |  4. Auto-Rename & |
| (Camera/Gallery) |     | (Variance of Laplacian)|     | (Document Type Match)  |     |     Upload        |
+------------------+     +------------------------+     +------------------------+     +-------------------+
```

---

## 🛠️ Validation Pipeline Details

### Step 1: Local Image Quality & Blur Detection (`services/imageAnalysisService.ts`)
- Before transmitting large files over the network, the image is analyzed for clarity.
- Computes high-frequency edge variance (Laplacian operator estimation).
- If the clarity score falls below the threshold, the student receives an immediate alert prompting them to recapture the document in better lighting.

### Step 2: OpenAI Vision Slot & Name Matching
- Transmits a base64 thumbnail of the document to the AI vision endpoint.
- Verifies that:
  1. The document is genuine and corresponds to the designated requirement slot (e.g., uploading a PSA certificate into the PSA slot).
  2. The student's name on the document matches the logged-in student's profile name (`first_name` and `last_name`).
- If the document is mismatched or belongs to a different person, the upload is rejected with a descriptive explanation.
- If valid, the requirement status is automatically marked as **Approved / Validated**.

### Step 3: NMAT Score & Percentile Rank Extraction (`services/nmatExtractionService.ts`)
- For **NMAT (National Medical Admission Test)** requirement uploads, the system extracts:
  - Percentile Rank (e.g., `85%`, `92%`).
  - Examination Date & Candidate ID.
- Automatically updates the student's academic record (`students.nmat_score`) upon successful validation.

---

## 🏷️ Automatic File Renaming Standard

To ensure standard file formatting across the institutional document store, valid uploads are automatically reformatted:

```
[Student_Last_Name]_[Requirement_Name]_[Timestamp].[extension]
Example: DELACRUZ_PSA_Birth_Certificate_1724918291.pdf
```

---

## 📝 Waiver & Requirement Exemption Handling

Students with approved institutional waivers or non-applicable document slots (e.g., foreign student specific requirements for local students) can request or view exemption status:
- **Exempted Status**: Displayed with an institutional exemption badge.
- **Waiver Attachment**: Allows students to submit approved waiver letters directly within the folder view.
