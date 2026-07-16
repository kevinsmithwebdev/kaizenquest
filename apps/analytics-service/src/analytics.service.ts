import { Injectable, UnauthorizedException } from "@nestjs/common";
import { verifyAuthToken } from "@kaizen/domain-auth";
import { getCappedActivityLevel } from "@kaizen/domain-goals";
import {
  addDays,
  getWeekStartMonday,
  startOfDay,
} from "@kaizen/shared-utils";

import { PrismaService } from "./prisma.service";

/** Local calendar YYYY-MM-DD (for week windows / event timestamps). */
const localDateKey = (date: Date): string => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

/** Prisma @db.Date values are UTC midnight — read with UTC components. */
const dbDateKey = (date: Date): string => {
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, "0");
  const d = String(date.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

const toDateOnly = (date: Date): Date => {
  const [y, m, d] = localDateKey(startOfDay(date)).split("-").map(Number);
  return new Date(Date.UTC(y!, m! - 1, d!));
};

@Injectable()
export class AnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

  async getStreak(authorizationHeader?: string) {
    const userId = await this.requireUserId(authorizationHeader);
    const activityDays = await this.prisma.userActivityDay.findMany({
      where: { userId },
      orderBy: { date: "asc" },
    });

    if (activityDays.length === 0) {
      return this.emptyStreak();
    }

    const countsByDate = new Map(
      activityDays.map((day) => [dbDateKey(day.date), day.eventCount]),
    );

    const { currentStreak, bestStreak } = this.computeStreaks(countsByDate);
    const weeklyActivity = this.buildWeeklyActivity(countsByDate);

    return { currentStreak, bestStreak, weeklyActivity };
  }

  async recordGoalEvent(userId: string, occurredAt: Date) {
    const date = toDateOnly(occurredAt);

    await this.prisma.userActivityDay.upsert({
      where: {
        userId_date: { userId, date },
      },
      create: {
        userId,
        date,
        eventCount: 1,
      },
      update: {
        eventCount: { increment: 1 },
      },
    });

    const activityDays = await this.prisma.userActivityDay.findMany({
      where: { userId },
      orderBy: { date: "asc" },
    });

    const countsByDate = new Map(
      activityDays.map((day) => [dbDateKey(day.date), day.eventCount]),
    );
    const { currentStreak, bestStreak } = this.computeStreaks(countsByDate);

    await this.prisma.userStreakSnapshot.upsert({
      where: { userId },
      create: { userId, currentStreak, bestStreak },
      update: { currentStreak, bestStreak },
    });
  }

  private emptyStreak() {
    return {
      currentStreak: 0,
      bestStreak: 0,
      weeklyActivity: this.buildWeeklyActivity(new Map()),
    };
  }

  private buildWeeklyActivity(countsByDate: Map<string, number>) {
    const now = new Date();
    const weekStart = getWeekStartMonday(now);
    const today = startOfDay(now);

    return Array.from({ length: 7 }, (_, index) => {
      const date = addDays(weekStart, index);
      const key = localDateKey(date);
      const eventCount =
        startOfDay(date) > today ? 0 : (countsByDate.get(key) ?? 0);

      return {
        date: key,
        eventCount,
        level: getCappedActivityLevel(eventCount),
      };
    });
  }

  private computeStreaks(countsByDate: Map<string, number>) {
    const hasActivity = (date: Date) =>
      (countsByDate.get(localDateKey(date)) ?? 0) > 0;

    const now = new Date();
    let currentStreak = 0;
    let checkDate = startOfDay(now);

    if (hasActivity(checkDate)) {
      currentStreak = 1;
      checkDate = addDays(checkDate, -1);
    } else {
      checkDate = addDays(checkDate, -1);
    }

    while (hasActivity(checkDate)) {
      currentStreak++;
      checkDate = addDays(checkDate, -1);
    }

    const sortedKeys = [...countsByDate.keys()].sort();
    if (sortedKeys.length === 0) {
      return { currentStreak: 0, bestStreak: 0 };
    }

    const start = startOfDay(new Date(`${sortedKeys[0]}T00:00:00`));
    const end = startOfDay(now);
    let bestStreak = 0;
    let run = 0;

    for (let date = start; date <= end; date = addDays(date, 1)) {
      if (hasActivity(date)) {
        run++;
        bestStreak = Math.max(bestStreak, run);
      } else {
        run = 0;
      }
    }

    return { currentStreak, bestStreak };
  }

  private async requireUserId(authorizationHeader?: string) {
    if (!authorizationHeader?.startsWith("Bearer ")) {
      throw new UnauthorizedException("Missing bearer token.");
    }

    const token = authorizationHeader.slice("Bearer ".length).trim();
    const userId = await verifyAuthToken(token);
    if (!userId) {
      throw new UnauthorizedException("Invalid token.");
    }
    return userId;
  }
}
