-- CreateEnum
CREATE TYPE "CompensationCalcMethod" AS ENUM ('STANDARD', 'REVERSE');

-- CreateEnum
CREATE TYPE "DeductionType" AS ENUM ('PREMIUM_CARD', 'MONEY_FELLOWS', 'STORE_INSTALLMENT', 'SALARY_ADVANCE_INSTALLMENT', 'PENALTY');

-- CreateEnum
CREATE TYPE "DeductionStatus" AS ENUM ('ACTIVE', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "AdditionType" AS ENUM ('SIGN_ON_BONUS', 'PERFORMANCE_BONUS', 'SALARY_ADVANCE');

-- CreateTable
CREATE TABLE "CompensationRecord" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "jobLevel" TEXT,
    "compaRatio" DOUBLE PRECISION,
    "calcMethod" "CompensationCalcMethod" NOT NULL,
    "agreedNetBasicSalary" DOUBLE PRECISION NOT NULL,
    "agreedNetAllowances" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalAgreedNetSalary" DOUBLE PRECISION NOT NULL,
    "socialInsuredSalary" DOUBLE PRECISION NOT NULL,
    "socialInsuranceEmployeeShare" DOUBLE PRECISION NOT NULL,
    "socialInsuranceCompanyShare" DOUBLE PRECISION NOT NULL,
    "grossSalary" DOUBLE PRECISION NOT NULL,
    "salaryTaxAnnual" DOUBLE PRECISION NOT NULL,
    "salaryTaxMonthly" DOUBLE PRECISION NOT NULL,
    "martyrFundDeduction" DOUBLE PRECISION NOT NULL,
    "lastCommissionReceivedAmount" DOUBLE PRECISION,
    "notes" TEXT,
    "enteredById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CompensationRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CompensationDeduction" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "type" "DeductionType" NOT NULL,
    "totalAmount" DOUBLE PRECISION,
    "numInstallments" INTEGER,
    "monthlyAmount" DOUBLE PRECISION NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "status" "DeductionStatus" NOT NULL DEFAULT 'ACTIVE',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CompensationDeduction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CompensationAddition" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "type" "AdditionType" NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CompensationAddition_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BankTransferExport" (
    "id" TEXT NOT NULL,
    "periodMonth" INTEGER NOT NULL,
    "periodYear" INTEGER NOT NULL,
    "employeeCount" INTEGER NOT NULL,
    "totalAmount" DOUBLE PRECISION NOT NULL,
    "generatedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BankTransferExport_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CompensationRecord_employeeId_idx" ON "CompensationRecord"("employeeId");

-- CreateIndex
CREATE INDEX "CompensationDeduction_employeeId_idx" ON "CompensationDeduction"("employeeId");

-- CreateIndex
CREATE INDEX "CompensationAddition_employeeId_idx" ON "CompensationAddition"("employeeId");

-- AddForeignKey
ALTER TABLE "CompensationRecord" ADD CONSTRAINT "CompensationRecord_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompensationRecord" ADD CONSTRAINT "CompensationRecord_enteredById_fkey" FOREIGN KEY ("enteredById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompensationDeduction" ADD CONSTRAINT "CompensationDeduction_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompensationAddition" ADD CONSTRAINT "CompensationAddition_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BankTransferExport" ADD CONSTRAINT "BankTransferExport_generatedById_fkey" FOREIGN KEY ("generatedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
