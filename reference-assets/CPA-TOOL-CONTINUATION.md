# Naqla CPA Tool — Continuation Notes
**Last updated:** 2026-06-22
**File:** `Naqla_Critical_Position_Assessment.html`
**Location:** `C:\Users\NermineShawky\OneDrive - NAQLA Trucking\Documents\NERMINE SHAWKY\AI\Critical Role - AI\`

---

## What This Tool Is

A standalone, offline single-file HTML tool for Naqla's People & Culture team.
Purpose: **Critical Position Assessment (CPA)** for succession planning.
No server needed — open directly in any browser. All data saved to `localStorage`.

---

## Current Tab Structure

| Tab | ID | Purpose |
|-----|----|---------|
| 1 Setup Roles | `tab-setup` | Designation database + assessment queue |
| 2 Assess | `tab-assess` | 13-question Likert scoring per role |
| 3 Results | `tab-results` | Dashboard, bar chart, results table, Excel export |
| 4 Success Profile | `tab-success` | SIGMA-style success profile form for critical roles |

---

## Architecture

### State Object
```javascript
let state = {
  designations: [],      // Master database of all company positions
  roles: [],             // Assessment queue (subset sent for scoring)
  successProfiles: {}    // Keyed by role name, stores SP form data
};
const STORAGE_KEY = 'naqla_cpa_v2';
```

### Role Object Shape
```javascript
{
  role: 'Fleet Manager',
  holder: 'Ahmed Ali',
  grade: 'G8',
  status: 'pending' | 'done',
  scores: [0-5, ...],        // 13 values
  sectionScores: [s1,s2,s3,s4,s5],
  total: 0-65,
  priority: 'Imperative' | 'Important' | 'Discretionary' | 'Not Urgent' | null
}
```

### Designation Object Shape
```javascript
{ role: 'Job Title', grade: 'G7', holder: 'Name' }
```

### Success Profile Object Shape
```javascript
{
  incumbent, year, location, level, area,
  edu, exp1, exp2, exp3, know,
  sk1, sk2, sk3, sk4,
  duty1, duty2, duty3, duty4, duty5,
  leadCur, leadFut, coreCur, coreFut,
  ei, otherCur, otherFut,
  urgency   // 1-5 star rating
}
```

---

## Scoring System

- **13 questions** across 5 sections, each scored 0-5 (max total: 65)
- Sections:
  - S1: Specialised Knowledge & Expertise (Q1-3, max 15)
  - S2: Difficulty to Replace (Q4-5, max 10)
  - S3: Difficulty to Retain (Q6-7, max 10)
  - S4: Risk of Attrition (Q8-10, max 15)
  - S5: Retirement Vulnerability (Q11-13, max 15)

| Score | Priority | Action |
|-------|----------|--------|
| 51-65 | Imperative | Immediate — plan within 30 days |
| 41-50 | Important | High priority — 3-6 months |
| 31-40 | Discretionary | Plan within 1-2 years |
| 0-30  | Not Urgent | Annual review sufficient |

---

## Key Features Implemented (source tool)

### Setup Tab
- Designation Database — permanent master list of all company positions
- Single entry (with autocomplete + duplicate detection) and bulk import (Excel upload or paste)
- Search/filter, select all/deselect all, delete per item or clear all
- "Add selected to Assessment" button sends checked roles to the queue

### Assess Tab
- Shows next pending role automatically
- Live score + priority badge updates as questions are answered
- Skip and Save & Next navigation

### Results Tab
- 4 metric cards (count per priority)
- Horizontal bar chart sorted by score descending
- Full results table with section sub-scores
- "Success Profile" button in each row for Imperative/Important roles
- Export to Excel (3 sheets: Results, Question Reference, Scoring Guide)

### Success Profile Tab
- Activated from any critical (Imperative/Important) role
- Form mirrors SIGMA Succession success profile template:
  - Header: Position, Incumbent, Eligibility Year, Urgency (clickable stars)
  - Left panel: Position Demographics (Location/Level/Area) + Position Criteria (Edu/Exp x3/Know/Skill x4/Duty x5)
  - Right panel: Leadership Profile grid (Leadership / Core Role / EI / Other — Current + Future)
- Urgency auto-set: 5 stars for Imperative, 3 stars for Important

---

## Ported into the NAQLA HR AI System (2026-06-22)

This logic now lives in `lib/critical-assessment.ts` in the main app
(`naqla-hr-system`), backing the **Critical Positions** module
(`/critical-positions`). The section groupings, weights, and priority
thresholds above were ported as specified. The source notes did not include
the exact 13 question texts (only section names/definitions) — the question
wording used in the app is a standard succession-planning question set
written to match each section's stated purpose, not a verbatim transcription.
Review/refine wording with HR before relying on it for real decisions.

The single-page tabbed UI (Setup/Assess/Results/Success Profile) and the
"assessment queue" concept were adapted into the app's normal multi-page,
per-record pattern (consistent with Personnel and Job Grading): each
Designation has its own detail page with an assessment history and a
Success Profile, reached directly rather than via a queue. The bar-chart
dashboard and the 3-sheet Excel export (Question Reference / Scoring Guide
sheets) were not carried over in the first pass — only a single results
sheet — to keep scope tight; can be added later if wanted.
