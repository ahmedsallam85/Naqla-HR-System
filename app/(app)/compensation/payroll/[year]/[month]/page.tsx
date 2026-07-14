import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { PayrollMonthTable } from "@/components/payroll-month-table";
import {
  annualTax,
  DEFAULT_TAX_BRACKETS,
  DEFAULT_TAX_CONFIG,
} from "@/lib/payroll-tax";

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

// Compute SI shares and taxes directly from the insured (SI) salary.
// socialInsuranceSalary is already the insured base set by HR.
function computeFromSISalary(siSalary: number) {
  const cfg = DEFAULT_TAX_CONFIG;
  const capped = Math.min(siSalary, cfg.maxInsured);
  const empSI = capped * cfg.empRate;
  const companySI = capped * cfg.companyRate;
  const mex = cfg.annualExemption / 12;
  const taxable = Math.max(0, (siSalary - empSI - mex) * 12);
  const monthlyTax = annualTax(taxable, DEFAULT_TAX_BRACKETS) / 12;
  const martyrs = siSalary * cfg.martyrRate;
  return { empSI, companySI, monthlyTax, martyrs };
}

export type PayrollEmployee = {
  id: string;
  employeeCode: string;
  fullName: string;
  designation: string | null;
  dateOfJoining: Date | null;
  dateOfExit: Date | null;
  vertical: string | null;
  division: string | null;
  function: string | null;
  workLocation: string | null;
  jobLevel: string | null;
  costCenter: string | null;
  legalEntity: string | null;
  bankAccountNumber: string | null;
  // financials
  basicGrossSalary: number | null;
  socialInsuranceSalary: number | null;
  empSI: number;
  companySI: number;
  monthlyTax: number;
  martyrs: number;
  // additions & deductions
  fixedAdditions: { id: string; label: string; amount: number; isActive: boolean }[];
  variableAdditions: { id: string; label: string; amount: number; notes: string | null }[];
  deductions: { id: string; label: string; amount: number; notes: string | null }[];
};

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

  const raw = await prisma.employee.findMany({
    where: {
      AND: [
        { OR: [{ dateOfJoining: null }, { dateOfJoining: { lte: endOfMonth } }] },
        { OR: [{ dateOfExit: null }, { dateOfExit: { gte: startOfMonth } }] },
      ],
    },
    select: {
      id: true,
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
      legalEntity: true,
      bankAccountNumber: true,
      basicGrossSalary: true,
      socialInsuranceSalary: true,
      fixedAdditions: { where: { isActive: true }, orderBy: { createdAt: "asc" } },
      payrollLineItems: {
        where: { year, month },
        orderBy: { createdAt: "asc" },
      },
    },
    orderBy: { fullName: "asc" },
  });

  const employees: PayrollEmployee[] = raw.map((emp) => {
    const siSal = emp.socialInsuranceSalary ?? 0;
    const computed = siSal > 0 ? computeFromSISalary(siSal) : { empSI: 0, companySI: 0, monthlyTax: 0, martyrs: 0 };

    return {
      id: emp.id,
      employeeCode: emp.employeeCode,
      fullName: emp.fullName,
      designation: emp.designation,
      dateOfJoining: emp.dateOfJoining,
      dateOfExit: emp.dateOfExit,
      vertical: emp.vertical,
      division: emp.division,
      function: emp.function,
      workLocation: emp.workLocation,
      jobLevel: emp.jobLevel,
      costCenter: emp.costCenter,
      legalEntity: emp.legalEntity,
      bankAccountNumber: emp.bankAccountNumber,
      basicGrossSalary: emp.basicGrossSalary,
      socialInsuranceSalary: emp.socialInsuranceSalary,
      empSI: computed.empSI,
      companySI: computed.companySI,
      monthlyTax: computed.monthlyTax,
      martyrs: computed.martyrs,
      fixedAdditions: emp.fixedAdditions,
      variableAdditions: emp.payrollLineItems
        .filter((i) => i.type === "VARIABLE_ADDITION")
        .map((i) => ({ id: i.id, label: i.label, amount: i.amount, notes: i.notes })),
      deductions: emp.payrollLineItems
        .filter((i) => i.type === "DEDUCTION")
        .map((i) => ({ id: i.id, label: i.label, amount: i.amount, notes: i.notes })),
    };
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/compensation/payroll" className="hover:text-foreground">
          Payroll
        </Link>
        <span>/</span>
        <span className="text-foreground">
          {MONTH_NAMES[month - 1]} {year}
        </span>
      </div>

      <div>
        <h1 className="text-2xl font-bold">
          {MONTH_NAMES[month - 1]} {year}
        </h1>
        <p className="text-muted-foreground">
          {employees.length} {employees.length === 1 ? "employee" : "employees"} on payroll
        </p>
      </div>

      <PayrollMonthTable employees={employees} year={year} month={month} />
    </div>
  );
}
