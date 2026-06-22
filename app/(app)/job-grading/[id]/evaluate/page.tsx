import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { JobEvaluationForm } from "@/components/job-evaluation-form";

export default async function EvaluateJobRolePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  if (session?.user?.role !== "HR_ADMIN") {
    redirect(`/job-grading/${id}`);
  }

  const jobRole = await prisma.jobRole.findUnique({ where: { id } });
  if (!jobRole) notFound();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Evaluate: {jobRole.title}</h1>
      <JobEvaluationForm jobRoleId={jobRole.id} />
    </div>
  );
}
