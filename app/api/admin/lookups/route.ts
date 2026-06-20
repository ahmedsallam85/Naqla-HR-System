import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/authz";
import { lookupValueSchema } from "@/lib/validations/lookup";
import { isLookupCategory } from "@/lib/lookup-categories";

export async function GET(req: NextRequest) {
  const { error } = await requireRole();
  if (error) return error;

  const category = req.nextUrl.searchParams.get("category");
  if (category && !isLookupCategory(category)) {
    return NextResponse.json({ error: "Unknown category" }, { status: 400 });
  }

  const values = await prisma.lookupValue.findMany({
    where: category ? { category } : undefined,
    orderBy: [{ category: "asc" }, { sortOrder: "asc" }, { value: "asc" }],
  });

  return NextResponse.json(values);
}

export async function POST(req: NextRequest) {
  const { error } = await requireRole("HR_ADMIN");
  if (error) return error;

  const body = await req.json();
  const parsed = lookupValueSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const existing = await prisma.lookupValue.findUnique({
    where: { category_value: parsed.data },
  });
  if (existing) {
    return NextResponse.json(
      { error: "This value already exists in the list" },
      { status: 409 }
    );
  }

  const created = await prisma.lookupValue.create({ data: parsed.data });
  return NextResponse.json(created, { status: 201 });
}
