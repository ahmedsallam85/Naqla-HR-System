import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { LookupsManager } from "@/components/lookups-manager";

export default async function AdminLookupsPage() {
  const session = await auth();
  if (session?.user?.role !== "HR_ADMIN") {
    redirect("/");
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dropdown Lists</h1>
        <p className="text-muted-foreground">
          Manage the values HR staff can pick from when filling in employee
          org placement fields.
        </p>
      </div>
      <LookupsManager />
    </div>
  );
}
