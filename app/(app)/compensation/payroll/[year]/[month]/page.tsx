import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function fmt(date: Date | null | undefined) {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("en-GB"); // DD/MM/YYYY
}

export default async function MonthlyPayrollPage({
  params,
}: {
  params: Promise<{ year: string; month: string }>;
}) {
  const session = await auth();
  if (session?.user?.role !== "HR_ADMIN") redirect("/");

  const { year: yearStr, month: monthStr } = await params;
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10);

  if (isNaN(year) || isNaN(month) || month < 1 || month > 12) notFound();

  const startOfMonth = new Date(year, month - 1, 1);
  const endOfMonth = new Date(year, month, 0, 23, 59, 59, 999);

  const employees = await prisma.employee.findMany({
    where: {
      AND: [
        {
          OR: [
            { dateOfJoining: null },
            { dateOfJoining: { lte: endOfMonth } },
          ],
        },
        {
          OR: [
            { dateOfExit: null },
            { dateOfExit: { gte: startOfMonth } },
          ],
        },
      ],
    },
    select: {
      employeeCode: true,
      fullName: true,
      designation: true,
      dateOfJoining: true,
      dateOfExit: true,
      vertical: true,
      division: true,
      function: true,
      workLocation: true,
      jobLevel: true,
      costCenter: true,
      bankAccountNumber: true,
    },
    orderBy: { fullName: "asc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/compensation/payroll" className="hover:text-foreground">
          Payroll
        </Link>
        <span>/</span>
        <span className="text-foreground">{MONTH_NAMES[month - 1]} {year}</span>
      </div>

      <div>
        <h1 className="text-2xl font-bold">
          {MONTH_NAMES[month - 1]} {year}
        </h1>
        <p className="text-muted-foreground">
          {employees.length} {employees.length === 1 ? "employee" : "employees"} on payroll
        </p>
      </div>

      <div className="overflow-x-auto rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="whitespace-nowrap">Emp Code</TableHead>
              <TableHead className="whitespace-nowrap">Full Name</TableHead>
              <TableHead className="whitespace-nowrap">Job Title</TableHead>
              <TableHead className="whitespace-nowrap">Hire Date</TableHead>
              <TableHead className="whitespace-nowrap">Exit Date</TableHead>
              <TableHead className="whitespace-nowrap">Vertical</TableHead>
              <TableHead className="whitespace-nowrap">Division</TableHead>
              <TableHead className="whitespace-nowrap">Function</TableHead>
              <TableHead className="whitespace-nowrap">Work Location</TableHead>
              <TableHead className="whitespace-nowrap">Job Level</TableHead>
              <TableHead className="whitespace-nowrap">Cost Center</TableHead>
              <TableHead className="whitespace-nowrap">Bank Account No.</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {employees.map((emp) => (
              <TableRow key={emp.employeeCode}>
                <TableCell className="font-mono text-xs">{emp.employeeCode}</TableCell>
                <TableCell className="whitespace-nowrap font-medium">{emp.fullName}</TableCell>
                <TableCell className="whitespace-nowrap">{emp.designation || "—"}</TableCell>
                <TableCell className="whitespace-nowrap">{fmt(emp.dateOfJoining)}</TableCell>
                <TableCell className="whitespace-nowrap">{fmt(emp.dateOfExit)}</TableCell>
                <TableCell className="whitespace-nowrap">{emp.vertical || "—"}</TableCell>
                <TableCell className="whitespace-nowrap">{emp.division || "—"}</TableCell>
                <TableCell className="whitespace-nowrap">{emp.function || "—"}</TableCell>
                <TableCell className="whitespace-nowrap">{emp.workLocation || "—"}</TableCell>
                <TableCell className="whitespace-nowrap">{emp.jobLevel || "—"}</TableCell>
                <TableCell className="whitespace-nowrap">{emp.costCenter || "—"}</TableCell>
                <TableCell className="font-mono text-xs">{emp.bankAccountNumber || "—"}</TableCell>
              </TableRow>
            ))}
            {employees.length === 0 && (
              <TableRow>
                <TableCell colSpan={12} className="py-10 text-center text-muted-foreground">
                  No employees on payroll for this month.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
