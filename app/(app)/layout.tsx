import { auth } from "@/auth";
import { AppSidebar } from "@/components/app-sidebar";
import { SignOutButton } from "@/components/sign-out-button";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  return (
    <div className="flex min-h-screen">
      <AppSidebar isAdmin={session?.user?.role === "HR_ADMIN"} />
      <div className="flex flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-border px-6 py-3">
          <div />
          <div className="flex items-center gap-3 text-sm">
            <span className="text-muted-foreground">{session?.user?.email}</span>
            <span className="rounded bg-secondary px-2 py-0.5 text-xs text-secondary-foreground">
              {session?.user?.role}
            </span>
            <SignOutButton />
          </div>
        </header>
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
