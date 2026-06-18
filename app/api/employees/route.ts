import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/authz";
import { employeeSchema } from "@/lib/validations/employee";
import { nextEmployeeCode } from "@/lib/employee";

export async function GET(req: NextRequest) {
  const { error } = await requireRole();
  if (error) return error;

  const q = req.nextUrl.searchParams.get("q")?.trim();

  const employees = await prisma.employee.findMany({
    where: q
      ? {
          OR: [
            { fullName: { contains: q } },
            { employeeCode: { contains: q } },
            { businessEmail: { contains: q } },
            { designation: { contains: q } },
            { department: { contains: q } },
          ],
        }
      : undefined,
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(employees);
}

export async function POST(req: NextRequest) {
  const { error } = await requireRole("HR_ADMIN");
  if (error) return error;

  const body = await req.json();
  const parsed = employeeSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const data = parsed.data;
  const employeeCode = await nextEmployeeCode();
  const fullName = `${data.firstName} ${data.lastName}`;

  const existing = await prisma.employee.findUnique({
    where: { businessEmail: data.businessEmail },
  });
  if (existing) {
    return NextResponse.json(
      { error: "An employee with this business email already exists" },
      { status: 409 }
    );
  }

  const employee = await prisma.employee.create({
    data: {
      ...data,
      employeeCode,
      fullName,
      dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : undefined,
      dateOfJoining: data.dateOfJoining ? new Date(data.dateOfJoining) : undefined,
      dateOfExit: data.dateOfExit ? new Date(data.dateOfExit) : undefined,
      contractRenewalDate: data.contractRenewalDate
        ? new Date(data.contractRenewalDate)
        : undefined,
      medicalInsuranceExpiryDate: data.medicalInsuranceExpiryDate
        ? new Date(data.medicalInsuranceExpiryDate)
        : undefined,
      idExpiryDate: data.idExpiryDate ? new Date(data.idExpiryDate) : undefined,
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
    },
  });

  return NextResponse.json(employee, { status: 201 });
}
