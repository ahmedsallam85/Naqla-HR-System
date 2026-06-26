import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/authz";
import { compensationRecordInputSchema } from "@/lib/validations/compensation";
import {
  calculateStandard,
  calculateReverse,
  DEFAULT_TAX_CONFIG,
  DEFAULT_TAX_BRACKETS,
} from "@/lib/payroll-tax";

type Params = { params: Promise<{ employeeId: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  const { error } = await requireRole("HR_ADMIN");
  if (error) return error;

  const { employeeId } = await params;
  const records = await prisma.compensationRecord.findMany({
    where: { employeeId },
    include: { enteredBy: { select: { email: true } } },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(records);
}

export async function POST(req: NextRequest, { params }: Params) {
  const { error, session } = await requireRole("HR_ADMIN");
  if (error) return error;

  const { employeeId } = await params;
  const employee = await prisma.employee.findUnique({ where: { id: employeeId } });
  if (!employee) {
    return NextResponse.json({ error: "Employee not found" }, { status: 404 });
  }

  const body = await req.json();
  const parsed = compensationRecordInputSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const input = parsed.data;

  const result =
    input.calcMethod === "REVERSE"
      ? calculateReverse(input.amount, DEFAULT_TAX_CONFIG, DEFAULT_TAX_BRACKETS, input.agreedNetAllowances)
      : calculateStandard(input.amount, DEFAULT_TAX_CONFIG, DEFAULT_TAX_BRACKETS, input.agreedNetAllowances);

  const record = await prisma.compensationRecord.create({
    data: {
      employeeId,
      jobLevel: employee.jobLevel,
      compaRatio: input.compaRatio,
      calcMethod: input.calcMethod,
      agreedNetBasicSalary: result.officialNet,
      agreedNetAllowances: input.agreedNetAllowances,
      totalAgreedNetSalary: result.takeHome,
      socialInsuredSalary: result.insured,
      socialInsuranceEmployeeShare: result.empSi,
      socialInsuranceCompanyShare: result.companySi,
      grossSalary: result.gross,
      salaryTaxAnnual: result.annualTax,
      salaryTaxMonthly: result.monthlyTax,
      martyrFundDeduction: result.martyr,
      lastCommissionReceivedAmount: input.lastCommissionReceivedAmount,
      notes: input.notes,
      enteredById: session?.user?.id,
    },
  });

  return NextResponse.json(record, { status: 201 });
}
