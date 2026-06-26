import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/authz";
import { bankTransferExportSchema } from "@/lib/validations/compensation";
import { buildBankTransferWorkbook, type BankTransferRow } from "@/lib/compensation-export";

export async function POST(req: NextRequest) {
  const { error, session } = await requireRole("HR_ADMIN");
  if (error) return error;

  const body = await req.json();
  const parsed = bankTransferExportSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const { month, year } = parsed.data;

  const periodStart = new Date(year, month - 1, 1);
  const periodEnd = new Date(year, month, 0);

  const employees = await prisma.employee.findMany({
    where: { compensationRecords: { some: {} }, status: "ACTIVE" },
    select: {
      id: true,
      employeeCode: true,
      fullName: true,
      bankAccountName: true,
      bankAccountNumber: true,
      compensationRecords: { orderBy: { createdAt: "desc" }, take: 1 },
      compensationDeductions: {
        where: {
          status: "ACTIVE",
          startDate: { lte: periodEnd },
          OR: [{ endDate: null }, { endDate: { gte: periodStart } }],
        },
      },
      compensationAdditions: {
        where: { date: { gte: periodStart, lte: periodEnd } },
      },
    },
  });

  const rows: BankTransferRow[] = [];
  let totalAmount = 0;

  for (const emp of employees) {
    const record = emp.compensationRecords[0];
    if (!record) continue;

    const deductionsTotal = emp.compensationDeductions.reduce((sum, d) => sum + d.monthlyAmount, 0);
    const additionsTotal = emp.compensationAdditions.reduce((sum, a) => sum + a.amount, 0);
    const netAmount = record.totalAgreedNetSalary - deductionsTotal + additionsTotal;

    rows.push({
      employeeCode: emp.employeeCode,
      fullName: emp.fullName,
      bankAccountName: emp.bankAccountName,
      bankAccountNumber: emp.bankAccountNumber,
      netAmount,
    });
    totalAmount += netAmount;
  }

  await prisma.bankTransferExport.create({
    data: {
      periodMonth: month,
      periodYear: year,
      employeeCount: rows.length,
      totalAmount,
      generatedById: session?.user?.id,
    },
  });

  const workbook = await buildBankTransferWorkbook(rows, month, year);
  const buffer = await workbook.xlsx.writeBuffer();

  return new NextResponse(buffer as ArrayBuffer, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="naqla-bank-transfer-${year}-${String(month).padStart(2, "0")}.xlsx"`,
    },
  });
}
