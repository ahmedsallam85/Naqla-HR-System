import { z } from "zod";

// `amount` means: gross salary when calcMethod is STANDARD, or agreed net
// basic salary when calcMethod is REVERSE -- see lib/payroll-tax.ts.
export const compensationRecordInputSchema = z.object({
  calcMethod: z.enum(["STANDARD", "REVERSE"]),
  amount: z.number().positive("Must be greater than 0"),
  agreedNetAllowances: z.number().min(0).default(0),
  compaRatio: z.number().optional(),
  lastCommissionReceivedAmount: z.number().min(0).optional(),
  notes: z.string().trim().optional(),
});

export const compensationDeductionSchema = z.object({
  type: z.enum([
    "PREMIUM_CARD",
    "MONEY_FELLOWS",
    "STORE_INSTALLMENT",
    "SALARY_ADVANCE_INSTALLMENT",
    "PENALTY",
  ]),
  totalAmount: z.number().positive().optional(),
  numInstallments: z.number().int().positive().optional(),
  monthlyAmount: z.number().positive("Must be greater than 0"),
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
