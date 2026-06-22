import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/authz";
import { designationSchema } from "@/lib/validations/critical-assessment";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  const { error } = await requireRole();
  if (error) return error;

  const { id } = await params;
  const designation = await prisma.designation.findUnique({
    where: { id },
    include: {
      holder: { select: { fullName: true, employeeCode: true } },
      assessments: {
        orderBy: { createdAt: "desc" },
        include: { assessor: { select: { email: true } } },
      },
      successProfiles: { orderBy: { updatedAt: "desc" }, take: 1 },
    },
  });
  if (!designation) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json(designation);
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const { error } = await requireRole("HR_ADMIN");
  if (error) return error;

  const { id } = await params;
  const body = await req.json();
  const parsed = designationSchema.partial().safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const designation = await prisma.designation.update({
    where: { id },
    data: {
      title: parsed.data.title,
      grade: parsed.data.grade,
      holderName: parsed.data.holderName,
      holderId: parsed.data.holderId || undefined,
    },
  });
  return NextResponse.json(designation);
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const { error } = await requireRole("HR_ADMIN");
  if (error) return error;

  const { id } = await params;
  await prisma.designation.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
