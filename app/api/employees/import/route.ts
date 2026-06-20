import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/authz";
import { parseEmployeeWorkbook } from "@/lib/excel-template";
import { employeeSchema } from "@/lib/validations/employee";
import { nextEmployeeCode, toPrismaEmployeeData } from "@/lib/employee";
import { ALL_EMPLOYEE_FIELDS } from "@/lib/employee-fields";

type Message = { row: number; level: "error" | "warning"; message: string };

export async function POST(req: NextRequest) {
  const { error } = await requireRole("HR_ADMIN");
  if (error) return error;

  const formData = await req.formData();
  const file = formData.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const rows = await parseEmployeeWorkbook(buffer);

  const messages: Message[] = [];
  let created = 0;
  let updated = 0;

  const existing = await prisma.employee.findMany({
    select: { id: true, employeeCode: true, businessEmail: true },
  });
  const codeMap = new Map(existing.map((e) => [e.employeeCode, e]));
  const emailMap = new Map(existing.map((e) => [e.businessEmail.toLowerCase(), e]));

  const lookupCache = new Set<string>();
  async function ensureLookupValue(category: string, value: string) {
    const key = `${category}::${value}`;
    if (lookupCache.has(key)) return;
    lookupCache.add(key);
    await prisma.lookupValue.upsert({
      where: { category_value: { category, value } },
      update: {},
      create: { category, value },
    });
  }

  for (const row of rows) {
    if (row.errors.length > 0) {
      for (const e of row.errors) {
        messages.push({ row: row.rowNumber, level: "error", message: e });
      }
      continue;
    }

    const target = row.employeeCode
      ? codeMap.get(row.employeeCode)
      : emailMap.get((row.data.businessEmail || "").toLowerCase());

    if (row.employeeCode && !target) {
      messages.push({
        row: row.rowNumber,
        level: "error",
        message: `Employee Code "${row.employeeCode}" was not found`,
      });
      continue;
    }

    const schema = target ? employeeSchema.partial() : employeeSchema;
    const parsed = schema.safeParse(row.data);
    if (!parsed.success) {
      const issues = parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`);
      for (const issue of issues) {
        messages.push({ row: row.rowNumber, level: "error", message: issue });
      }
      continue;
    }

    let reportingManagerId: string | null | undefined;
    if (row.managerCode === "") {
      reportingManagerId = null;
    } else if (row.managerCode) {
      const manager = codeMap.get(row.managerCode);
      if (manager) {
        reportingManagerId = manager.id;
      } else {
        messages.push({
          row: row.rowNumber,
          level: "warning",
          message: `Reporting manager code "${row.managerCode}" was not found - left unchanged`,
        });
      }
    }

    try {
      for (const field of ALL_EMPLOYEE_FIELDS) {
        if (!field.lookupCategory) continue;
        const value = (parsed.data as Record<string, unknown>)[field.name];
        if (typeof value === "string" && value) {
          await ensureLookupValue(field.lookupCategory, value);
        }
      }

      const data = toPrismaEmployeeData(parsed.data as Record<string, unknown>);
      if (reportingManagerId !== undefined) {
        data.reportingManagerId = reportingManagerId;
      }

      if (target) {
        const fullName =
          parsed.data.firstName && parsed.data.lastName
            ? `${parsed.data.firstName} ${parsed.data.lastName}`
            : undefined;
        await prisma.employee.update({
          where: { id: target.id },
          data: { ...data, fullName },
        });
        updated++;
      } else {
        const employeeCode = await nextEmployeeCode();
        const fullName = `${parsed.data.firstName} ${parsed.data.lastName}`;
        const createdEmployee = await prisma.employee.create({
          data: { ...data, employeeCode, fullName } as never,
        });
        codeMap.set(employeeCode, {
          id: createdEmployee.id,
          employeeCode,
          businessEmail: createdEmployee.businessEmail,
        });
        created++;
      }
    } catch (e) {
      messages.push({
        row: row.rowNumber,
        level: "error",
        message: e instanceof Error ? e.message : "Unexpected error saving this row",
      });
    }
  }

  return NextResponse.json({
    created,
    updated,
    skipped: messages.filter((m) => m.level === "error").length,
    messages,
  });
}
