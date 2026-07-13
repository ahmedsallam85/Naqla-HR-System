"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

type NavChild = { label: string; href: string; enabled: boolean };
type NavItem = {
  label: string;
  href: string;
  enabled: boolean;
  adminOnly: boolean;
  children?: NavChild[];
};

const NAV_ITEMS: NavItem[] = [
  { label: "People Directory", href: "/personnel", enabled: true, adminOnly: false },
  { label: "Job Grading", href: "/job-grading", enabled: true, adminOnly: false },
  { label: "Critical Positions", href: "/critical-positions", enabled: true, adminOnly: false },
  {
    label: "Compensation",
    href: "/compensation",
    enabled: true,
    adminOnly: true,
    children: [
      { label: "Payroll", href: "/compensation/payroll", enabled: true },
      { label: "Incentives", href: "/compensation/incentives", enabled: false },
    ],
  },
  { label: "Recruitment", href: "/recruitment", enabled: false, adminOnly: false },
  { label: "Onboarding", href: "/onboarding", enabled: false, adminOnly: false },
  { label: "Performance", href: "/performance", enabled: false, adminOnly: false },
  { label: "Talent", href: "/talent", enabled: false, adminOnly: false },
];

export function AppSidebar({ isAdmin }: { isAdmin: boolean }) {
  const pathname = usePathname();

  const defaultOpen = NAV_ITEMS.filter((i) => i.children).reduce<Record<string, boolean>>(
    (acc, item) => {
      acc[item.href] = pathname.startsWith(item.href);
      return acc;
    },
    {}
  );

  const [openSections, setOpenSections] = useState<Record<string, boolean>>(defaultOpen);

  function toggle(href: string) {
    setOpenSections((prev) => ({ ...prev, [href]: !prev[href] }));
  }

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

          if (item.children) {
            const isOpen = openSections[item.href] ?? false;
            return (
              <div key={item.href}>
                <button
                  onClick={() => toggle(item.href)}
                  className={cn(
                    "flex w-full items-center justify-between rounded-md px-3 py-2 text-sm transition-colors hover:bg-sidebar-accent",
                    active && "text-primary font-medium"
                  )}
                >
                  {item.label}
                  <ChevronDown
                    className={cn(
                      "h-3.5 w-3.5 text-muted-foreground transition-transform duration-200",
                      isOpen && "rotate-180"
                    )}
                  />
                </button>
                {isOpen && (
                  <div className="flex flex-col gap-0.5 pl-3 pt-0.5">
                    {item.children.map((child) => {
                      const childActive = pathname.startsWith(child.href);
                      if (!child.enabled) {
                        return (
                          <span
                            key={child.href}
                            className="flex items-center justify-between rounded-md px-3 py-1.5 text-sm text-muted-foreground/50 cursor-not-allowed"
                          >
                            {child.label}
                            <span className="text-[10px]">soon</span>
                          </span>
                        );
                      }
                      return (
                        <Link
                          key={child.href}
                          href={child.href}
                          className={cn(
                            "rounded-md px-3 py-1.5 text-sm transition-colors hover:bg-sidebar-accent",
                            childActive && "bg-sidebar-accent text-primary font-medium"
                          )}
                        >
                          {child.label}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
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
