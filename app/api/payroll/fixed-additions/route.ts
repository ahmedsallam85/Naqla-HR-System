import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/authz";

const schema = z.object({
  employeeId: z.string().min(1),
  label: z.string().trim().min(1),
  amount: z.number().positive(),
});

export async function POST(req: NextRequest) {
  const { error } = await requireRole("HR_ADMIN");
  if (error) return error;

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const addition = await prisma.employeeFixedAddition.create({ data: parsed.data });
  return NextResponse.json(addition, { status: 201 });
}
