import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { EmployeeForm } from "@/components/employee-form";

export default async function NewEmployeePage() {
  const session = await auth();
  if (session?.user?.role !== "HR_ADMIN") {
    redirect("/personnel");
  }

  const managers = await prisma.employee.findMany({
    select: { id: true, fullName: true, employeeCode: true },
    orderBy: { fullName: "asc" },
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Add employee</h1>
      <EmployeeForm mode="create" managers={managers} />
    </div>
  );
}
