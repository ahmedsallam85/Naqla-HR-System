// Critical Position Assessment scoring engine, structured per
// reference-assets/CPA-TOOL-CONTINUATION.md: 13 questions across 5 sections,
// each scored 0-5, max total 65. The section groupings, weights, and
// priority thresholds are from the source tool. The exact question wording
// was not specified in the source notes (only section names/definitions),
// so the items below are standard succession-planning questions written to
// match each section's stated purpose -- review/refine wording with HR
// before relying on it for real decisions.

export type Question = {
  id: string;
  section: number;
  label: string;
};

export const SECTIONS = [
  { id: 1, label: "Specialised Knowledge & Expertise", max: 15 },
  { id: 2, label: "Difficulty to Replace", max: 10 },
  { id: 3, label: "Difficulty to Retain", max: 10 },
  { id: 4, label: "Risk of Attrition", max: 15 },
  { id: 5, label: "Retirement Vulnerability", max: 15 },
] as const;

export const QUESTIONS: Question[] = [
  // S1: Specialised Knowledge & Expertise (max 15)
  { id: "q1", section: 1, label: "How specialised is the knowledge/expertise required for this role compared to other roles in the company?" },
  { id: "q2", section: 1, label: "How long would it take a new hire to become fully competent in this role?" },
  { id: "q3", section: 1, label: "How rare is this skill set in the external job market?" },
  // S2: Difficulty to Replace (max 10)
  { id: "q4", section: 2, label: "How difficult would it be to find an external replacement for this role?" },
  { id: "q5", section: 2, label: "How long would the recruitment process likely take if this position became vacant?" },
  // S3: Difficulty to Retain (max 10)
  { id: "q6", section: 3, label: "How actively is this person being pursued by competitors or other external parties?" },
  { id: "q7", section: 3, label: "How difficult would it be to retain this person with standard retention measures?" },
  // S4: Risk of Attrition (max 15)
  { id: "q8", section: 4, label: "How dissatisfied does this person appear to be in their current role?" },
  { id: "q9", section: 4, label: "Has this person shown any signs of disengagement or intent to leave?" },
  { id: "q10", section: 4, label: "How mobile is this person likely to be (e.g. market demand, personal circumstances)?" },
  // S5: Retirement Vulnerability (max 15)
  { id: "q11", section: 5, label: "How close is this person to typical retirement age?" },
  { id: "q12", section: 5, label: "Has a retirement or succession date been discussed or planned?" },
  { id: "q13", section: 5, label: "Is there an identified and ready successor for this role?" },
];

export type Priority = "IMPERATIVE" | "IMPORTANT" | "DISCRETIONARY" | "NOT_URGENT";

export const PRIORITY_INFO: Record<Priority, { label: string; range: string; action: string }> = {
  IMPERATIVE: { label: "Imperative", range: "51-65", action: "Plan within 30 days" },
  IMPORTANT: { label: "Important", range: "41-50", action: "High priority - 3-6 months" },
  DISCRETIONARY: { label: "Discretionary", range: "31-40", action: "Plan within 1-2 years" },
  NOT_URGENT: { label: "Not Urgent", range: "0-30", action: "Annual review sufficient" },
};

export function computeSectionScores(scores: number[]): number[] {
  return SECTIONS.map((section) => {
    const questionIndices = QUESTIONS.reduce<number[]>((acc, q, i) => {
      if (q.section === section.id) acc.push(i);
      return acc;
    }, []);
    return questionIndices.reduce((sum, i) => sum + (scores[i] ?? 0), 0);
  });
}

export function computeTotal(scores: number[]): number {
  return scores.reduce((sum, s) => sum + (s ?? 0), 0);
}

export function computePriority(total: number): Priority {
  if (total >= 51) return "IMPERATIVE";
  if (total >= 41) return "IMPORTANT";
  if (total >= 31) return "DISCRETIONARY";
  return "NOT_URGENT";
}
