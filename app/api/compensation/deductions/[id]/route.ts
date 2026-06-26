import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/authz";
import { compensationDeductionStatusSchema } from "@/lib/validations/compensation";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(req: NextRequest, { params }: Params) {
  const { error } = await requireRole("HR_ADMIN");
  if (error) return error;

  const { id } = await params;
  const body = await req.json();
  const parsed = compensationDeductionStatusSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const deduction = await prisma.compensationDeduction.update({
    where: { id },
    data: { status: parsed.data.status },
  });
  return NextResponse.json(deduction);
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const { error } = await requireRole("HR_ADMIN");
  if (error) return error;

  const { id } = await params;
  await prisma.compensationDeduction.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
