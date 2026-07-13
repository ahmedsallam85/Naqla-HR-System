import { z } from "zod";

// `amount` semantics by calcMethod:
//   STANDARD  → gross salary
//   REVERSE   → agreed net basic salary
//   NET_BASED → agreed net salary (all-in take-home, before extras)
// See lib/payroll-tax.ts for the calculation logic.
export const compensationRecordInputSchema = z.object({
  calcMethod: z.enum(["STANDARD", "REVERSE", "NET_BASED"]),
  amount: z.number().positive("Must be greater than 0"),
  agreedNetAllowances: z.number().min(0).default(0),
  compaRatio: z.number().optional(),
  lastCommissionReceivedAmount: z.number().min(0).optional(),
  notes: z.string().trim().optional(),
});

export const compensationExtraSchema = z.object({
  type: z.string().trim().min(1, "Type is required"),
  amount: z.number().positive("Must be greater than 0"),
  frequency: z.enum(["MONTHLY", "QUARTERLY", "SEMI_ANNUAL", "ONE_TIME"]),
  date: z.coerce.date(),
  endDate: z.coerce.date().optional(),
  notes: z.string().trim().optional(),
});

export const compensationDeductionSchema = z.object({
  type: z.string().trim().min(1, "Type is required"),
  totalAmount: z.number().positive().optional(),
  numInstallments: z.number().int().positive().optional(),
  monthlyAmount: z.number().positive("Must be greater than 0"),
  frequency: z.enum(["MONTHLY", "QUARTERLY", "SEMI_ANNUAL", "ONE_TIME"]).default("MONTHLY"),
  startDate: z.coerce.date(),
  endDate: z.coerce.date().optional(),
  notes: z.string().trim().optional(),
});

export const compensationDeductionStatusSchema = z.object({
  status: z.enum(["ACTIVE", "COMPLETED", "CANCELLED"]),
});

export const compensationAdditionSchema = z.object({
  type: z.enum(["SIGN_ON_BONUS", "PERFORMANCE_BONUS", "SALARY_ADVANCE"]),
  amount: z.number().positive("Must be greater than 0"),
  date: z.coerce.date(),
  notes: z.string().trim().optional(),
});

export const bankTransferExportSchema = z.object({
  month: z.number().int().min(1).max(12),
  year: z.number().int().min(2000).max(2100),
});
