import { z } from "zod";
import { LOOKUP_CATEGORY_KEYS } from "@/lib/lookup-categories";

export const lookupValueSchema = z.object({
  category: z.enum(LOOKUP_CATEGORY_KEYS as [string, ...string[]]),
  value: z.string().trim().min(1, "Value is required"),
});

export const lookupValueUpdateSchema = z.object({
  value: z.string().trim().min(1).optional(),
  isActive: z.boolean().optional(),
  sortOrder: z.number().int().optional(),
});
