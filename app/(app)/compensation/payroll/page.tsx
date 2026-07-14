import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function generateMonths() {
  const now = new Date();
  const endYear = now.getFullYear();
  const endMonth = now.getMonth() + 1;

  const months: { year: number; month: number }[] = [];
  let y = 2026;
  let m = 1;

  while (y < endYear || (y === endYear && m <= endMonth)) {
    months.push({ year: y, month: m });
    m++;
    if (m > 12) { m = 1; y++; }
  }

  return months.reverse();
}

export default async function PayrollPage() {
  const session = await auth();
  if (session?.user?.role !== "HR_ADMIN") redirect("/");

  const months = generateMonths();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Payroll</h1>
        <p className="text-muted-foreground">Select a month to view the payroll roster</p>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {months.map(({ year, month }) => {
          const mm = String(month).padStart(2, "0");
          return (
            <Link
              key={`${year}-${mm}`}
              href={`/compensation/payroll/${year}/${mm}`}
              className="flex flex-col items-center justify-center rounded-lg border px-4 py-6 text-center transition-colors hover:border-primary hover:bg-accent"
            >
              <span className="text-base font-semibold">{MONTH_NAMES[month - 1]}</span>
              <span className="text-sm text-muted-foreground">{year}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
