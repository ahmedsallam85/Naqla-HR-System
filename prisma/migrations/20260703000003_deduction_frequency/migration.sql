-- Add frequency to CompensationDeduction; existing rows default to MONTHLY
ALTER TABLE "CompensationDeduction" ADD COLUMN "frequency" TEXT NOT NULL DEFAULT 'MONTHLY';
