import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/authz";
import { employeeSchema } from "@/lib/validations/employee";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  const { error } = await requireRole();
  if (error) return error;

  const { id } = await params;
  const employee = await prisma.employee.findUnique({
    where: { id },
    include: { reportingManager: true },
  });
  if (!employee) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json(employee);
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const { error } = await requireRole("HR_ADMIN");
  if (error) return error;

  const { id } = await params;
  const body = await req.json();
  const parsed = employeeSchema.partial().safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const data = parsed.data;
  const fullName =
    data.fullName ||
    (data.firstName && data.lastName ? `${data.firstName} ${data.lastName}` : undefined);

  const employee = await prisma.employee.update({
    where: { id },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data: {
      ...data,
      fullName,
      dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : undefined,
      dateOfJoining: data.dateOfJoining ? new Date(data.dateOfJoining) : undefined,
      dateOfExit: data.dateOfExit ? new Date(data.dateOfExit) : undefined,
      contractRenewalDate: data.contractRenewalDate
        ? new Date(data.contractRenewalDate)
        : undefined,
      probationEndDate: data.probationEndDate ? new Date(data.probationEndDate) : undefined,
      medicalInsuranceExpiryDate: data.medicalInsuranceExpiryDate
        ? new Date(data.medicalInsuranceExpiryDate)
        : undefined,
      idExpiryDate: data.idExpiryDate ? new Date(data.idExpiryDate) : undefined,
      lastPromotionTransferDate: data.lastPromotionTransferDate
        ? new Date(data.lastPromotionTransferDate)
        : undefined,
      lastPromotionDate: data.lastPromotionDate
        ? new Date(data.lastPromotionDate)
        : undefined,
      lastTransferDate: data.lastTransferDate
        ? new Date(data.lastTransferDate)
        : undefined,
      lastTalentEvaluationDate: data.lastTalentEvaluationDate
        ? new Date(data.lastTalentEvaluationDate)
        : undefined,
      reportingManagerId: data.reportingManagerId || undefined,
    } as any, // eslint-disable-line @typescript-eslint/no-explicit-any
  });

  return NextResponse.json(employee);
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const { error } = await requireRole("HR_ADMIN");
  if (error) return error;

  const { id } = await params;
  await prisma.employee.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
