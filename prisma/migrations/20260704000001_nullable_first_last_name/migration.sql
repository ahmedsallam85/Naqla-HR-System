-- Make firstName and lastName nullable — form now uses fullName instead
ALTER TABLE "Employee"
  ALTER COLUMN "firstName" DROP NOT NULL,
  ALTER COLUMN "lastName" DROP NOT NULL;
