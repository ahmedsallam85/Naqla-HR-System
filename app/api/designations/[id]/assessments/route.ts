import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/authz";
import { assessmentInputSchema } from "@/lib/validations/critical-assessment";
import { computeSectionScores, computeTotal, computePriority } from "@/lib/critical-assessment";

type Params = { params: Promise<{ id: string }> };

export async function POST(req: NextRequest, { params }: Params) {
  const { error, session } = await requireRole("HR_ADMIN");
  if (error) return error;

  const { id: designationId } = await params;
  const designation = await prisma.designation.findUnique({ where: { id: designationId } });
  if (!designation) {
    return NextResponse.json({ error: "Designation not found" }, { status: 404 });
  }

  const body = await req.json();
  const parsed = assessmentInputSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { scores } = parsed.data;
  const sectionScores = computeSectionScores(scores);
  const total = computeTotal(scores);
  const priority = computePriority(total);

  const assessment = await prisma.criticalAssessment.create({
    data: {
      designationId,
      scores,
      sectionScores,
      total,
      priority,
      assessorId: session?.user?.id,
    },
  });

  return NextResponse.json(assessment, { status: 201 });
}
