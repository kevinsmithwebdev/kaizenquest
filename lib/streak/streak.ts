import { addDays, endOfDay, getWeekStartMonday, startOfDay } from "@/lib/dates";
import type { Goal } from "@/lib/goals/goal.types";

import type { DayActivity, UserStreak } from "./streak.types";

export const MAX_ACTIVITY_EVENTS = 10;

const WEEKDAY_LABELS = ["M", "T", "W", "T", "F", "S", "S"] as const;

export const getEventCountOnDate = (goals: Goal[], date: Date): number => {
  const dayStart = startOfDay(date);
  const dayEnd = endOfDay(date);

  return goals.reduce((count, goal) => {
    return (
      count +
      goal.history.filter(
        (event) => event.occurredAt >= dayStart && event.occurredAt < dayEnd,
      ).length
    );
  }, 0);
};

export const hasActivityOnDate = (goals: Goal[], date: Date): boolean =>
  getEventCountOnDate(goals, date) > 0;

export const getCappedActivityLevel = (eventCount: number): number =>
  Math.min(eventCount, MAX_ACTIVITY_EVENTS);

const getEarliestActivityDate = (goals: Goal[]): Date | null => {
  let earliest: Date | null = null;

  for (const goal of goals) {
    for (const event of goal.history) {
      const eventDay = startOfDay(event.occurredAt);
      if (!earliest || eventDay < earliest) {
        earliest = eventDay;
      }
    }
  }

  return earliest;
};

export const getCurrentStreak = (goals: Goal[], now = new Date()): number => {
  let streak = 0;
  let checkDate = startOfDay(now);

  if (hasActivityOnDate(goals, checkDate)) {
    streak = 1;
    checkDate = addDays(checkDate, -1);
  } else {
    checkDate = addDays(checkDate, -1);
  }

  while (hasActivityOnDate(goals, checkDate)) {
    streak++;
    checkDate = addDays(checkDate, -1);
  }

  return streak;
};

export const getBestStreak = (goals: Goal[], now = new Date()): number => {
  const start = getEarliestActivityDate(goals);
  if (!start) {
    return 0;
  }

  const end = startOfDay(now);
  let best = 0;
  let current = 0;

  for (let date = start; date <= end; date = addDays(date, 1)) {
    if (hasActivityOnDate(goals, date)) {
      current++;
      best = Math.max(best, current);
    } else {
      current = 0;
    }
  }

  return best;
};

export const getWeeklyActivity = (
  goals: Goal[],
  now = new Date(),
): DayActivity[] => {
  const weekStart = getWeekStartMonday(now);
  const today = startOfDay(now);

  return WEEKDAY_LABELS.map((dayLabel, index) => {
    const date = addDays(weekStart, index);
    const eventCount =
      startOfDay(date) > today ? 0 : getEventCountOnDate(goals, date);

    return { date, dayLabel, eventCount };
  });
};

export const computeUserStreak = (
  goals: Goal[],
  now = new Date(),
): UserStreak => ({
  currentStreak: getCurrentStreak(goals, now),
  bestStreak: getBestStreak(goals, now),
  weeklyActivity: getWeeklyActivity(goals, now),
});
