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

  contractType: z
    .enum(["PERMANENT", "FIXED_TERM", "PROBATION", "CONTRACTOR"])
    .optional(),
  contractRenewalDate: optionalDate,
  status: z.enum(["ACTIVE", "RESIGNED"]).default("ACTIVE"),
  sourceOfHiring: optionalString,
  dateOfJoining: optionalDate,
  dateOfExit: optionalDate,
  reportingManagerId: optionalString,

  dateOfBirth: optionalDate,
  gender: z.enum(["MALE", "FEMALE"]).optional(),
  maritalStatus: z
    .enum(["SINGLE", "MARRIED", "DIVORCED", "WIDOWED"])
    .optional(),
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
  talentStatus: z
    .enum(["NOT_ASSESSED", "CORE", "HIGH_POTENTIAL", "TOP_TALENT", "AT_RISK"])
    .optional(),
  lastTalentEvaluationDate: optionalDate,
});

export type EmployeeInput = z.input<typeof employeeSchema>;
