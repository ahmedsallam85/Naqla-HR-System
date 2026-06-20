import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getActiveLookups } from "@/lib/get-lookups";
import { EmployeeForm } from "@/components/employee-form";

export default async function NewEmployeePage() {
  const session = await auth();
  if (session?.user?.role !== "HR_ADMIN") {
    redirect("/personnel");
  }

  const [managers, lookups] = await Promise.all([
    prisma.employee.findMany({
      select: { id: true, fullName: true, employeeCode: true },
      orderBy: { fullName: "asc" },
    }),
    getActiveLookups(),
  ]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Add employee</h1>
      <EmployeeForm mode="create" managers={managers} lookups={lookups} />
    </div>
  );
}
