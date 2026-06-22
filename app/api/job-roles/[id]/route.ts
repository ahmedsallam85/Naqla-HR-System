import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/authz";
import { jobRoleSchema } from "@/lib/validations/job-evaluation";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  const { error } = await requireRole();
  if (error) return error;

  const { id } = await params;
  const jobRole = await prisma.jobRole.findUnique({
    where: { id },
    include: {
      evaluations: {
        orderBy: { createdAt: "desc" },
        include: { evaluator: { select: { email: true } } },
      },
    },
  });
  if (!jobRole) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json(jobRole);
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const { error } = await requireRole("HR_ADMIN");
  if (error) return error;

  const { id } = await params;
  const body = await req.json();
  const parsed = jobRoleSchema.partial().safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const jobRole = await prisma.jobRole.update({ where: { id }, data: parsed.data });
  return NextResponse.json(jobRole);
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const { error } = await requireRole("HR_ADMIN");
  if (error) return error;

  const { id } = await params;
  await prisma.jobRole.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
