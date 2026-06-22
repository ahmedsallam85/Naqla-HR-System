import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { DesignationForm } from "@/components/designation-form";

export default async function NewDesignationPage() {
  const session = await auth();
  if (session?.user?.role !== "HR_ADMIN") {
    redirect("/critical-positions");
  }

  const employees = await prisma.employee.findMany({
    select: { id: true, fullName: true, employeeCode: true },
    orderBy: { fullName: "asc" },
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Add position</h1>
      <DesignationForm employees={employees} />
    </div>
  );
}
