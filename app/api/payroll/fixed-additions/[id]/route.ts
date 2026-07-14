import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/authz";

type Params = { params: Promise<{ id: string }> };

const patchSchema = z.object({
  label: z.string().trim().min(1).optional(),
  amount: z.number().positive().optional(),
  isActive: z.boolean().optional(),
});

export async function PATCH(req: NextRequest, { params }: Params) {
  const { error } = await requireRole("HR_ADMIN");
  if (error) return error;

  const { id } = await params;
  const body = await req.json();
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const updated = await prisma.employeeFixedAddition.update({
    where: { id },
    data: parsed.data,
  });
  return NextResponse.json(updated);
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const { error } = await requireRole("HR_ADMIN");
  if (error) return error;

  const { id } = await params;
  await prisma.employeeFixedAddition.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
