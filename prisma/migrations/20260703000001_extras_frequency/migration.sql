-- Replace isRecurring boolean with a frequency string on CompensationExtra.
-- The table was just created; any existing rows get MONTHLY as the default.

ALTER TABLE "CompensationExtra" ADD COLUMN "frequency" TEXT NOT NULL DEFAULT 'MONTHLY';
ALTER TABLE "CompensationExtra" DROP COLUMN "isRecurring";
