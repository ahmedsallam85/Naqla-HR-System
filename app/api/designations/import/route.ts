import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/authz";
import { parseDesignationWorkbook } from "@/lib/critical-assessment-excel";

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
  const rows = await parseDesignationWorkbook(buffer);

  const messages: Message[] = [];
  let created = 0;

  for (const row of rows) {
    if (!row.title) {
      messages.push({ row: row.rowNumber, level: "error", message: "Title is required" });
      continue;
    }
    try {
      await prisma.designation.create({
        data: {
          title: row.title,
          grade: row.grade || undefined,
          holderName: row.holderName || undefined,
        },
      });
      created++;
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
    skipped: messages.filter((m) => m.level === "error").length,
    messages,
  });
}
