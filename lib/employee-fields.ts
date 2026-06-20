import type { LookupCategoryKey } from "@/lib/lookup-categories";

export type FieldType = "text" | "email" | "date" | "number" | "select";

export type FieldConfig = {
  name: string;
  label: string;
  type: FieldType;
  required?: boolean;
  options?: { value: string; label: string }[];
  lookupCategory?: LookupCategoryKey;
};

export const IDENTITY_FIELDS: FieldConfig[] = [
  { name: "firstName", label: "First name", type: "text", required: true },
  { name: "lastName", label: "Last name", type: "text", required: true },
  { name: "businessEmail", label: "Business email", type: "email", required: true },
  { name: "personalEmail", label: "Personal email", type: "email" },
  { name: "photoUrl", label: "Photo URL", type: "text" },
];

export const ORG_FIELDS: FieldConfig[] = [
  { name: "workLocation", label: "Work location", type: "select", lookupCategory: "WORK_LOCATION" },
  { name: "businessUnit", label: "Business unit", type: "select", lookupCategory: "BUSINESS_UNIT" },
  { name: "designation", label: "Designation", type: "select", lookupCategory: "DESIGNATION" },
  { name: "division", label: "Division", type: "select", lookupCategory: "DIVISION" },
  { name: "function", label: "Function", type: "select", lookupCategory: "FUNCTION" },
  { name: "functionType", label: "Function type", type: "select", lookupCategory: "FUNCTION_TYPE" },
  { name: "vertical", label: "Vertical", type: "select", lookupCategory: "VERTICAL" },
  { name: "jobLocation", label: "Job location", type: "select", lookupCategory: "JOB_LOCATION" },
  { name: "department", label: "Department", type: "select", lookupCategory: "DEPARTMENT" },
  { name: "systemAuthority", label: "System authority", type: "select", lookupCategory: "SYSTEM_AUTHORITY" },
];

export const EMPLOYMENT_FIELDS: FieldConfig[] = [
  {
    name: "contractType",
    label: "Contract type",
    type: "select",
    options: [
      { value: "PERMANENT", label: "Permanent" },
      { value: "FIXED_TERM", label: "Fixed term" },
      { value: "PROBATION", label: "Probation" },
      { value: "CONTRACTOR", label: "Contractor" },
    ],
  },
  { name: "contractRenewalDate", label: "Contract renewal date", type: "date" },
  {
    name: "status",
    label: "Status",
    type: "select",
    options: [
      { value: "ACTIVE", label: "Active" },
      { value: "RESIGNED", label: "Resigned" },
    ],
  },
  { name: "sourceOfHiring", label: "Source of hiring", type: "select", lookupCategory: "SOURCE_OF_HIRING" },
  { name: "dateOfJoining", label: "Date of joining", type: "date" },
  { name: "dateOfExit", label: "Date of exit", type: "date" },
];

export const PERSONAL_FIELDS: FieldConfig[] = [
  { name: "dateOfBirth", label: "Date of birth", type: "date" },
  {
    name: "gender",
    label: "Gender",
    type: "select",
    options: [
      { value: "MALE", label: "Male" },
      { value: "FEMALE", label: "Female" },
    ],
  },
  {
    name: "maritalStatus",
    label: "Marital status",
    type: "select",
    options: [
      { value: "SINGLE", label: "Single" },
      { value: "MARRIED", label: "Married" },
      { value: "DIVORCED", label: "Divorced" },
      { value: "WIDOWED", label: "Widowed" },
    ],
  },
  { name: "workPhone", label: "Work phone", type: "text" },
  { name: "personalPhone", label: "Personal phone", type: "text" },
  { name: "alternativePhone", label: "Alternative phone", type: "text" },
  { name: "presentAddress", label: "Present address", type: "text" },
  { name: "idAddress", label: "ID address", type: "text" },
  { name: "socialInsuranceNumber", label: "Social insurance number", type: "text" },
  { name: "socialInsuranceStatus", label: "Social insurance status", type: "text" },
  { name: "medicalInsurancePlan", label: "Medical insurance plan", type: "text" },
  {
    name: "medicalInsuranceExpiryDate",
    label: "Medical insurance expiry date",
    type: "date",
  },
  { name: "bankAccountName", label: "Bank account name", type: "text" },
  { name: "bankAccountNumber", label: "Bank account number", type: "text" },
  { name: "idNumber", label: "ID number", type: "text" },
  { name: "idExpiryDate", label: "ID expiry date", type: "date" },
];

export const CAREER_FIELDS: FieldConfig[] = [
  { name: "jobLevel", label: "Job level", type: "text" },
  { name: "personalLevel", label: "Personal level", type: "text" },
  { name: "lastPromotionDate", label: "Last promotion date", type: "date" },
  { name: "previousTitleAtPromotion", label: "Previous title (promotion)", type: "text" },
  { name: "lastTransferDate", label: "Last transfer date", type: "date" },
  { name: "previousTitleAtTransfer", label: "Previous title (transfer)", type: "text" },
  { name: "probationScore", label: "Probation score", type: "number" },
  {
    name: "talentStatus",
    label: "Talent status",
    type: "select",
    options: [
      { value: "NOT_ASSESSED", label: "Not assessed" },
      { value: "CORE", label: "Core" },
      { value: "HIGH_POTENTIAL", label: "High potential" },
      { value: "TOP_TALENT", label: "Top talent" },
      { value: "AT_RISK", label: "At risk" },
    ],
  },
  { name: "lastTalentEvaluationDate", label: "Last talent evaluation date", type: "date" },
];

export const EMPLOYEE_FIELD_GROUPS: { title: string; fields: FieldConfig[] }[] = [
  { title: "Identity", fields: IDENTITY_FIELDS },
  { title: "Org placement", fields: ORG_FIELDS },
  { title: "Employment", fields: EMPLOYMENT_FIELDS },
  { title: "Personal", fields: PERSONAL_FIELDS },
  { title: "Career", fields: CAREER_FIELDS },
];

export const ALL_EMPLOYEE_FIELDS: FieldConfig[] = EMPLOYEE_FIELD_GROUPS.flatMap(
  (g) => g.fields
);
