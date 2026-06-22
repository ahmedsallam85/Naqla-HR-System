// Hay job evaluation engine. Formulas verified against the official Hay
// Group calculation manual (JE-HANDOUT-03 / reference-assets/). KH and PS
// validity colors were read from the official guide chart images
// (JE-HANDOUT-01); ACC's validity is still a placeholder -- the real
// Accountability chart doesn't show a Likely/Less likely/Improbable system
// at all, unlike KH and PS.

export type CodeOption = { code: string; label: string };
type TechOption = CodeOption & { base: number; index: number };
type OffsetOption = CodeOption & { offset: number };
type IndexedOption = CodeOption & { index: number };

// Bases shifted +15 vs. the original tool so they index directly into the
// extended master sequence (SEQ) shared with Problem-Solving below.
export const KH_TECH: TechOption[] = [
  { code: "A", base: 17, index: 0, label: "Primary" },
  { code: "B", base: 19, index: 1, label: "Elementary Vocational" },
  { code: "C", base: 21, index: 2, label: "Vocational" },
  { code: "D", base: 23, index: 3, label: "Advanced Vocational" },
  { code: "E", base: 25, index: 4, label: "Basic Professional" },
  { code: "F", base: 27, index: 5, label: "Seasoned Professional" },
  { code: "G", base: 29, index: 6, label: "Professional Mastery" },
  { code: "H", base: 31, index: 7, label: "Unique Authority" },
];

export const KH_FT: OffsetOption[] = [
  { code: "-", offset: -1, label: "Minus" },
  { code: "", offset: 0, label: "Standard" },
  { code: "+", offset: 1, label: "Plus" },
];

export const KH_MGMT_FT: OffsetOption[] = KH_FT;

export const KH_MGMT: IndexedOption[] = [
  { code: "T", index: 0, label: "Task Focused" },
  { code: "I", index: 1, label: "Specific" },
  { code: "II", index: 2, label: "Related" },
  { code: "III", index: 3, label: "Diverse" },
  { code: "IV", index: 4, label: "Broad" },
];

export const KH_HR: IndexedOption[] = [
  { code: "1", index: 0, label: "Basic" },
  { code: "2", index: 1, label: "Important" },
  { code: "3", index: 2, label: "Critical" },
];

// Hay's numerical scale is one continuous geometric (15%-step) sequence.
// Know-How values and Problem-Solving percentages are both slices of it,
// which is why combining them is index addition, not percentage multiplication
// (verified against JE-HANDOUT-03's worked example: KH=200, PS=29% -> 57,
// not round(200*0.29)=58). Index 23 = 100, the "no change" point.
const SEQ = [
  3, 4, 5, 6, 7, 8, 9, 10, 12, 14, 16, 19, 22, 25, 29, 33, 38, 43, 50, 57, 66,
  76, 87, 100, 115, 132, 152, 175, 200, 230, 264, 304, 350, 400, 460, 528, 608,
  700, 800, 920, 1056, 1216, 1400,
];
const SEQ_HUNDRED_INDEX = 23;

function seqIndexOf(value: number): number {
  return SEQ.indexOf(value);
}

export const PS_TE: IndexedOption[] = [
  { code: "A", index: 0, label: "Strict Routine" },
  { code: "B", index: 1, label: "Routine" },
  { code: "C", index: 2, label: "Semi-routine" },
  { code: "D", index: 3, label: "Standardized" },
  { code: "E", index: 4, label: "Clearly Defined" },
  { code: "F", index: 5, label: "Broadly Defined" },
  { code: "G", index: 6, label: "Generally Defined" },
  { code: "H", index: 7, label: "Abstractly Defined" },
];

export const PS_TC: IndexedOption[] = [
  { code: "1", index: 0, label: "Repetitive" },
  { code: "2", index: 1, label: "Patterned" },
  { code: "3", index: 2, label: "Variable" },
  { code: "4", index: 3, label: "Adaptive" },
  { code: "5", index: 4, label: "Uncharted" },
];

// [TE][TC] base ("no pull") percentage, verified against JE-HANDOUT-03's
// confirmed example (D/3 = 29%). Every cell actually spans two adjacent
// values on the geometric scale (the "+" fine-tune always steps up exactly
// one SEQ position from the base — see PS_FT below); there are no blocked
// combinations in the real Hay chart.
const PS_TABLE: number[][] = [
  [10, 14, 19, 25, 33],
  [12, 16, 22, 29, 38],
  [14, 19, 25, 33, 43],
  [16, 22, 29, 38, 50],
  [19, 25, 33, 43, 57],
  [22, 29, 38, 50, 66],
  [25, 33, 43, 57, 76],
  [29, 38, 50, 66, 87],
];

// Fine-tuning step applied on either the Thinking Environment or Thinking
// Challenge axis — Hay's "+" always takes the higher of the two values shown
// in the chart box, which is exactly one step up the shared geometric scale.
// There is no "-" for Problem-Solving.
export const PS_FT: OffsetOption[] = [
  { code: "", offset: 0, label: "Standard" },
  { code: "+", offset: 1, label: "Plus" },
];

export const ACC_FTA: IndexedOption[] = [
  { code: "A", index: 0, label: "Closely Controlled" },
  { code: "B", index: 1, label: "Controlled" },
  { code: "C", index: 2, label: "Standardised" },
  { code: "D", index: 3, label: "Generally Regulated" },
  { code: "E", index: 4, label: "Clearly Directed" },
  { code: "F", index: 5, label: "Generally Directed" },
  { code: "G", index: 6, label: "Guided" },
  { code: "H", index: 7, label: "Strategically Guided" },
];

export const ACC_MAG: IndexedOption[] = [
  { code: "N", index: 0, label: "Non-Quantifiable" },
  { code: "1", index: 1, label: "Very Small" },
  { code: "2", index: 2, label: "Small" },
  { code: "3", index: 3, label: "Medium" },
  { code: "4", index: 4, label: "Large" },
  { code: "5", index: 5, label: "Very Large" },
];

export const ACC_TYPE_N: IndexedOption[] = [
  { code: "I", index: 0, label: "Indirect" },
  { code: "II", index: 1, label: "Contributory" },
  { code: "III", index: 2, label: "Shared" },
  { code: "IV", index: 3, label: "Primary" },
];

export const ACC_TYPE_Q: IndexedOption[] = [
  { code: "R", index: 0, label: "Remote" },
  { code: "C", index: 1, label: "Contributory" },
  { code: "S", index: 2, label: "Shared" },
  { code: "P", index: 3, label: "Prime" },
];

const ACC_S = [
  10, 14, 19, 25, 33, 43, 57, 76, 100, 132, 175, 230, 304, 400, 528, 700,
];

export type HayLevelBand = { level: string; min: number; max: number };

export const HAY_LEVEL_BANDS: HayLevelBand[] = [
  { level: "Hay 4", min: 0, max: 62 },
  { level: "Hay 5", min: 63, max: 72 },
  { level: "Hay 6", min: 73, max: 84 },
  { level: "Hay 7", min: 85, max: 97 },
  { level: "Hay 8", min: 98, max: 113 },
  { level: "Hay 9", min: 114, max: 134 },
  { level: "Hay 10", min: 135, max: 160 },
  { level: "Hay 11", min: 161, max: 191 },
  { level: "Hay 12", min: 192, max: 227 },
  { level: "Hay 13", min: 228, max: 268 },
  { level: "Hay 14", min: 269, max: 313 },
  { level: "Hay 15", min: 314, max: 370 },
  { level: "Hay 16", min: 371, max: 437 },
  { level: "Hay 17", min: 438, max: 518 },
  { level: "Hay 18", min: 519, max: 613 },
  { level: "Hay 19", min: 614, max: 734 },
  { level: "Hay 20", min: 735, max: 879 },
  { level: "Hay 21", min: 880, max: 1055 },
  { level: "Hay 22", min: 1056, max: 1260 },
  { level: "Hay 23", min: 1261, max: 1566 },
  { level: "Hay 24", min: 1567, max: 1865 },
  { level: "Hay 25", min: 1866, max: 2130 },
  { level: "Hay 26", min: 2131, max: 2675 },
  { level: "Hay 27", min: 2676, max: Infinity },
];

// Validity banners (white/yellow/blue).
export type Validity = "white" | "yellow" | "blue";

// [techIndex (A-H)][mgmtIndex (T-IV)][hrIndex (1-3)], read from the official
// guide chart's Likely/Less likely/Improbable shading. Validity does not vary
// across the 3 technical fine-tuning sub-rows within a lettered band (verified
// directly against the chart for rows A and B), only across the letter itself
// -- this is a real finding from the source chart, not the same shape as the
// old 2D placeholder. Rows A-D were cross-checked multiple times and are high
// confidence; rows E-H, especially H, were harder to read precisely off the
// chart image and are best-effort -- worth spot-checking against the source
// PDF at full resolution if a flagged combination looks wrong in practice.
const KH_COLOR: Validity[][][] = [
  // A. Primary
  [
    ["white", "yellow", "yellow"], // T
    ["blue", "blue", "blue"], // I
    ["blue", "blue", "blue"], // II
    ["blue", "blue", "blue"], // III
    ["blue", "blue", "blue"], // IV
  ],
  // B. Elementary Vocational
  [
    ["white", "white", "yellow"],
    ["blue", "blue", "yellow"],
    ["blue", "blue", "blue"],
    ["blue", "blue", "blue"],
    ["blue", "blue", "blue"],
  ],
  // C. Vocational
  [
    ["white", "white", "white"],
    ["white", "white", "white"],
    ["white", "white", "white"],
    ["white", "white", "white"],
    ["white", "white", "white"],
  ],
  // D. Advanced Vocational
  [
    ["yellow", "white", "white"],
    ["white", "yellow", "white"],
    ["white", "yellow", "white"],
    ["white", "white", "white"],
    ["white", "white", "white"],
  ],
  // E. Basic Professional
  [
    ["white", "white", "white"],
    ["white", "white", "white"],
    ["yellow", "white", "white"],
    ["white", "white", "white"],
    ["white", "white", "white"],
  ],
  // F. Seasoned Professional
  [
    ["blue", "white", "white"],
    ["white", "white", "white"],
    ["white", "white", "white"],
    ["yellow", "white", "yellow"],
    ["white", "yellow", "white"],
  ],
  // G. Professional Mastery
  [
    ["blue", "blue", "white"],
    ["white", "white", "yellow"],
    ["yellow", "white", "white"],
    ["white", "yellow", "white"],
    ["white", "white", "white"],
  ],
  // H. Unique Authority
  [
    ["blue", "blue", "blue"],
    ["yellow", "white", "yellow"],
    ["white", "yellow", "white"],
    ["white", "white", "yellow"],
    ["yellow", "white", "white"],
  ],
];

// Read from the official guide chart's Likely/Less likely/Improbable
// shading, anchored against the same cells confirmed by JE-HANDOUT-03.
const PS_COLOR: Validity[][] = [
  ["white", "yellow", "blue", "blue", "blue"],
  ["yellow", "white", "blue", "blue", "blue"],
  ["blue", "white", "white", "blue", "blue"],
  ["blue", "yellow", "white", "yellow", "blue"],
  ["blue", "blue", "white", "white", "yellow"],
  ["blue", "blue", "yellow", "white", "yellow"],
  ["blue", "blue", "blue", "white", "yellow"],
  ["blue", "blue", "blue", "yellow", "white"],
];

const ACC_COLOR: Validity[][] = [
  ["white", "white", "yellow", "blue"],
  ["white", "white", "white", "yellow"],
  ["white", "white", "white", "white"],
  ["white", "white", "white", "white"],
  ["yellow", "white", "white", "white"],
  ["yellow", "white", "white", "white"],
  ["blue", "yellow", "white", "white"],
  ["blue", "yellow", "white", "white"],
];

function find<T extends CodeOption>(options: T[], code: string | undefined): T | undefined {
  return options.find((o) => o.code === code);
}

export function getAccTypeOptions(accMag: string | undefined): IndexedOption[] {
  return accMag === "N" ? ACC_TYPE_N : ACC_TYPE_Q;
}

export type KhInput = {
  khTech?: string;
  khFt?: string;
  khMgmt?: string;
  khMgmtFt?: string;
  khHr?: string;
};

export function getKhPoints(input: KhInput): number | null {
  const tech = find(KH_TECH, input.khTech);
  const ft = find(KH_FT, input.khFt);
  const mgmt = find(KH_MGMT, input.khMgmt);
  const mgmtFt = find(KH_MGMT_FT, input.khMgmtFt);
  const hr = find(KH_HR, input.khHr);
  if (!tech || !ft || !mgmt || !mgmtFt || !hr) return null;

  const idx = tech.base + ft.offset + mgmt.index * 2 + mgmtFt.offset + hr.index;
  const clamped = Math.min(Math.max(idx, 0), SEQ.length - 1);
  return SEQ[clamped];
}

export function getKhNotation(input: KhInput): string {
  return `${input.khTech ?? ""}${input.khFt ?? ""} / ${input.khMgmt ?? ""}${input.khMgmtFt ?? ""} / ${input.khHr ?? ""}`;
}

export function getKhValidity(
  khTech: string | undefined,
  khMgmt: string | undefined,
  khHr: string | undefined
): Validity | null {
  const tech = find(KH_TECH, khTech);
  const mgmt = find(KH_MGMT, khMgmt);
  const hr = find(KH_HR, khHr);
  if (!tech || !mgmt || !hr) return null;
  return KH_COLOR[tech.index][mgmt.index][hr.index];
}

export function getPsPercent(
  psTe: string | undefined,
  psTc: string | undefined,
  psFt: string | undefined
): number | null {
  const te = find(PS_TE, psTe);
  const tc = find(PS_TC, psTc);
  const ft = find(PS_FT, psFt ?? "");
  if (!te || !tc || !ft) return null;
  const base = PS_TABLE[te.index][tc.index];
  const baseIdx = seqIndexOf(base);
  return SEQ[Math.min(baseIdx + ft.offset, SEQ.length - 1)];
}

export function getPsPoints(
  khPoints: number | null,
  psTe: string | undefined,
  psTc: string | undefined,
  psFt?: string
): number | null {
  if (khPoints == null) return null;
  const percent = getPsPercent(psTe, psTc, psFt);
  if (percent == null) return null;

  const khIdx = seqIndexOf(khPoints);
  const percentIdx = seqIndexOf(percent);
  if (khIdx === -1 || percentIdx === -1) return null;

  const resultIdx = khIdx + percentIdx - SEQ_HUNDRED_INDEX;
  if (resultIdx < 0) return null;
  return SEQ[Math.min(resultIdx, SEQ.length - 1)];
}

export function getPsValidity(psTe: string | undefined, psTc: string | undefined): Validity | null {
  const te = find(PS_TE, psTe);
  const tc = find(PS_TC, psTc);
  if (!te || !tc) return null;
  return PS_COLOR[te.index][tc.index];
}

export function getAccPoints(
  accFta: string | undefined,
  accMag: string | undefined,
  accType: string | undefined
): number | null {
  const fta = find(ACC_FTA, accFta);
  const mag = find(ACC_MAG, accMag);
  const type = find(getAccTypeOptions(accMag), accType);
  if (!fta || !mag || !type) return null;
  const idx = Math.min(Math.max(fta.index + mag.index + type.index, 0), ACC_S.length - 1);
  return ACC_S[idx];
}

export function getAccValidity(
  accFta: string | undefined,
  accType: string | undefined
): Validity | null {
  const fta = find(ACC_FTA, accFta);
  if (!fta || !accType) return null;
  // Type index is consistent across both N and Q variants (0-3).
  const typeIndex = ["I", "R"].includes(accType)
    ? 0
    : ["II", "C"].includes(accType)
      ? 1
      : ["III", "S"].includes(accType)
        ? 2
        : ["IV", "P"].includes(accType)
          ? 3
          : null;
  if (typeIndex == null) return null;
  return ACC_COLOR[fta.index][typeIndex];
}

export function getHayLevel(totalPoints: number): string | null {
  const band = HAY_LEVEL_BANDS.find((b) => totalPoints >= b.min && totalPoints <= b.max);
  return band ? band.level : null;
}
