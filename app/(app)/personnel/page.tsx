import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { isContractExpiringSoon } from "@/lib/employee";
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

export default async function PersonnelPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const session = await auth();
  const isAdmin = session?.user?.role === "HR_ADMIN";

  const employees = await prisma.employee.findMany({
    where: q
      ? {
          OR: [
            { fullName: { contains: q } },
            { employeeCode: { contains: q } },
            { businessEmail: { contains: q } },
            { designation: { contains: q } },
            { department: { contains: q } },
          ],
        }
      : undefined,
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Personnel</h1>
          <p className="text-muted-foreground">
            {employees.length} employee{employees.length === 1 ? "" : "s"}
          </p>
        </div>
        {isAdmin && (
          <Button
            nativeButton={false}
            render={<Link href="/personnel/new">Add employee</Link>}
          />
        )}
      </div>

      <form className="flex gap-2" method="GET">
        <input
          name="q"
          defaultValue={q || ""}
          placeholder="Search by name, code, email, designation..."
          className="flex h-9 w-full max-w-md rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
        <Button type="submit" variant="secondary">
          Search
        </Button>
      </form>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Code</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Designation</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Contract</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {employees.map((emp) => (
              <TableRow key={emp.id}>
                <TableCell className="font-mono text-xs">
                  {emp.employeeCode}
                </TableCell>
                <TableCell>
                  <Link
                    href={`/personnel/${emp.id}`}
                    className="font-medium hover:text-primary"
                  >
                    {emp.fullName}
                  </Link>
                  <div className="text-xs text-muted-foreground">
                    {emp.businessEmail}
                  </div>
                </TableCell>
                <TableCell>{emp.designation || "—"}</TableCell>
                <TableCell>{emp.department || "—"}</TableCell>
                <TableCell>
                  <Badge variant={emp.status === "ACTIVE" ? "default" : "secondary"}>
                    {emp.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  {isContractExpiringSoon(emp.contractRenewalDate) && (
                    <Badge variant="destructive">Renewal due</Badge>
                  )}
                </TableCell>
              </TableRow>
            ))}
            {employees.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground">
                  No employees found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
