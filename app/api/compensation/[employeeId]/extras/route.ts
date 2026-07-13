import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/authz";
import { compensationExtraSchema } from "@/lib/validations/compensation";

type Params = { params: Promise<{ employeeId: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  const { error } = await requireRole("HR_ADMIN");
  if (error) return error;

  const { employeeId } = await params;
  const extras = await prisma.compensationExtra.findMany({
    where: { employeeId },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(extras);
}

export async function POST(req: NextRequest, { params }: Params) {
  const { error } = await requireRole("HR_ADMIN");
  if (error) return error;

  const { employeeId } = await params;
  const employee = await prisma.employee.findUnique({ where: { id: employeeId } });
  if (!employee) {
    return NextResponse.json({ error: "Employee not found" }, { status: 404 });
  }

  const body = await req.json();
  const parsed = compensationExtraSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const extra = await prisma.compensationExtra.create({
    data: { employeeId, ...parsed.data },
  });
  return NextResponse.json(extra, { status: 201 });
}
