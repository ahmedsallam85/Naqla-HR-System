import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/authz";
import { buildDesignationWorkbook } from "@/lib/critical-assessment-excel";

export async function GET() {
  const { error } = await requireRole();
  if (error) return error;

  const designations = await prisma.designation.findMany({
    include: {
      holder: { select: { fullName: true } },
      assessments: { orderBy: { createdAt: "desc" }, take: 1 },
    },
    orderBy: { title: "asc" },
  });

  const workbook = await buildDesignationWorkbook(designations);
  const buffer = await workbook.xlsx.writeBuffer();

  return new NextResponse(buffer as ArrayBuffer, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="naqla-designations-export.xlsx"`,
    },
  });
}
