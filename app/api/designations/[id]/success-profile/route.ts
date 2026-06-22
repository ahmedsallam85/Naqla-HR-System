import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/authz";
import { successProfileSchema } from "@/lib/validations/critical-assessment";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  const { error } = await requireRole();
  if (error) return error;

  const { id: designationId } = await params;
  const profile = await prisma.successProfile.findFirst({
    where: { designationId },
    orderBy: { updatedAt: "desc" },
  });
  return NextResponse.json(profile);
}

export async function PUT(req: NextRequest, { params }: Params) {
  const { error } = await requireRole("HR_ADMIN");
  if (error) return error;

  const { id: designationId } = await params;
  const designation = await prisma.designation.findUnique({ where: { id: designationId } });
  if (!designation) {
    return NextResponse.json({ error: "Designation not found" }, { status: 404 });
  }

  const body = await req.json();
  const parsed = successProfileSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const existing = await prisma.successProfile.findFirst({
    where: { designationId },
    orderBy: { updatedAt: "desc" },
  });

  const profile = existing
    ? await prisma.successProfile.update({
        where: { id: existing.id },
        data: parsed.data,
      })
    : await prisma.successProfile.create({
        data: { ...parsed.data, designationId },
      });

  return NextResponse.json(profile);
}
