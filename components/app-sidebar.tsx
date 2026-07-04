"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { label: "People Directory", href: "/personnel", enabled: true, adminOnly: false },
  { label: "Job Grading", href: "/job-grading", enabled: true, adminOnly: false },
  { label: "Critical Positions", href: "/critical-positions", enabled: true, adminOnly: false },
  { label: "Compensation", href: "/compensation", enabled: true, adminOnly: true },
  { label: "Recruitment", href: "/recruitment", enabled: false, adminOnly: false },
  { label: "Onboarding", href: "/onboarding", enabled: false, adminOnly: false },
  { label: "Performance", href: "/performance", enabled: false, adminOnly: false },
  { label: "Talent", href: "/talent", enabled: false, adminOnly: false },
];

export function AppSidebar({ isAdmin }: { isAdmin: boolean }) {
  const pathname = usePathname();

  return (
    <aside className="flex w-56 shrink-0 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground">
      <div className="px-5 py-6">
        <Link href="/" className="text-xl font-heading font-extrabold">
          naqla<span className="text-primary">.</span>
        </Link>
        <p className="text-[10px] tracking-widest text-muted-foreground mt-1">
          PEOPLE &amp; CULTURE
        </p>
      </div>
      <nav className="flex flex-col gap-1 px-3">
        {NAV_ITEMS.filter((item) => !item.adminOnly || isAdmin).map((item) => {
          const active = pathname.startsWith(item.href);
          if (!item.enabled) {
            return (
              <span
                key={item.href}
                className="flex items-center justify-between rounded-md px-3 py-2 text-sm text-muted-foreground/50 cursor-not-allowed"
              >
                {item.label}
                <span className="text-[10px]">soon</span>
              </span>
            );
          }
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "rounded-md px-3 py-2 text-sm transition-colors hover:bg-sidebar-accent",
                active && "bg-sidebar-accent text-primary font-medium"
              )}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
      {isAdmin && (
        <nav className="mt-auto flex flex-col gap-1 border-t border-sidebar-border px-3 py-3">
          <span className="px-3 text-[10px] tracking-widest text-muted-foreground">
            ADMIN
          </span>
          <Link
            href="/admin/lookups"
            className={cn(
              "rounded-md px-3 py-2 text-sm transition-colors hover:bg-sidebar-accent",
              pathname.startsWith("/admin/lookups") &&
                "bg-sidebar-accent text-primary font-medium"
            )}
          >
            Dropdown Lists
          </Link>
        </nav>
      )}
    </aside>
  );
}
