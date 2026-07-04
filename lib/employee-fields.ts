import type { LookupCategoryKey } from "@/lib/lookup-categories";

export type FieldType = "text" | "email" | "date" | "number" | "select";

export type FieldConfig = {
  name: string;
  label: string;
  type: FieldType;
  required?: boolean;
  disabled?: boolean;
  options?: { value: string; label: string }[];
  lookupCategory?: LookupCategoryKey;
};

const YES_NO_OPTIONS = [
  { value: "true", label: "Yes" },
  { value: "false", label: "No" },
];

// ── Personal Information ────────────────────────────────────────────────────
export const PERSONAL_INFO_FIELDS: FieldConfig[] = [
  { name: "employeeCode", label: "Employee ID", type: "text", disabled: true },
  { name: "fullName", label: "Full Name (as on National ID)", type: "text", required: true },
  { name: "idNumber", label: "National ID", type: "text" },
  { name: "idExpiryDate", label: "National ID Expiry Date", type: "date" },
  { name: "dateOfBirth", label: "Date of Birth", type: "date" },
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
    label: "Marital Status",
    type: "select",
    options: [
      { value: "SINGLE", label: "Single" },
      { value: "MARRIED", label: "Married" },
      { value: "DIVORCED", label: "Divorced" },
      { value: "WIDOWED", label: "Widowed" },
    ],
  },
  { name: "nationality", label: "Nationality", type: "select", lookupCategory: "NATIONALITY" },
  { name: "numberOfDependents", label: "Number of Dependents", type: "number" },
];

// ── Contact Information ─────────────────────────────────────────────────────
export const CONTACT_FIELDS: FieldConfig[] = [
  { name: "personalPhone", label: "Mobile Number", type: "text" },
  { name: "personalEmail", label: "Personal Email", type: "email" },
  { name: "businessEmail", label: "Company Email", type: "email", required: true },
  { name: "presentAddress", label: "Home Address", type: "text" },
  { name: "emergencyContactName", label: "Emergency Contact Name", type: "text" },
  {
    name: "emergencyContactRelationship",
    label: "Emergency Contact Relationship",
    type: "select",
    lookupCategory: "EMERGENCY_CONTACT_RELATIONSHIP",
  },
  { name: "emergencyContactPhone", label: "Emergency Contact Phone", type: "text" },
];

// ── Employment Details ──────────────────────────────────────────────────────
// (reportingManagerId is rendered separately in the form component)
export const EMPLOYMENT_FIELDS: FieldConfig[] = [
  { name: "dateOfJoining", label: "Hire Date", type: "date" },
  {
    name: "status",
    label: "Employment Status",
    type: "select",
    options: [
      { value: "ACTIVE", label: "Active" },
      { value: "RESIGNED", label: "Resigned" },
    ],
  },
  {
    name: "contractType",
    label: "Contract Type",
    type: "select",
    options: [
      { value: "PERMANENT", label: "Permanent" },
      { value: "FIXED_TERM", label: "Fixed Term" },
      { value: "PROBATION", label: "Probation" },
      { value: "CONTRACTOR", label: "Contractor" },
    ],
  },
  { name: "designation", label: "Job Title", type: "select", lookupCategory: "DESIGNATION" },
  { name: "division", label: "Division", type: "select", lookupCategory: "DIVISION" },
  { name: "department", label: "Department", type: "select", lookupCategory: "DEPARTMENT" },
  { name: "vertical", label: "Vertical", type: "select", lookupCategory: "VERTICAL" },
  { name: "functionType", label: "Function Type", type: "select", lookupCategory: "FUNCTION_TYPE" },
  { name: "workLocation", label: "Work Location / Site", type: "select", lookupCategory: "WORK_LOCATION" },
  { name: "probationEndDate", label: "Probation End Date", type: "date" },
  { name: "contractRenewalDate", label: "Contract End Date", type: "date" },
  { name: "sourceOfHiring", label: "Hiring Source", type: "select", lookupCategory: "SOURCE_OF_HIRING" },
];

// ── Organizational Data ─────────────────────────────────────────────────────
export const ORG_DATA_FIELDS: FieldConfig[] = [
  { name: "legalEntity", label: "Legal Entity", type: "select", lookupCategory: "LEGAL_ENTITY" },
  { name: "jobLevel", label: "Grade / Job Level", type: "text" },
  { name: "personalLevel", label: "Personal Level", type: "text" },
  { name: "systemAuthority", label: "System Authority", type: "select", lookupCategory: "SYSTEM_AUTHORITY" },
  { name: "costCenter", label: "Cost Center", type: "select", lookupCategory: "COST_CENTER" },
  { name: "lastPromotionTransferDate", label: "Last Promotion / Transfer Date", type: "date" },
  { name: "previousDesignation", label: "Previous Designation", type: "text" },
];

// ── Compensation & Benefits ─────────────────────────────────────────────────
export const COMP_BENEFITS_FIELDS: FieldConfig[] = [
  { name: "socialInsuranceNumber", label: "Social Insurance No.", type: "text" },
  { name: "socialInsuranceStatus", label: "Social Insurance Status", type: "text" },
  { name: "socialInsuranceSalary", label: "Social Insurance Salary", type: "number" },
  { name: "bankAccountNumber", label: "Bank Account No.", type: "text" },
  { name: "medicalInsurancePlan", label: "Medical Insurance Plan", type: "text" },
  { name: "medicalInsuranceExpiryDate", label: "Medical Insurance Expiry Date", type: "date" },
];

// ── Attendance & Leave ──────────────────────────────────────────────────────
export const ATTENDANCE_FIELDS: FieldConfig[] = [
  { name: "annualLeaveBalance", label: "Annual Leave Balance", type: "number" },
  { name: "sickLeaveTaken", label: "Sick Leave Taken", type: "number" },
  { name: "hajjLeaveUsed", label: "Hajj Leave Used", type: "number" },
];

// ── Legal & Compliance ──────────────────────────────────────────────────────
export const LEGAL_FIELDS: FieldConfig[] = [
  { name: "workPermitStatus", label: "Work Permit Status", type: "select", lookupCategory: "WORK_PERMIT_STATUS" },
  { name: "contractSigned", label: "Contract Signed", type: "select", options: YES_NO_OPTIONS },
  { name: "laborLawCategory", label: "Labor Law Category", type: "select", lookupCategory: "LABOR_LAW_CATEGORY" },
];

// ── Exit Data ───────────────────────────────────────────────────────────────
export const EXIT_FIELDS: FieldConfig[] = [
  { name: "dateOfExit", label: "Resignation / Termination Date", type: "date" },
  { name: "reasonForLeaving", label: "Reason for Leaving", type: "text" },
  { name: "endOfServiceSettlement", label: "End-of-Service Settlement", type: "number" },
  { name: "rehireEligible", label: "Rehire Eligible", type: "select", options: YES_NO_OPTIONS },
];

// ── Flat list for import/export (excludes disabled display-only fields) ─────
export const EMPLOYEE_FIELD_GROUPS: { title: string; fields: FieldConfig[] }[] = [
  { title: "Personal Information", fields: PERSONAL_INFO_FIELDS },
  { title: "Contact Information", fields: CONTACT_FIELDS },
  { title: "Employment Details", fields: EMPLOYMENT_FIELDS },
  { title: "Organizational Data", fields: ORG_DATA_FIELDS },
  { title: "Compensation & Benefits", fields: COMP_BENEFITS_FIELDS },
  { title: "Attendance & Leave", fields: ATTENDANCE_FIELDS },
  { title: "Legal & Compliance", fields: LEGAL_FIELDS },
  { title: "Exit Data", fields: EXIT_FIELDS },
];

export const ALL_EMPLOYEE_FIELDS: FieldConfig[] = EMPLOYEE_FIELD_GROUPS.flatMap(
  (g) => g.fields.filter((f) => !f.disabled)
);

// Legacy exports kept so other modules that import them don't break
export const IDENTITY_FIELDS = PERSONAL_INFO_FIELDS;
export const ORG_FIELDS = ORG_DATA_FIELDS;
export const PERSONAL_FIELDS = COMP_BENEFITS_FIELDS;
export const CAREER_FIELDS = ORG_DATA_FIELDS;
