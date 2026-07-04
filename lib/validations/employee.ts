import { z } from "zod";

const optionalString = z
  .string()
  .trim()
  .optional()
  .transform((v) => (v === "" ? undefined : v));

const optionalDate = z
  .string()
  .trim()
  .optional()
  .transform((v) => (v === "" || v === undefined ? undefined : v));

function optionalEnum<T extends [string, ...string[]]>(values: T) {
  return z
    .enum(values)
    .optional()
    .or(z.literal(""))
    .transform((v): T[number] | undefined => (v === "" ? undefined : v));
}

const optionalFloat = z
  .union([z.string(), z.number()])
  .optional()
  .transform((v) => (v === undefined || v === "" ? undefined : Number(v)));

const optionalInt = z
  .union([z.string(), z.number()])
  .optional()
  .transform((v) =>
    v === undefined || v === "" ? undefined : Math.round(Number(v))
  );

const optionalBool = z
  .union([z.boolean(), z.string(), z.literal("")])
  .optional()
  .transform((v) => {
    if (v === true || v === "true") return true;
    if (v === false || v === "false") return false;
    return undefined;
  });

export const employeeSchema = z.object({
  // Identity — fullName is the primary field; firstName/lastName kept for import backward compat
  fullName: z.string().trim().min(1, "Full Name is required").optional().or(z.literal("")).transform((v) => (v === "" ? undefined : v)),
  firstName: optionalString,
  lastName: optionalString,
  photoUrl: optionalString,

  // Personal Information
  businessEmail: z.string().trim().email("Valid business email is required"),
  idNumber: optionalString,
  idExpiryDate: optionalDate,
  dateOfBirth: optionalDate,
  gender: optionalEnum(["MALE", "FEMALE"] as const),
  maritalStatus: optionalEnum(["SINGLE", "MARRIED", "DIVORCED", "WIDOWED"] as const),
  nationality: optionalString,
  numberOfDependents: optionalInt,

  // Contact Information
  personalPhone: optionalString,
  personalEmail: z
    .string()
    .trim()
    .email()
    .optional()
    .or(z.literal(""))
    .transform((v) => (v === "" ? undefined : v)),
  presentAddress: optionalString,
  emergencyContactName: optionalString,
  emergencyContactRelationship: optionalString,
  emergencyContactPhone: optionalString,

  // Employment Details
  dateOfJoining: optionalDate,
  status: z.enum(["ACTIVE", "RESIGNED"]).default("ACTIVE"),
  contractType: optionalEnum(["PERMANENT", "FIXED_TERM", "PROBATION", "CONTRACTOR"] as const),
  designation: optionalString,
  division: optionalString,
  department: optionalString,
  vertical: optionalString,
  functionType: optionalString,
  workLocation: optionalString,
  probationEndDate: optionalDate,
  contractRenewalDate: optionalDate,
  sourceOfHiring: optionalString,
  reportingManagerId: optionalString,

  // Organizational Data
  legalEntity: optionalString,
  jobLevel: optionalString,
  personalLevel: optionalString,
  systemAuthority: optionalString,
  costCenter: optionalString,
  lastPromotionTransferDate: optionalDate,
  previousDesignation: optionalString,

  // Compensation & Benefits
  socialInsuranceNumber: optionalString,
  socialInsuranceStatus: optionalString,
  socialInsuranceSalary: optionalFloat,
  bankAccountNumber: optionalString,
  medicalInsurancePlan: optionalString,
  medicalInsuranceExpiryDate: optionalDate,

  // Attendance & Leave
  annualLeaveBalance: optionalFloat,
  sickLeaveTaken: optionalFloat,
  hajjLeaveUsed: optionalFloat,

  // Legal & Compliance
  workPermitStatus: optionalString,
  contractSigned: optionalBool,
  laborLawCategory: optionalString,

  // Exit Data
  dateOfExit: optionalDate,
  reasonForLeaving: optionalString,
  endOfServiceSettlement: optionalFloat,
  rehireEligible: optionalBool,

  // Legacy fields (not shown in form, kept for data integrity)
  businessUnit: optionalString,
  function: optionalString,
  jobLocation: optionalString,
  workPhone: optionalString,
  alternativePhone: optionalString,
  idAddress: optionalString,
  bankAccountName: optionalString,
  lastPromotionDate: optionalDate,
  previousTitleAtPromotion: optionalString,
  lastTransferDate: optionalDate,
  previousTitleAtTransfer: optionalString,
  probationScore: optionalFloat,
  talentStatus: optionalEnum([
    "NOT_ASSESSED",
    "CORE",
    "HIGH_POTENTIAL",
    "TOP_TALENT",
    "AT_RISK",
  ] as const),
  lastTalentEvaluationDate: optionalDate,
});

export type EmployeeInput = z.input<typeof employeeSchema>;
