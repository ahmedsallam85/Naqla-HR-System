import { z } from "zod";

export const jobRoleSchema = z.object({
  title: z.string().trim().min(1, "Title is required"),
  department: z.string().trim().optional(),
  division: z.string().trim().optional(),
  responsibilities: z.string().trim().optional(),
});

export const jobEvaluationInputSchema = z.object({
  khTech: z.string().min(1, "Technical Know-How is required"),
  khFt: z.string(),
  khMgmt: z.string().min(1, "Management Know-How is required"),
  khMgmtFt: z.string(),
  khHr: z.string().min(1, "Human Relations Know-How is required"),
  psTe: z.string().min(1, "Thinking Environment is required"),
  psTc: z.string().min(1, "Thinking Challenge is required"),
  psFt: z.string(),
  accFta: z.string().min(1, "Freedom to Act is required"),
  accMag: z.string().min(1, "Magnitude is required"),
  accType: z.string().min(1, "Accountability Type is required"),
  accFt: z.string(),
  notes: z.string().trim().optional(),
});
