import { redirect } from "next/navigation";
import { auth } from "@/auth";

export default async function IncentivesPage() {
  const session = await auth();
  if (session?.user?.role !== "HR_ADMIN") {
    redirect("/");
  }

  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <p className="text-4xl mb-4">🏗️</p>
      <h1 className="text-2xl font-bold mb-2">Incentives</h1>
      <p className="text-muted-foreground">This module is coming soon.</p>
    </div>
  );
}
