import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/authz";
import { designationSchema } from "@/lib/validations/critical-assessment";

export async function GET(req: NextRequest) {
  const { error } = await requireRole();
  if (error) return error;

  const q = req.nextUrl.searchParams.get("q")?.trim();

  const designations = await prisma.designation.findMany({
    where: q
      ? {
          OR: [
            { title: { contains: q } },
            { grade: { contains: q } },
            { holderName: { contains: q } },
          ],
        }
      : undefined,
    include: {
      holder: { select: { fullName: true } },
      assessments: { orderBy: { createdAt: "desc" }, take: 1 },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(designations);
}

export async function POST(req: NextRequest) {
  const { error } = await requireRole("HR_ADMIN");
  if (error) return error;

  const body = await req.json();
  const parsed = designationSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const designation = await prisma.designation.create({
    data: {
      title: parsed.data.title,
      grade: parsed.data.grade,
      holderName: parsed.data.holderName,
      holderId: parsed.data.holderId || undefined,
    },
  });
  return NextResponse.json(designation, { status: 201 });
}
