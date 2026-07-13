import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/authz";
import { compensationRecordInputSchema } from "@/lib/validations/compensation";
import {
  calculateStandard,
  calculateReverse,
  calculateNetBased,
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

  let recordData: Parameters<typeof prisma.compensationRecord.create>[0]["data"];

  if (input.calcMethod === "NET_BASED") {
    // agreedNetAllowances carries the total recurring extras sum passed from the form
    const r = calculateNetBased(
      input.amount,
      DEFAULT_TAX_CONFIG,
      DEFAULT_TAX_BRACKETS,
      input.agreedNetAllowances,
    );
    recordData = {
      employeeId,
      jobLevel: employee.jobLevel,
      compaRatio: input.compaRatio,
      calcMethod: "NET_BASED",
      agreedNetBasicSalary: input.amount,
      agreedNetAllowances: input.agreedNetAllowances,
      totalAgreedNetSalary: input.amount + input.agreedNetAllowances,
      socialInsuredSalary: r.insured,
      socialInsuranceEmployeeShare: r.empSi,
      socialInsuranceCompanyShare: r.companySi,
      grossSalary: r.base,
      salaryTaxAnnual: r.annualTax,
      salaryTaxMonthly: r.monthlyTax,
      martyrFundDeduction: r.martyr,
      totalCostMonthly: r.totalCostMonthly,
      lastCommissionReceivedAmount: input.lastCommissionReceivedAmount,
      notes: input.notes,
      enteredById: session?.user?.id,
    };
  } else {
    const r =
      input.calcMethod === "REVERSE"
        ? calculateReverse(input.amount, DEFAULT_TAX_CONFIG, DEFAULT_TAX_BRACKETS, input.agreedNetAllowances)
        : calculateStandard(input.amount, DEFAULT_TAX_CONFIG, DEFAULT_TAX_BRACKETS, input.agreedNetAllowances);
    recordData = {
      employeeId,
      jobLevel: employee.jobLevel,
      compaRatio: input.compaRatio,
      calcMethod: input.calcMethod,
      agreedNetBasicSalary: r.officialNet,
      agreedNetAllowances: input.agreedNetAllowances,
      totalAgreedNetSalary: r.takeHome,
      socialInsuredSalary: r.insured,
      socialInsuranceEmployeeShare: r.empSi,
      socialInsuranceCompanyShare: r.companySi,
      grossSalary: r.gross,
      salaryTaxAnnual: r.annualTax,
      salaryTaxMonthly: r.monthlyTax,
      martyrFundDeduction: r.martyr,
      lastCommissionReceivedAmount: input.lastCommissionReceivedAmount,
      notes: input.notes,
      enteredById: session?.user?.id,
    };
  }

  const record = await prisma.compensationRecord.create({ data: recordData });
  return NextResponse.json(record, { status: 201 });
}
