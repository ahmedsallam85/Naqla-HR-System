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

export const employeeSchema = z.object({
  firstName: z.string().trim().min(1, "First name is required"),
  lastName: z.string().trim().min(1, "Last name is required"),
  photoUrl: optionalString,
  businessEmail: z.string().trim().email("Valid business email is required"),
  personalEmail: z
    .string()
    .trim()
    .email()
    .optional()
    .or(z.literal(""))
    .transform((v) => (v === "" ? undefined : v)),

  workLocation: optionalString,
  businessUnit: optionalString,
  designation: optionalString,
  division: optionalString,
  function: optionalString,
  functionType: optionalString,
  vertical: optionalString,
  jobLocation: optionalString,
  department: optionalString,
  systemAuthority: optionalString,

  contractType: optionalEnum(["PERMANENT", "FIXED_TERM", "PROBATION", "CONTRACTOR"] as const),
  contractRenewalDate: optionalDate,
  status: z.enum(["ACTIVE", "RESIGNED"]).default("ACTIVE"),
  sourceOfHiring: optionalString,
  dateOfJoining: optionalDate,
  dateOfExit: optionalDate,
  reportingManagerId: optionalString,

  dateOfBirth: optionalDate,
  gender: optionalEnum(["MALE", "FEMALE"] as const),
  maritalStatus: optionalEnum(["SINGLE", "MARRIED", "DIVORCED", "WIDOWED"] as const),
  workPhone: optionalString,
  personalPhone: optionalString,
  alternativePhone: optionalString,
  presentAddress: optionalString,
  idAddress: optionalString,
  socialInsuranceNumber: optionalString,
  socialInsuranceStatus: optionalString,
  medicalInsurancePlan: optionalString,
  medicalInsuranceExpiryDate: optionalDate,
  bankAccountName: optionalString,
  bankAccountNumber: optionalString,
  idNumber: optionalString,
  idExpiryDate: optionalDate,

  jobLevel: optionalString,
  personalLevel: optionalString,
  lastPromotionDate: optionalDate,
  previousTitleAtPromotion: optionalString,
  lastTransferDate: optionalDate,
  previousTitleAtTransfer: optionalString,
  probationScore: z
    .union([z.string(), z.number()])
    .optional()
    .transform((v) =>
      v === undefined || v === "" ? undefined : Number(v)
    ),
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
