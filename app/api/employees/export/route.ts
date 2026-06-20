import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/authz";
import { buildEmployeeWorkbook } from "@/lib/excel-template";

export async function GET(req: NextRequest) {
  const { error } = await requireRole();
  if (error) return error;

  const isBlank = req.nextUrl.searchParams.get("blank") === "1";

  const employees = isBlank
    ? []
    : await prisma.employee.findMany({
        include: { reportingManager: { select: { employeeCode: true } } },
        orderBy: { employeeCode: "asc" },
      });

  const workbook = await buildEmployeeWorkbook(employees);
  const buffer = await workbook.xlsx.writeBuffer();

  const filename = isBlank ? "naqla-employee-template.xlsx" : "naqla-employees-export.xlsx";

  return new NextResponse(buffer as ArrayBuffer, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
