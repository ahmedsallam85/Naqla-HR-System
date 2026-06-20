export const LOOKUP_CATEGORIES = [
  { key: "WORK_LOCATION", label: "Work Location" },
  { key: "BUSINESS_UNIT", label: "Business Unit" },
  { key: "DESIGNATION", label: "Designation" },
  { key: "DIVISION", label: "Division" },
  { key: "FUNCTION", label: "Function" },
  { key: "FUNCTION_TYPE", label: "Function Type" },
  { key: "VERTICAL", label: "Vertical" },
  { key: "JOB_LOCATION", label: "Job Location" },
  { key: "DEPARTMENT", label: "Department" },
  { key: "SYSTEM_AUTHORITY", label: "System Authority" },
  { key: "SOURCE_OF_HIRING", label: "Source of Hiring" },
] as const;

export type LookupCategoryKey = (typeof LOOKUP_CATEGORIES)[number]["key"];

export const LOOKUP_CATEGORY_KEYS = LOOKUP_CATEGORIES.map((c) => c.key) as LookupCategoryKey[];

export function isLookupCategory(value: string): value is LookupCategoryKey {
  return (LOOKUP_CATEGORY_KEYS as string[]).includes(value);
}
