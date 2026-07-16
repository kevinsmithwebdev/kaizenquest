-- CreateTable
CREATE TABLE "UserActivityDay" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "eventCount" INTEGER NOT NULL,

    CONSTRAINT "UserActivityDay_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserStreakSnapshot" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "currentStreak" INTEGER NOT NULL,
    "bestStreak" INTEGER NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserStreakSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "UserActivityDay_userId_idx" ON "UserActivityDay"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "UserActivityDay_userId_date_key" ON "UserActivityDay"("userId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "UserStreakSnapshot_userId_key" ON "UserStreakSnapshot"("userId");
