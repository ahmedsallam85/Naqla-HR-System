import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default async function CompensationPage() {
  const session = await auth();
  if (session?.user?.role !== "HR_ADMIN") {
    redirect("/");
  }

  const employees = await prisma.employee.findMany({
    where: { status: "ACTIVE" },
    select: {
      id: true,
      employeeCode: true,
      fullName: true,
      jobLevel: true,
      compensationRecords: { orderBy: { createdAt: "desc" }, take: 1 },
    },
    orderBy: { fullName: "asc" },
  });

  const withRecord = employees.filter((e) => e.compensationRecords.length > 0).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Compensation</h1>
          <p className="text-muted-foreground">
            {withRecord} of {employees.length} active employees have a compensation record
          </p>
        </div>
        <Button
          nativeButton={false}
          render={<Link href="/compensation/export">Bank transfer export</Link>}
        />
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Employee</TableHead>
              <TableHead>Job level</TableHead>
              <TableHead>Total net salary</TableHead>
              <TableHead>Gross salary</TableHead>
              <TableHead>Last updated</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {employees.map((emp) => {
              const latest = emp.compensationRecords[0];
              return (
                <TableRow key={emp.id}>
                  <TableCell>
                    <Link
                      href={`/compensation/${emp.id}`}
                      className="font-medium hover:text-primary"
                    >
                      {emp.fullName}
                    </Link>
                    <p className="text-xs text-muted-foreground">{emp.employeeCode}</p>
                  </TableCell>
                  <TableCell>{emp.jobLevel || "—"}</TableCell>
                  <TableCell>
                    {latest ? (
                      latest.totalAgreedNetSalary.toLocaleString(undefined, {
                        maximumFractionDigits: 2,
                      })
                    ) : (
                      <Badge variant="secondary">Not set</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {latest?.grossSalary.toLocaleString(undefined, { maximumFractionDigits: 2 }) ?? "—"}
                  </TableCell>
                  <TableCell>
                    {latest ? new Date(latest.createdAt).toLocaleDateString() : "—"}
                  </TableCell>
                </TableRow>
              );
            })}
            {employees.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground">
                  No active employees yet.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
