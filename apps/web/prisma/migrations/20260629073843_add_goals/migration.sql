-- CreateEnum
CREATE TYPE "GoalPeriod" AS ENUM ('WEEK', 'MONTH');

-- CreateEnum
CREATE TYPE "GoalType" AS ENUM ('OCCURANCE', 'TIME');

-- CreateTable
CREATE TABLE "Goal" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "period" "GoalPeriod" NOT NULL,
    "type" "GoalType" NOT NULL,
    "targetOccurrences" INTEGER,
    "targetDuration" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Goal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GoalEvent" (
    "id" TEXT NOT NULL,
    "goalId" TEXT NOT NULL,
    "type" "GoalType" NOT NULL,
    "occurrences" INTEGER,
    "duration" TEXT,
    "occurredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GoalEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Goal_userId_idx" ON "Goal"("userId");

-- CreateIndex
CREATE INDEX "GoalEvent_goalId_idx" ON "GoalEvent"("goalId");

-- CreateIndex
CREATE INDEX "GoalEvent_goalId_occurredAt_idx" ON "GoalEvent"("goalId", "occurredAt");

-- AddForeignKey
ALTER TABLE "Goal" ADD CONSTRAINT "Goal_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GoalEvent" ADD CONSTRAINT "GoalEvent_goalId_fkey" FOREIGN KEY ("goalId") REFERENCES "Goal"("id") ON DELETE CASCADE ON UPDATE CASCADE;
