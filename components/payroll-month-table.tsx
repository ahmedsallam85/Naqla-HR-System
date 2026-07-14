"use client";

import { Settings2Icon } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PayrollLineItemsDialog } from "@/components/payroll-line-items-dialog";
import type { PayrollEmployee } from "@/app/(app)/compensation/payroll/[year]/[month]/page";

function fmt(date: Date | null | undefined) {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("en-GB");
}

function money(n: number | null | undefined) {
  if (n == null) return <span className="text-muted-foreground/60">—</span>;
  return <span>{n.toLocaleString("en-EG", { maximumFractionDigits: 2 })}</span>;
}

function moneyComputed(n: number) {
  return (
    <span className="tabular-nums">
      {n.toLocaleString("en-EG", { maximumFractionDigits: 2 })}
    </span>
  );
}

// Column header groups
const INFO_COLS = [
  "Emp Code", "Full Name", "Job Title", "Hire Date", "Exit Date",
  "Vertical", "Division", "Function", "Work Location", "Job Level",
  "Cost Center", "Legal Entity", "Bank Account No.",
];
const FINANCIAL_COLS = [
  "Basic Gross Salary", "SI Salary",
  "SI Emp Share", "SI Co Share", "Salary Tax", "Martyrs Tax",
];
const ENTRY_COLS = ["Fixed Additions", "Variable Additions", "Deductions"];
const NET_COLS = ["Net Pay"];

export function PayrollMonthTable({
  employees,
  year,
  month,
}: {
  employees: PayrollEmployee[];
  year: number;
  month: number;
}) {
  return (
    <div className="overflow-x-auto rounded-md border text-sm">
      <Table>
        <TableHeader>
          {/* Group header row */}
          <TableRow className="bg-muted/60 hover:bg-muted/60">
            <TableHead
              colSpan={INFO_COLS.length}
              className="border-r text-center text-[10px] font-semibold uppercase tracking-wider"
            >
              Employee Information
            </TableHead>
            <TableHead
              colSpan={FINANCIAL_COLS.length}
              className="border-r text-center text-[10px] font-semibold uppercase tracking-wider"
            >
              Financials (computed)
            </TableHead>
            <TableHead
              colSpan={ENTRY_COLS.length}
              className="border-r text-center text-[10px] font-semibold uppercase tracking-wider"
            >
              Additions &amp; Deductions
            </TableHead>
            <TableHead
              colSpan={NET_COLS.length}
              className="text-center text-[10px] font-semibold uppercase tracking-wider"
            >
              Result
            </TableHead>
          </TableRow>
          {/* Column header row */}
          <TableRow>
            {INFO_COLS.map((h, i) => (
              <TableHead
                key={h}
                className={`whitespace-nowrap${i === INFO_COLS.length - 1 ? " border-r" : ""}`}
              >
                {h}
              </TableHead>
            ))}
            {FINANCIAL_COLS.map((h, i) => (
              <TableHead
                key={h}
                className={`whitespace-nowrap text-right${i === FINANCIAL_COLS.length - 1 ? " border-r" : ""}`}
              >
                {h}
              </TableHead>
            ))}
            {ENTRY_COLS.map((h, i) => (
              <TableHead
                key={h}
                className={`whitespace-nowrap text-right${i === ENTRY_COLS.length - 1 ? " border-r" : ""}`}
              >
                {h}
              </TableHead>
            ))}
            <TableHead className="whitespace-nowrap text-right font-semibold">
              Net Pay
            </TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {employees.map((emp) => {
            const fixedTotal = emp.fixedAdditions.reduce((s, a) => s + a.amount, 0);
            const varTotal = emp.variableAdditions.reduce((s, a) => s + a.amount, 0);
            const dedTotal = emp.deductions.reduce((s, a) => s + a.amount, 0);
            const grossBase = emp.basicGrossSalary ?? 0;
            const netPay =
              grossBase +
              fixedTotal +
              varTotal -
              emp.empSI -
              emp.monthlyTax -
              emp.martyrs -
              dedTotal;

            return (
              <TableRow key={emp.id}>
                {/* Employee info */}
                <TableCell className="font-mono text-xs whitespace-nowrap">
                  {emp.employeeCode}
                </TableCell>
                <TableCell className="whitespace-nowrap font-medium">
                  {emp.fullName}
                </TableCell>
                <TableCell className="whitespace-nowrap">{emp.designation || "—"}</TableCell>
                <TableCell className="whitespace-nowrap">{fmt(emp.dateOfJoining)}</TableCell>
                <TableCell className="whitespace-nowrap">{fmt(emp.dateOfExit)}</TableCell>
                <TableCell className="whitespace-nowrap">{emp.vertical || "—"}</TableCell>
                <TableCell className="whitespace-nowrap">{emp.division || "—"}</TableCell>
                <TableCell className="whitespace-nowrap">{emp.function || "—"}</TableCell>
                <TableCell className="whitespace-nowrap">{emp.workLocation || "—"}</TableCell>
                <TableCell className="whitespace-nowrap">{emp.jobLevel || "—"}</TableCell>
                <TableCell className="whitespace-nowrap">{emp.costCenter || "—"}</TableCell>
                <TableCell className="whitespace-nowrap">{emp.legalEntity || "—"}</TableCell>
                <TableCell className="border-r font-mono text-xs whitespace-nowrap">
                  {emp.bankAccountNumber || "—"}
                </TableCell>

                {/* Financials — read-only, from People Directory */}
                <TableCell className="text-right whitespace-nowrap">
                  {money(emp.basicGrossSalary)}
                </TableCell>
                <TableCell className="text-right whitespace-nowrap">
                  {money(emp.socialInsuranceSalary)}
                </TableCell>
                <TableCell className="text-right whitespace-nowrap text-amber-600 dark:text-amber-400">
                  {emp.socialInsuranceSalary ? moneyComputed(emp.empSI) : <span className="text-muted-foreground/60">—</span>}
                </TableCell>
                <TableCell className="text-right whitespace-nowrap text-amber-600 dark:text-amber-400">
                  {emp.socialInsuranceSalary ? moneyComputed(emp.companySI) : <span className="text-muted-foreground/60">—</span>}
                </TableCell>
                <TableCell className="text-right whitespace-nowrap text-red-600 dark:text-red-400">
                  {emp.socialInsuranceSalary ? moneyComputed(emp.monthlyTax) : <span className="text-muted-foreground/60">—</span>}
                </TableCell>
                <TableCell className="border-r text-right whitespace-nowrap text-red-600 dark:text-red-400">
                  {emp.socialInsuranceSalary ? moneyComputed(emp.martyrs) : <span className="text-muted-foreground/60">—</span>}
                </TableCell>

                {/* Additions & Deductions — interactive */}
                <TableCell className="text-right whitespace-nowrap">
                  <PayrollLineItemsDialog emp={emp} year={year} month={month} trigger={
                    <button
                      type="button"
                      className="inline-flex items-center gap-1 rounded px-2 py-0.5 text-xs hover:bg-accent"
                    >
                      {fixedTotal > 0
                        ? fixedTotal.toLocaleString("en-EG", { maximumFractionDigits: 2 })
                        : <span className="text-muted-foreground">Add</span>}
                      <Settings2Icon className="h-3 w-3 text-muted-foreground" />
                    </button>
                  } />
                </TableCell>
                <TableCell className="text-right whitespace-nowrap">
                  <PayrollLineItemsDialog emp={emp} year={year} month={month} trigger={
                    <button
                      type="button"
                      className="inline-flex items-center gap-1 rounded px-2 py-0.5 text-xs hover:bg-accent"
                    >
                      {varTotal > 0
                        ? varTotal.toLocaleString("en-EG", { maximumFractionDigits: 2 })
                        : <span className="text-muted-foreground">Add</span>}
                      <Settings2Icon className="h-3 w-3 text-muted-foreground" />
                    </button>
                  } />
                </TableCell>
                <TableCell className="border-r text-right whitespace-nowrap">
                  <PayrollLineItemsDialog emp={emp} year={year} month={month} trigger={
                    <button
                      type="button"
                      className="inline-flex items-center gap-1 rounded px-2 py-0.5 text-xs hover:bg-accent"
                    >
                      {dedTotal > 0
                        ? dedTotal.toLocaleString("en-EG", { maximumFractionDigits: 2 })
                        : <span className="text-muted-foreground">Add</span>}
                      <Settings2Icon className="h-3 w-3 text-muted-foreground" />
                    </button>
                  } />
                </TableCell>

                {/* Net Pay */}
                <TableCell className="text-right whitespace-nowrap font-semibold">
                  {grossBase > 0
                    ? moneyComputed(netPay)
                    : <span className="text-muted-foreground/60">—</span>}
                </TableCell>
              </TableRow>
            );
          })}

          {employees.length === 0 && (
            <TableRow>
              <TableCell
                colSpan={INFO_COLS.length + FINANCIAL_COLS.length + ENTRY_COLS.length + NET_COLS.length}
                className="py-10 text-center text-muted-foreground"
              >
                No employees on payroll for this month.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
