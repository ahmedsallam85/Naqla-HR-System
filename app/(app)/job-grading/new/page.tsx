import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { JobRoleForm } from "@/components/job-role-form";

export default async function NewJobRolePage() {
  const session = await auth();
  if (session?.user?.role !== "HR_ADMIN") {
    redirect("/job-grading");
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Add job role</h1>
      <JobRoleForm />
    </div>
  );
}
