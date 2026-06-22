import { z } from "zod";

export const designationSchema = z.object({
  title: z.string().trim().min(1, "Title is required"),
  grade: z.string().trim().optional(),
  holderName: z.string().trim().optional(),
  holderId: z.string().trim().optional(),
});

export const assessmentInputSchema = z.object({
  scores: z.array(z.number().int().min(0).max(5)).length(13, "All 13 questions must be answered"),
});

export const successProfileSchema = z.object({
  position: z.string().trim().optional(),
  incumbent: z.string().trim().optional(),
  year: z.string().trim().optional(),
  location: z.string().trim().optional(),
  level: z.string().trim().optional(),
  area: z.string().trim().optional(),
  urgency: z.number().int().min(1).max(5).optional(),
  criteria: z.record(z.string(), z.string()).optional(),
  leadership: z.record(z.string(), z.string()).optional(),
});
