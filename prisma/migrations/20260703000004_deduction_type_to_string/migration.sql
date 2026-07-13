-- Convert CompensationDeduction.type from DeductionType enum to plain TEXT
ALTER TABLE "CompensationDeduction" ALTER COLUMN "type" TYPE TEXT USING "type"::TEXT;

-- Drop the now-unused enum
DROP TYPE IF EXISTS "DeductionType";

-- Rename existing enum-value rows to human-readable strings so they match
-- the new lookup values that will be seeded below
UPDATE "CompensationDeduction" SET "type" = 'Premium Card'               WHERE "type" = 'PREMIUM_CARD';
UPDATE "CompensationDeduction" SET "type" = 'Money Fellows'              WHERE "type" = 'MONEY_FELLOWS';
UPDATE "CompensationDeduction" SET "type" = 'Store Installment'          WHERE "type" = 'STORE_INSTALLMENT';
UPDATE "CompensationDeduction" SET "type" = 'Salary Advance Installment' WHERE "type" = 'SALARY_ADVANCE_INSTALLMENT';
UPDATE "CompensationDeduction" SET "type" = 'Penalty'                    WHERE "type" = 'PENALTY';

-- Seed the five default deduction types as admin-configurable lookup values
INSERT INTO "LookupValue" ("id", "category", "value", "sortOrder", "isActive", "createdAt")
VALUES
  (gen_random_uuid()::text, 'COMPENSATION_DEDUCTION_TYPE', 'Premium Card',               1, true, NOW()),
  (gen_random_uuid()::text, 'COMPENSATION_DEDUCTION_TYPE', 'Money Fellows',              2, true, NOW()),
  (gen_random_uuid()::text, 'COMPENSATION_DEDUCTION_TYPE', 'Store Installment',          3, true, NOW()),
  (gen_random_uuid()::text, 'COMPENSATION_DEDUCTION_TYPE', 'Salary Advance Installment', 4, true, NOW()),
  (gen_random_uuid()::text, 'COMPENSATION_DEDUCTION_TYPE', 'Penalty',                   5, true, NOW())
ON CONFLICT ("category", "value") DO NOTHING;
