import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/authz";

const schema = z.object({
  employeeId: z.string().min(1),
  year: z.number().int().min(2026),
  month: z.number().int().min(1).max(12),
  type: z.enum(["VARIABLE_ADDITION", "DEDUCTION"]),
  label: z.string().trim().min(1),
  amount: z.number().positive(),
  notes: z.string().trim().optional(),
});

export async function POST(req: NextRequest) {
  const { error } = await requireRole("HR_ADMIN");
  if (error) return error;

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const item = await prisma.payrollMonthLineItem.create({ data: parsed.data });
  return NextResponse.json(item, { status: 201 });
}
