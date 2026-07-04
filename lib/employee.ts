import { prisma } from "@/lib/prisma";

export async function nextEmployeeCode() {
  const last = await prisma.employee.findFirst({
    orderBy: { createdAt: "desc" },
    select: { employeeCode: true },
  });

  const lastNumber = last ? parseInt(last.employeeCode.replace("NQ-", ""), 10) : 0;
  const next = (Number.isNaN(lastNumber) ? 0 : lastNumber) + 1;
  return `NQ-${String(next).padStart(5, "0")}`;
}

export function calculateAge(dateOfBirth: Date | string | null | undefined) {
  if (!dateOfBirth) return null;
  const dob = new Date(dateOfBirth);
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const monthDiff = today.getMonth() - dob.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
    age--;
  }
  return age;
}

const DATE_FIELDS = [
  "dateOfBirth",
  "dateOfJoining",
  "dateOfExit",
  "contractRenewalDate",
  "probationEndDate",
  "medicalInsuranceExpiryDate",
  "idExpiryDate",
  "lastPromotionTransferDate",
  "lastPromotionDate",
  "lastTransferDate",
  "lastTalentEvaluationDate",
] as const;

export function toPrismaEmployeeData<T extends Record<string, unknown>>(
  data: T
): T {
  const result: Record<string, unknown> = { ...data };
  for (const key of DATE_FIELDS) {
    if (key in result) {
      result[key] = result[key] ? new Date(result[key] as string) : undefined;
    }
  }
  return result as T;
}

export function isContractExpiringSoon(
  contractRenewalDate: Date | string | null | undefined
) {
  if (!contractRenewalDate) return false;
  const renewal = new Date(contractRenewalDate);
  const threeMonthsFromNow = new Date();
  threeMonthsFromNow.setMonth(threeMonthsFromNow.getMonth() + 3);
  return renewal <= threeMonthsFromNow && renewal >= new Date();
}
