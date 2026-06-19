-- CreateEnum
CREATE TYPE "Role" AS ENUM ('HR_ADMIN', 'HIRING_MANAGER', 'LINE_MANAGER', 'EMPLOYEE');

-- CreateEnum
CREATE TYPE "EmploymentStatus" AS ENUM ('ACTIVE', 'RESIGNED');

-- CreateEnum
CREATE TYPE "ContractType" AS ENUM ('PERMANENT', 'FIXED_TERM', 'PROBATION', 'CONTRACTOR');

-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE');

-- CreateEnum
CREATE TYPE "MaritalStatus" AS ENUM ('SINGLE', 'MARRIED', 'DIVORCED', 'WIDOWED');

-- CreateEnum
CREATE TYPE "TalentStatus" AS ENUM ('NOT_ASSESSED', 'CORE', 'HIGH_POTENTIAL', 'TOP_TALENT', 'AT_RISK');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'EMPLOYEE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Employee" (
    "id" TEXT NOT NULL,
    "employeeCode" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "photoUrl" TEXT,
    "businessEmail" TEXT NOT NULL,
    "personalEmail" TEXT,
    "workLocation" TEXT,
    "businessUnit" TEXT,
    "designation" TEXT,
    "division" TEXT,
    "function" TEXT,
    "functionType" TEXT,
    "vertical" TEXT,
    "jobLocation" TEXT,
    "department" TEXT,
    "systemAuthority" TEXT,
    "contractType" "ContractType",
    "contractRenewalDate" TIMESTAMP(3),
    "status" "EmploymentStatus" NOT NULL DEFAULT 'ACTIVE',
    "sourceOfHiring" TEXT,
    "dateOfJoining" TIMESTAMP(3),
    "dateOfExit" TIMESTAMP(3),
    "reportingManagerId" TEXT,
    "dateOfBirth" TIMESTAMP(3),
    "gender" "Gender",
    "maritalStatus" "MaritalStatus",
    "workPhone" TEXT,
    "personalPhone" TEXT,
    "alternativePhone" TEXT,
    "presentAddress" TEXT,
    "idAddress" TEXT,
    "socialInsuranceNumber" TEXT,
    "socialInsuranceStatus" TEXT,
    "medicalInsurancePlan" TEXT,
    "medicalInsuranceExpiryDate" TIMESTAMP(3),
    "bankAccountName" TEXT,
    "bankAccountNumber" TEXT,
    "idNumber" TEXT,
    "idExpiryDate" TIMESTAMP(3),
    "jobLevel" TEXT,
    "personalLevel" TEXT,
    "lastPromotionDate" TIMESTAMP(3),
    "previousTitleAtPromotion" TEXT,
    "lastTransferDate" TIMESTAMP(3),
    "previousTitleAtTransfer" TEXT,
    "probationScore" DOUBLE PRECISION,
    "talentStatus" "TalentStatus" NOT NULL DEFAULT 'NOT_ASSESSED',
    "lastTalentEvaluationDate" TIMESTAMP(3),
    "userId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Employee_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Employee_employeeCode_key" ON "Employee"("employeeCode");

-- CreateIndex
CREATE UNIQUE INDEX "Employee_businessEmail_key" ON "Employee"("businessEmail");

-- CreateIndex
CREATE UNIQUE INDEX "Employee_userId_key" ON "Employee"("userId");

-- AddForeignKey
ALTER TABLE "Employee" ADD CONSTRAINT "Employee_reportingManagerId_fkey" FOREIGN KEY ("reportingManagerId") REFERENCES "Employee"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Employee" ADD CONSTRAINT "Employee_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
