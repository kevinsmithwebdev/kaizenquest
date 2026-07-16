-- AlterEnum
ALTER TYPE "GoalType" ADD VALUE 'AMOUNT';

-- AlterTable
ALTER TABLE "Goal" ADD COLUMN "targetAmount" DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "GoalEvent" ADD COLUMN "amount" DOUBLE PRECISION;
