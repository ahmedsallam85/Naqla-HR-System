# Hay Job Evaluation Tool — Continuation File
*Last updated: June 2026 — current session*

---

## Primary Deliverable
**`hay-job-evaluation.html`** — single self-contained HTML file (all CSS + JS inline).
Location: `C:\Users\NermineShawky\OneDrive - NAQLA Trucking\Documents\NERMINE SHAWKY\AI\JE - AI\`

JavaScript `<script>` block starts at **line ~779**.

---

## Reference Files (same folder)
| File | Purpose |
|------|---------|
| `JE-HANDOUT-01 = HAY-CHARTS (FULL).pdf` | Source of truth — all 3 guide charts incl. exact cell values & White/Yellow/Blue colors |
| `JE-HANDOUT-03` | Terminology reference (labels for KH, PS dimensions) |
| `Hey Buckets.xlsx` | Hay Level grade breakpoints (HAY-LEVEL col, levels 4–27) |
| `Professional Ladders & Minimum Experience.PNG` | D/E/F fine-tuning descriptions & PQE years |
| `HAY-TOOL-CONTINUATION.md` | This file |

---

## Tool Flow (5 steps)
1. **Role Info** — title, department, evaluator, date
2. **Know-How** — 5 sub-selectors (Tech + Tech FT + Mgmt + Mgmt FT + HR)
3. **Problem Solving** — 2 selectors (TE + TC) — shows % and points
4. **Accountability** — 3 selectors (FTA + Magnitude + dynamic Type)
5. **Results** — total Hay points, level, factor bars, full summary table

Color validity banner (White/Yellow/Blue) appears after each factor is complete.

---

## FACTOR 1 — Know-How

### Full Formula
```
idx = KH_TECH[khTech].base
    + KH_FT[khFt].offset          — tech fine-tuning (−1 / 0 / +1)
    + khMgmt × 2                  — each mgmt step = 2 HAY_SEQ steps
    + KH_MGMT_FT[khMgmtFt].offset — mgmt fine-tuning (−1 / 0 / +1)
    + khHr                        — HR index (0/1/2)

KH_points = HAY_SEQ[ clamp(idx, 0, 27) ]
```

### HAY_SEQ (index 0–27)
```
Idx:  0    1    2    3    4    5    6    7    8    9   10   11   12   13
Val: 33   38   43   50   57   66   76   87  100  115  132  152  175  200

Idx: 14   15   16   17   18   19   20   21   22   23   24   25   26   27
Val: 230  264  304  350  400  460  528  608  700  800  920 1056 1216 1400
```

### State keys for KH
`khTech`, `khFt`, `khMgmt`, `khMgmtFt`, `khHr` — all required (default −1)

### KH_TECH — 8 levels
| Code | Base idx | Label |
|------|----------|-------|
| A | 2 | Primary |
| B | 4 | Elementary Vocational |
| C | 6 | Vocational |
| D | 8 | Advanced Vocational |
| E | 10 | Basic Professional |
| F | 12 | Seasoned Professional |
| G | 14 | Professional Mastery |
| H | 16 | Unique Authority |

### KH_FT & KH_MGMT_FT (identical structure)
| Code | Offset | Label |
|------|--------|-------|
| − | −1 | Minus |
| (blank) | 0 | Standard |
| + | +1 | Plus |

### KH_MGMT — 5 levels (mgmt_index × 2 in formula)
| Code | Index | Label |
|------|-------|-------|
| T | 0 | Task Focused |
| I | 1 | Specific |
| II | 2 | Related |
| III | 3 | Diverse |
| IV | 4 | Broad |

### KH_HR — 3 levels
| Code | hr_index | Label |
|------|----------|-------|
| 1 | 0 | Basic |
| 2 | 1 | Important |
| 3 | 2 | Critical |

### Notation displayed
Format: `D+ / II− / 3` (techCode + ftCode / mgmtCode + mgmtFtCode / hrCode)

### Verified test cases
| Selection | idx | KH pts |
|-----------|-----|--------|
| D Std / T Std / HR3 | 8+0+0+0+2 = 10 | **132** ✓ |
| D− / T Std / HR3 | 8−1+0+0+2 = 9 | **115** ✓ |
| D+ / T Std / HR3 | 8+1+0+0+2 = 11 | **152** ✓ |

---

## FACTOR 2 — Problem Solving

### Formula
```
PS_points = round( KH_points × PS_TABLE[psTe][psTc] / 100 )
```

### PS_TABLE — [TE 0–7][TC 0–4], values are %, null = blocked
```
       TC1   TC2   TC3   TC4   TC5
A:      10    14    —     —     —
B:      14    19    25    —     —
C:      19    25    33    43    —
D:      25    33    43    57    66
E:      33    43    57    66    76
F:      43    57    66    76    87
G:      57    66    76    87    —
H:      66    76    87    —     —
```

### PS_TE (Thinking Environment) — 8 rows
A Strict Routine · B Routine · C Semi-routine · D Standardized · E Clearly Defined · F Broadly Defined · G Generally Defined · H Abstractly Defined

### PS_TC (Thinking Challenge) — 5 columns
1 Repetitive · 2 Patterned · 3 Variable · 4 Adaptive · 5 Uncharted

### State keys: `psTe`, `psTc`

---

## FACTOR 3 — Accountability

### Formula
```
ACC_S = [10,14,19,25,33,43,57,76,100,132,175,230,304,400,528,700]
ACC_points = ACC_S[ clamp(accFta + accMag + accType, 0, 15) ]
```

Each FTA step, Magnitude step, and Type step = 1 position in ACC_S.

### ACC_FTA — 8 rows (index 0–7)
| Code | Index | Label |
|------|-------|-------|
| A | 0 | Closely Controlled |
| B | 1 | Controlled |
| C | 2 | Standardised |
| D | 3 | Generally Regulated |
| E | 4 | Clearly Directed |
| F | 5 | Generally Directed |
| G | 6 | Guided |
| H | 7 | Strategically Guided |

### ACC_MAG — 6 levels (index 0–5)
| Code | Index | Label |
|------|-------|-------|
| N | 0 | Non-Quantifiable |
| 1 | 1 | Very Small |
| 2 | 2 | Small |
| 3 | 3 | Medium |
| 4 | 4 | Large |
| 5 | 5 | Very Large |

### ACC_TYPE — **DYNAMIC** (re-renders when Magnitude changes)
- **Magnitude = N** — `ACC_TYPE_N`: I (Indirect) · II (Contributory) · III (Shared) · IV (Primary)
- **Magnitude = 1–5** — `ACC_TYPE_Q`: R (Remote) · C (Contributory) · S (Shared) · P (Prime)

`accType` resets to −1 every time magnitude changes.

### State keys: `accFta`, `accMag`, `accType`

---

## Hay Level Grade Bands — from Hey Buckets.xlsx
| Level | Min | Max | Level | Min | Max |
|-------|-----|-----|-------|-----|-----|
| Hay 4 | 0 | 62 | Hay 16 | 371 | 437 |
| Hay 5 | 63 | 72 | Hay 17 | 438 | 518 |
| Hay 6 | 73 | 84 | Hay 18 | 519 | 613 |
| Hay 7 | 85 | 97 | Hay 19 | 614 | 734 |
| Hay 8 | 98 | 113 | Hay 20 | 735 | 879 |
| Hay 9 | 114 | 134 | Hay 21 | 880 | 1055 |
| Hay 10 | 135 | 160 | Hay 22 | 1056 | 1260 |
| Hay 11 | 161 | 191 | Hay 23 | 1261 | 1566 |
| Hay 12 | 192 | 227 | Hay 24 | 1567 | 1865 |
| Hay 13 | 228 | 268 | Hay 25 | 1866 | 2130 |
| Hay 14 | 269 | 313 | Hay 26 | 2131 | 2675 |
| Hay 15 | 314 | 370 | Hay 27 | 2676 | — |

---

## Color Validity Matrices

### How colors work in the tool
After both dimensions of a factor are selected, a banner appears:
- **White ✓** — Valid/likely combination, no issue
- **Yellow ⚠** — Unusual, needs justification before proceeding
- **Blue ✗** — Invalid — tool blocks navigation to next step

### 🔴 PENDING: All three matrices need correction from actual PDF charts
User confirmed current logic is **incorrect**. Must get screenshots of:
1. KH Guide Chart (rows A–H, columns T/I/II/III/IV × HR 1/2/3)
2. PS Guide Chart (rows A–H × columns 1–5)
3. ACC Guide Chart (rows A–H × columns N·I–IV and 1–5 R/C/S/P)

**How to fix once screenshots are available:**
- Read the color of each non-null cell
- Update `KH_COLOR[mgmt_idx][hr_idx]`
- Update `PS_COLOR[te_idx][tc_idx]`
- Update `ACC_COLOR[fta_idx][type_idx]`

### Current placeholder matrices (approximate logic only)

**KH_COLOR** `[mgmt 0–4][hr 0–2]`
```js
const KH_COLOR = [
  ['white',  'yellow', 'blue'  ],  // T
  ['white',  'white',  'yellow'],  // I
  ['white',  'white',  'white' ],  // II
  ['yellow', 'white',  'white' ],  // III
  ['blue',   'yellow', 'white' ],  // IV
];
```

**PS_COLOR** `[te 0–7][tc 0–4]`
```js
const PS_COLOR = [
  ['white',  'yellow', null,    null,    null  ],  // A
  ['yellow', 'white',  'white', null,    null  ],  // B
  ['white',  'white',  'white', 'white', null  ],  // C
  ['yellow', 'white',  'white', 'white', 'white'],  // D
  ['yellow', 'white',  'white', 'white', 'white'],  // E
  ['blue',   'yellow', 'white', 'white', 'white'],  // F
  ['blue',   'yellow', 'white', 'white', null  ],  // G
  ['yellow', 'white',  'white', null,    null  ],  // H
];
```

**ACC_COLOR** `[fta 0–7][type 0–3]`
```js
const ACC_COLOR = [
  ['white',  'white',  'yellow', 'blue'  ],  // A Closely Controlled
  ['white',  'white',  'white',  'yellow'],  // B Controlled
  ['white',  'white',  'white',  'white' ],  // C Standardised
  ['white',  'white',  'white',  'white' ],  // D Generally Regulated
  ['yellow', 'white',  'white',  'white' ],  // E Clearly Directed
  ['yellow', 'white',  'white',  'white' ],  // F Generally Directed
  ['blue',   'yellow', 'white',  'white' ],  // G Guided
  ['blue',   'yellow', 'white',  'white' ],  // H Strategically Guided
];
```

---

## Key JS Functions

| Function | What it does |
|----------|-------------|
| `getKhPoints()` | Full KH formula with both fine-tunings |
| `getPsPoints()` | `round(KH × PS% / 100)` |
| `getAccPoints()` | `ACC_S[fta + mag + type]` |
| `getKhNotation()` | Returns e.g. `D+ / II− / 3` |
| `getAccTypeOptions()` | Returns `ACC_TYPE_N` or `ACC_TYPE_Q` based on `accMag` |
| `renderAccTypeOpts()` | Re-renders Type options + resets `accType = −1` |
| `updateKhDisplay()` | Refreshes KH score + color banner |
| `updatePsDisplay()` | Refreshes PS % display + color banner |
| `updateAccLive()` | Refreshes live total preview + ACC color banner |
| `showValidity()` | Shows/hides White/Yellow/Blue banner |
| `calculate()` | Final calculation — navigates to Results (step 4) |
| `reset()` | Clears all state, re-renders everything |
| `init()` | Renders all option lists (called on load + reset) |

---

## init() render order (must match HTML container IDs)
```js
renderOptions('kh-tech-opts',    KH_TECH,    'khTech',    updateKhDisplay);
renderOptions('kh-ft-opts',      KH_FT,      'khFt',      updateKhDisplay);
renderOptions('kh-mgmt-opts',    KH_MGMT,    'khMgmt',    updateKhDisplay);
renderOptions('kh-mgmt-ft-opts', KH_MGMT_FT, 'khMgmtFt',  updateKhDisplay);
renderOptions('kh-hr-opts',      KH_HR,      'khHr',      updateKhDisplay);
renderPsOptions();   // renders ps-te-opts + ps-tc-opts
renderOptions('acc-fta-opts',    ACC_FTA,    'accFta',    updateAccLive);
renderOptions('acc-mag-opts',    ACC_MAG,    'accMag',    () => { renderAccTypeOpts(); updateAccLive(); });
renderOptions('acc-type-opts',   ACC_TYPE_N, 'accType',   updateAccLive);  // initial = N types
```

---

## Completed Work
| # | Item | Status |
|---|------|--------|
| 1 | Full 5-step HTML tool | ✓ |
| 2 | HAY_SEQ extended to start from 33 (28 steps) | ✓ |
| 3 | KH formula with mgmt×2 | ✓ |
| 4 | KH_TECH 8 levels (A–H) with correct bases | ✓ |
| 5 | KH_FT fine-tuning (−/Std/+) for technical depth | ✓ |
| 6 | KH_MGMT_FT fine-tuning (−/Std/+) for management breadth | ✓ |
| 7 | KH_MGMT labels: T/I/II/III/IV = Task Focused/Specific/Related/Diverse/Broad | ✓ |
| 8 | PS_TE 8 rows incl. H Abstractly Defined | ✓ |
| 9 | PS_TABLE with correct % values | ✓ |
| 10 | ACC_FTA correct labels (Closely Controlled → Strategically Guided) | ✓ |
| 11 | ACC_MAG 6 levels (N/1/2/3/4/5) | ✓ |
| 12 | ACC_TYPE dynamic (N→I/II/III/IV; 1–5→R/C/S/P) | ✓ |
| 13 | Grade lookup from Hey Buckets.xlsx | ✓ |
| 14 | Color validity banners (structure correct, values approximate) | ⚠ |

## Pending
| Priority | Item |
|----------|------|
| 🔴 HIGH | Fix KH_COLOR, PS_COLOR, ACC_COLOR from actual PDF chart screenshots |

## How to Resume Color Work
1. Share screenshots of all 3 Hay guide charts from `JE-HANDOUT-01 = HAY-CHARTS (FULL).pdf`
2. For each chart, read the color (white/yellow/blue) of every non-null cell
3. Update the three color arrays in the JS block around lines 960–1030 of the HTML file

---

## Ported into the NAQLA HR AI System (2026-06-22)

This logic now lives in `lib/hay-evaluation.ts` in the main app (`naqla-hr-system`), backing the
**Job Grading** module (`/job-grading`). All formulas and lookup tables above were ported and
verified against the documented test cases. The KH_COLOR/PS_COLOR/ACC_COLOR matrices were ported
as-is and are still placeholders — update them in `lib/hay-evaluation.ts` once the corrected values
from the PDF charts are available. The Naqla-grade-and-compensation-bracket mapping mentioned in the
original HR spec was deliberately deferred — it's not built yet.
