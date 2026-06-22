import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { CriticalAssessmentForm } from "@/components/critical-assessment-form";

export default async function AssessDesignationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  if (session?.user?.role !== "HR_ADMIN") {
    redirect(`/critical-positions/${id}`);
  }

  const designation = await prisma.designation.findUnique({ where: { id } });
  if (!designation) notFound();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Assess: {designation.title}</h1>
      <CriticalAssessmentForm designationId={designation.id} />
    </div>
  );
}
