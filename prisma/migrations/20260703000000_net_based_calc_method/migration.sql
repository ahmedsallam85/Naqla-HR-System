-- AlterEnum: add NET_BASED to CompensationCalcMethod
ALTER TYPE "CompensationCalcMethod" ADD VALUE 'NET_BASED';

-- AlterTable: add totalCostMonthly to CompensationRecord (nullable for backward compat)
ALTER TABLE "CompensationRecord" ADD COLUMN "totalCostMonthly" DOUBLE PRECISION;

-- CreateTable: CompensationExtra
CREATE TABLE "CompensationExtra" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "isRecurring" BOOLEAN NOT NULL DEFAULT true,
    "date" TIMESTAMP(3) NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CompensationExtra_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CompensationExtra_employeeId_idx" ON "CompensationExtra"("employeeId");

-- AddForeignKey
ALTER TABLE "CompensationExtra" ADD CONSTRAINT "CompensationExtra_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;
