import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { CompensationRecordForm } from "@/components/compensation-record-form";

export default async function CompensationEditPage({
  params,
}: {
  params: Promise<{ employeeId: string }>;
}) {
  const session = await auth();
  if (session?.user?.role !== "HR_ADMIN") {
    redirect("/");
  }

  const { employeeId } = await params;
  const employee = await prisma.employee.findUnique({ where: { id: employeeId } });
  if (!employee) notFound();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">New compensation version</h1>
        <p className="text-muted-foreground">
          {employee.fullName} ({employee.employeeCode})
        </p>
      </div>
      <CompensationRecordForm employeeId={employee.id} />
    </div>
  );
}
