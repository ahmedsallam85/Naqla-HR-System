import { auth } from "@/auth";

export default async function DashboardPage() {
  const session = await auth();

  return (
    <div>
      <h1 className="text-2xl font-bold">Welcome back</h1>
      <p className="mt-1 text-muted-foreground">
        Signed in as {session?.user?.email} ({session?.user?.role})
      </p>
    </div>
  );
}
