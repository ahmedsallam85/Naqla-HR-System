-- CreateEnum
CREATE TYPE "CriticalPriority" AS ENUM ('IMPERATIVE', 'IMPORTANT', 'DISCRETIONARY', 'NOT_URGENT');

-- CreateTable
CREATE TABLE "Designation" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "grade" TEXT,
    "holderName" TEXT,
    "holderId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Designation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CriticalAssessment" (
    "id" TEXT NOT NULL,
    "designationId" TEXT NOT NULL,
    "scores" INTEGER[],
    "sectionScores" INTEGER[],
    "total" INTEGER NOT NULL,
    "priority" "CriticalPriority" NOT NULL,
    "assessorId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CriticalAssessment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SuccessProfile" (
    "id" TEXT NOT NULL,
    "designationId" TEXT NOT NULL,
    "incumbent" TEXT,
    "year" TEXT,
    "location" TEXT,
    "level" TEXT,
    "area" TEXT,
    "urgency" INTEGER,
    "criteria" JSONB,
    "leadership" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SuccessProfile_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Designation" ADD CONSTRAINT "Designation_holderId_fkey" FOREIGN KEY ("holderId") REFERENCES "Employee"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CriticalAssessment" ADD CONSTRAINT "CriticalAssessment_designationId_fkey" FOREIGN KEY ("designationId") REFERENCES "Designation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CriticalAssessment" ADD CONSTRAINT "CriticalAssessment_assessorId_fkey" FOREIGN KEY ("assessorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SuccessProfile" ADD CONSTRAINT "SuccessProfile_designationId_fkey" FOREIGN KEY ("designationId") REFERENCES "Designation"("id") ON DELETE CASCADE ON UPDATE CASCADE;
