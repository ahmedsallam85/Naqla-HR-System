-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'EMPLOYEE',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Employee" (
    "id" TEXT NOT NULL PRIMARY KEY,
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
    "contractType" TEXT,
    "contractRenewalDate" DATETIME,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "sourceOfHiring" TEXT,
    "dateOfJoining" DATETIME,
    "dateOfExit" DATETIME,
    "reportingManagerId" TEXT,
    "dateOfBirth" DATETIME,
    "gender" TEXT,
    "maritalStatus" TEXT,
    "workPhone" TEXT,
    "personalPhone" TEXT,
    "alternativePhone" TEXT,
    "presentAddress" TEXT,
    "idAddress" TEXT,
    "socialInsuranceNumber" TEXT,
    "socialInsuranceStatus" TEXT,
    "medicalInsurancePlan" TEXT,
    "medicalInsuranceExpiryDate" DATETIME,
    "bankAccountName" TEXT,
    "bankAccountNumber" TEXT,
    "idNumber" TEXT,
    "idExpiryDate" DATETIME,
    "jobLevel" TEXT,
    "personalLevel" TEXT,
    "lastPromotionDate" DATETIME,
    "previousTitleAtPromotion" TEXT,
    "lastTransferDate" DATETIME,
    "previousTitleAtTransfer" TEXT,
    "probationScore" REAL,
    "talentStatus" TEXT NOT NULL DEFAULT 'NOT_ASSESSED',
    "lastTalentEvaluationDate" DATETIME,
    "userId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Employee_reportingManagerId_fkey" FOREIGN KEY ("reportingManagerId") REFERENCES "Employee" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Employee_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Employee_employeeCode_key" ON "Employee"("employeeCode");

-- CreateIndex
CREATE UNIQUE INDEX "Employee_businessEmail_key" ON "Employee"("businessEmail");

-- CreateIndex
CREATE UNIQUE INDEX "Employee_userId_key" ON "Employee"("userId");
