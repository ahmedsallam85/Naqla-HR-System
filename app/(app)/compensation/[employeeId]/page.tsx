import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CompensationDeductionsManager } from "@/components/compensation-deductions-manager";
import { CompensationAdditionsManager } from "@/components/compensation-additions-manager";
import { CompensationExtrasManager } from "@/components/compensation-extras-manager";

function money(n: number) {
  return n.toLocaleString(undefined, { maximumFractionDigits: 2 });
}

export default async function CompensationDetailPage({
  params,
}: {
  params: Promise<{ employeeId: string }>;
}) {
  const session = await auth();
  if (session?.user?.role !== "HR_ADMIN") {
    redirect("/");
  }

  const { employeeId } = await params;
  const employee = await prisma.employee.findUnique({
    where: { id: employeeId },
    include: {
      compensationRecords: {
        orderBy: { createdAt: "desc" },
        include: { enteredBy: { select: { email: true } } },
      },
    },
  });
  if (!employee) notFound();

  const latest = employee.compensationRecords[0];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{employee.fullName}</h1>
          <p className="text-muted-foreground">
            {employee.employeeCode}
            {employee.jobLevel ? ` · ${employee.jobLevel}` : ""}
          </p>
        </div>
        <Button
          nativeButton={false}
          render={<Link href={`/compensation/${employee.id}/edit`}>New compensation version</Link>}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Current package</CardTitle>
        </CardHeader>
        <CardContent>
          {latest ? (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              <div>
                <p className="text-xs text-muted-foreground">Total net salary</p>
                <p className="text-xl font-bold text-primary">{money(latest.totalAgreedNetSalary)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Agreed net basic</p>
                <p className="text-lg font-semibold">{money(latest.agreedNetBasicSalary)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Agreed net allowances</p>
                <p className="text-lg font-semibold">{money(latest.agreedNetAllowances)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Gross salary</p>
                <p className="text-lg font-semibold">{money(latest.grossSalary)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Social insured salary</p>
                <p>{money(latest.socialInsuredSalary)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Social insurance — employee</p>
                <p>{money(latest.socialInsuranceEmployeeShare)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Social insurance — company</p>
                <p>{money(latest.socialInsuranceCompanyShare)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Salary tax (monthly)</p>
                <p>{money(latest.salaryTaxMonthly)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Salary tax (annual)</p>
                <p>{money(latest.salaryTaxAnnual)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Compa ratio</p>
                <p>{latest.compaRatio ?? "—"}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Last commission received</p>
                <p>{latest.lastCommissionReceivedAmount != null ? money(latest.lastCommissionReceivedAmount) : "—"}</p>
              </div>
              {latest.totalCostMonthly != null && (
                <div>
                  <p className="text-xs text-muted-foreground">Total monthly cost to company</p>
                  <p className="text-lg font-bold text-primary">{money(latest.totalCostMonthly)}</p>
                </div>
              )}
            </div>
          ) : (
            <p className="text-muted-foreground">No compensation record yet.</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">History</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Method</TableHead>
                <TableHead>Entered by</TableHead>
                <TableHead>Net basic</TableHead>
                <TableHead>Allowances</TableHead>
                <TableHead>Total net</TableHead>
                <TableHead>Gross</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {employee.compensationRecords.map((rec) => (
                <TableRow key={rec.id}>
                  <TableCell>{new Date(rec.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell>{rec.calcMethod}</TableCell>
                  <TableCell>{rec.enteredBy?.email ?? "—"}</TableCell>
                  <TableCell>{money(rec.agreedNetBasicSalary)}</TableCell>
                  <TableCell>{money(rec.agreedNetAllowances)}</TableCell>
                  <TableCell className="font-semibold">{money(rec.totalAgreedNetSalary)}</TableCell>
                  <TableCell>{money(rec.grossSalary)}</TableCell>
                </TableRow>
              ))}
              {employee.compensationRecords.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground">
                    No history yet.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <CompensationExtrasManager employeeId={employee.id} />
      <CompensationDeductionsManager employeeId={employee.id} />
      <CompensationAdditionsManager employeeId={employee.id} />
    </div>
  );
}
