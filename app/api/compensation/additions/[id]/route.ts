import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/authz";

type Params = { params: Promise<{ id: string }> };

export async function DELETE(_req: NextRequest, { params }: Params) {
  const { error } = await requireRole("HR_ADMIN");
  if (error) return error;

  const { id } = await params;
  await prisma.compensationAddition.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
