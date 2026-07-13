-- Add optional end date to CompensationExtra for recurring extras
ALTER TABLE "CompensationExtra" ADD COLUMN "endDate" TIMESTAMP(3);
