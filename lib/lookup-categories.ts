export const LOOKUP_CATEGORIES = [
  // Org / employment dropdowns
  { key: "WORK_LOCATION", label: "Work Location" },
  { key: "BUSINESS_UNIT", label: "Business Unit" },
  { key: "DESIGNATION", label: "Designation (Job Title)" },
  { key: "DIVISION", label: "Division" },
  { key: "FUNCTION", label: "Function" },
  { key: "FUNCTION_TYPE", label: "Function Type" },
  { key: "VERTICAL", label: "Vertical" },
  { key: "JOB_LOCATION", label: "Job Location" },
  { key: "DEPARTMENT", label: "Department" },
  { key: "SYSTEM_AUTHORITY", label: "System Authority" },
  { key: "SOURCE_OF_HIRING", label: "Hiring Source" },
  // People Directory (Employee Master Log) dropdowns
  { key: "NATIONALITY", label: "Nationality" },
  { key: "EMERGENCY_CONTACT_RELATIONSHIP", label: "Emergency Contact Relationship" },
  { key: "LEGAL_ENTITY", label: "Legal Entity" },
  { key: "COST_CENTER", label: "Cost Center" },
  { key: "WORK_PERMIT_STATUS", label: "Work Permit Status" },
  { key: "LABOR_LAW_CATEGORY", label: "Labor Law Category" },
  // Compensation dropdowns
  { key: "COMPENSATION_EXTRA_TYPE", label: "Compensation Extra Type" },
  { key: "COMPENSATION_DEDUCTION_TYPE", label: "Compensation Deduction Type" },
] as const;

export type LookupCategoryKey = (typeof LOOKUP_CATEGORIES)[number]["key"];

export const LOOKUP_CATEGORY_KEYS = LOOKUP_CATEGORIES.map((c) => c.key) as LookupCategoryKey[];

export function isLookupCategory(value: string): value is LookupCategoryKey {
  return (LOOKUP_CATEGORY_KEYS as string[]).includes(value);
}
