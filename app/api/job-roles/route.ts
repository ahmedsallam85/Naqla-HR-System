import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/authz";
import { jobRoleSchema } from "@/lib/validations/job-evaluation";

export async function GET(req: NextRequest) {
  const { error } = await requireRole();
  if (error) return error;

  const q = req.nextUrl.searchParams.get("q")?.trim();

  const jobRoles = await prisma.jobRole.findMany({
    where: q
      ? {
          OR: [
            { title: { contains: q } },
            { department: { contains: q } },
            { division: { contains: q } },
          ],
        }
      : undefined,
    include: {
      evaluations: {
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(jobRoles);
}

export async function POST(req: NextRequest) {
  const { error } = await requireRole("HR_ADMIN");
  if (error) return error;

  const body = await req.json();
  const parsed = jobRoleSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const jobRole = await prisma.jobRole.create({ data: parsed.data });
  return NextResponse.json(jobRole, { status: 201 });
}
