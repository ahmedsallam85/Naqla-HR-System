import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { EmployeeForm } from "@/components/employee-form";

export default async function EditEmployeePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  if (session?.user?.role !== "HR_ADMIN") {
    redirect(`/personnel/${id}`);
  }

  const employee = await prisma.employee.findUnique({ where: { id } });
  if (!employee) notFound();

  const managers = await prisma.employee.findMany({
    where: { id: { not: id } },
    select: { id: true, fullName: true, employeeCode: true },
    orderBy: { fullName: "asc" },
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Edit {employee.fullName}</h1>
      <EmployeeForm mode="edit" employee={employee} managers={managers} />
    </div>
  );
}
