import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/authz";
import { jobEvaluationInputSchema } from "@/lib/validations/job-evaluation";
import {
  KH_TECH,
  KH_FT,
  KH_MGMT,
  KH_MGMT_FT,
  KH_HR,
  PS_TE,
  PS_TC,
  PS_FT,
  ACC_FTA,
  ACC_MAG,
  getAccTypeOptions,
  getKhPoints,
  getKhNotation,
  getKhValidity,
  getPsPoints,
  getPsValidity,
  getAccPoints,
  getAccValidity,
  getHayLevel,
} from "@/lib/hay-evaluation";

type Params = { params: Promise<{ id: string }> };

function codeExists(options: { code: string }[], code: string) {
  return options.some((o) => o.code === code);
}

export async function POST(req: NextRequest, { params }: Params) {
  const { error, session } = await requireRole("HR_ADMIN");
  if (error) return error;

  const { id: jobRoleId } = await params;
  const jobRole = await prisma.jobRole.findUnique({ where: { id: jobRoleId } });
  if (!jobRole) {
    return NextResponse.json({ error: "Job role not found" }, { status: 404 });
  }

  const body = await req.json();
  const parsed = jobEvaluationInputSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const input = parsed.data;

  const invalid: string[] = [];
  if (!codeExists(KH_TECH, input.khTech)) invalid.push("khTech");
  if (!codeExists(KH_FT, input.khFt)) invalid.push("khFt");
  if (!codeExists(KH_MGMT, input.khMgmt)) invalid.push("khMgmt");
  if (!codeExists(KH_MGMT_FT, input.khMgmtFt)) invalid.push("khMgmtFt");
  if (!codeExists(KH_HR, input.khHr)) invalid.push("khHr");
  if (!codeExists(PS_TE, input.psTe)) invalid.push("psTe");
  if (!codeExists(PS_TC, input.psTc)) invalid.push("psTc");
  if (!codeExists(PS_FT, input.psFt)) invalid.push("psFt");
  if (!codeExists(ACC_FTA, input.accFta)) invalid.push("accFta");
  if (!codeExists(ACC_MAG, input.accMag)) invalid.push("accMag");
  if (!codeExists(getAccTypeOptions(input.accMag), input.accType)) invalid.push("accType");
  if (invalid.length > 0) {
    return NextResponse.json(
      { error: `Invalid selection for: ${invalid.join(", ")}` },
      { status: 400 }
    );
  }

  const khPoints = getKhPoints(input);
  const psPoints = getPsPoints(khPoints, input.psTe, input.psTc, input.psFt);
  const accPoints = getAccPoints(input.accFta, input.accMag, input.accType);

  if (khPoints == null || psPoints == null || accPoints == null) {
    return NextResponse.json({ error: "Could not compute evaluation from the given inputs" }, { status: 400 });
  }

  const totalPoints = khPoints + psPoints + accPoints;
  const hayLevel = getHayLevel(totalPoints) ?? "Above Hay 27";

  const evaluation = await prisma.jobEvaluation.create({
    data: {
      jobRoleId,
      khTech: input.khTech,
      khFt: input.khFt,
      khMgmt: input.khMgmt,
      khMgmtFt: input.khMgmtFt,
      khHr: input.khHr,
      psTe: input.psTe,
      psTc: input.psTc,
      psFt: input.psFt,
      accFta: input.accFta,
      accMag: input.accMag,
      accType: input.accType,
      khPoints,
      psPoints,
      accPoints,
      totalPoints,
      hayLevel,
      khNotation: getKhNotation(input),
      khValidity: getKhValidity(input.khMgmt, input.khHr),
      psValidity: getPsValidity(input.psTe, input.psTc),
      accValidity: getAccValidity(input.accFta, input.accType),
      notes: input.notes,
      evaluatorId: session?.user?.id,
    },
  });

  return NextResponse.json(evaluation, { status: 201 });
}
