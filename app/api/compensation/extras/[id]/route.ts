import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/authz";

type Params = { params: Promise<{ id: string }> };

export async function DELETE(_req: NextRequest, { params }: Params) {
  const { error } = await requireRole("HR_ADMIN");
  if (error) return error;

  const { id } = await params;
  const extra = await prisma.compensationExtra.findUnique({ where: { id } });
  if (!extra) {
    return NextResponse.json({ error: "Extra not found" }, { status: 404 });
  }

  await prisma.compensationExtra.delete({ where: { id } });
  return new NextResponse(null, { status: 204 });
}
