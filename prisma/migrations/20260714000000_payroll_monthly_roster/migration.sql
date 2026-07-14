-- Add basicGrossSalary to Employee
ALTER TABLE "Employee" ADD COLUMN "basicGrossSalary" DOUBLE PRECISION;

-- Salary history (tracks every basicGrossSalary change with timestamp)
CREATE TABLE "EmployeeSalaryHistory" (
  "id"            TEXT NOT NULL,
  "employeeId"    TEXT NOT NULL,
  "amount"        DOUBLE PRECISION NOT NULL,
  "effectiveDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "notes"         TEXT,
  "createdAt"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "EmployeeSalaryHistory_pkey" PRIMARY KEY ("id")
);

-- Recurring fixed additions (employee level, applies every payroll month)
CREATE TABLE "EmployeeFixedAddition" (
  "id"         TEXT NOT NULL,
  "employeeId" TEXT NOT NULL,
  "label"      TEXT NOT NULL,
  "amount"     DOUBLE PRECISION NOT NULL,
  "isActive"   BOOLEAN NOT NULL DEFAULT true,
  "createdAt"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"  TIMESTAMP(3) NOT NULL,
  CONSTRAINT "EmployeeFixedAddition_pkey" PRIMARY KEY ("id")
);

-- Per-month variable additions and deductions
CREATE TYPE "PayrollLineItemType" AS ENUM ('VARIABLE_ADDITION', 'DEDUCTION');

CREATE TABLE "PayrollMonthLineItem" (
  "id"         TEXT NOT NULL,
  "employeeId" TEXT NOT NULL,
  "year"       INTEGER NOT NULL,
  "month"      INTEGER NOT NULL,
  "type"       "PayrollLineItemType" NOT NULL,
  "label"      TEXT NOT NULL,
  "amount"     DOUBLE PRECISION NOT NULL,
  "notes"      TEXT,
  "createdAt"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "PayrollMonthLineItem_pkey" PRIMARY KEY ("id")
);

-- Indexes
CREATE INDEX "EmployeeSalaryHistory_employeeId_idx" ON "EmployeeSalaryHistory"("employeeId");
CREATE INDEX "EmployeeFixedAddition_employeeId_idx" ON "EmployeeFixedAddition"("employeeId");
CREATE INDEX "PayrollMonthLineItem_employeeId_year_month_idx" ON "PayrollMonthLineItem"("employeeId", "year", "month");
CREATE INDEX "PayrollMonthLineItem_year_month_idx" ON "PayrollMonthLineItem"("year", "month");

-- Foreign keys
ALTER TABLE "EmployeeSalaryHistory" ADD CONSTRAINT "EmployeeSalaryHistory_employeeId_fkey"
  FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "EmployeeFixedAddition" ADD CONSTRAINT "EmployeeFixedAddition_employeeId_fkey"
  FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "PayrollMonthLineItem" ADD CONSTRAINT "PayrollMonthLineItem_employeeId_fkey"
  FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;
