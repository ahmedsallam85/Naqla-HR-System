-- CreateTable
CREATE TABLE "JobRole" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "department" TEXT,
    "division" TEXT,
    "responsibilities" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "JobRole_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JobEvaluation" (
    "id" TEXT NOT NULL,
    "jobRoleId" TEXT NOT NULL,
    "khTech" TEXT NOT NULL,
    "khFt" TEXT NOT NULL,
    "khMgmt" TEXT NOT NULL,
    "khMgmtFt" TEXT NOT NULL,
    "khHr" TEXT NOT NULL,
    "psTe" TEXT NOT NULL,
    "psTc" TEXT NOT NULL,
    "accFta" TEXT NOT NULL,
    "accMag" TEXT NOT NULL,
    "accType" TEXT NOT NULL,
    "khPoints" INTEGER NOT NULL,
    "psPoints" INTEGER NOT NULL,
    "accPoints" INTEGER NOT NULL,
    "totalPoints" INTEGER NOT NULL,
    "hayLevel" TEXT NOT NULL,
    "khNotation" TEXT NOT NULL,
    "khValidity" TEXT,
    "psValidity" TEXT,
    "accValidity" TEXT,
    "notes" TEXT,
    "evaluatorId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "JobEvaluation_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "JobEvaluation" ADD CONSTRAINT "JobEvaluation_jobRoleId_fkey" FOREIGN KEY ("jobRoleId") REFERENCES "JobRole"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobEvaluation" ADD CONSTRAINT "JobEvaluation_evaluatorId_fkey" FOREIGN KEY ("evaluatorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
