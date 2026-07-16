-- Repair goals set to AMOUNT without targetAmount (e.g. edited in Prisma Studio).
UPDATE "Goal"
SET
  "targetAmount" = "targetOccurrences"::double precision,
  "targetOccurrences" = NULL,
  "targetDuration" = NULL
WHERE type = 'AMOUNT'
  AND "targetAmount" IS NULL
  AND "targetOccurrences" IS NOT NULL;
