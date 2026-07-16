import { getWeekStartMonday, startOfDay } from "@kaizen/shared-utils";

import type { Goal, GoalPeriod } from "./goal.types";
import { parseIso8601DurationToMinutes } from "./iso-duration-parse";

export { parseIso8601DurationToMinutes };

export const formatMinutesAsGoalDuration = (totalMinutes: number): string => {
  if (totalMinutes <= 0) {
    return "0 min";
  }

  if (totalMinutes % 60 === 0) {
    const hours = totalMinutes / 60;
    return hours === 1 ? "1 hr" : `${hours} hr`;
  }

  return totalMinutes === 1 ? "1 min" : `${totalMinutes} min`;
};

export const formatOccurrenceCount = (count: number): string => {
  return count === 1 ? "1 time" : `${count} times`;
};

export const formatAmount = (amount: number): string => {
  return Number.isInteger(amount)
    ? amount.toString()
    : Number.parseFloat(amount.toFixed(4)).toString();
};

const getPeriodStart = (period: GoalPeriod, now = new Date()): Date => {
  if (period === "DAY") {
    return startOfDay(now);
  }

  if (period === "WEEK") {
    return getWeekStartMonday(now);
  }

  const start = startOfDay(now);
  return new Date(start.getFullYear(), start.getMonth(), 1);
};

export const getGoalProgressInPeriod = (
  goal: Goal,
  now = new Date(),
  viewPeriod: GoalPeriod = goal.period,
): number => {
  const periodStart = getPeriodStart(viewPeriod, now);

  return goal.history
    .filter((event) => event.occurredAt >= periodStart)
    .reduce((total, event) => {
      if (event.type === "OCCURANCE") {
        return total + event.occurrences;
      }

      if (event.type === "TIME") {
        return total + parseIso8601DurationToMinutes(event.duration);
      }

      return total + event.amount;
    }, 0);
};

export const getGoalTargetValue = (goal: Goal): number => {
  if (goal.type === "OCCURANCE" || goal.type === "AMOUNT") {
    return goal.target;
  }

  return parseIso8601DurationToMinutes(goal.target);
};

export const isGoalMet = (
  goal: Goal,
  now = new Date(),
  viewPeriod: GoalPeriod = goal.period,
): boolean => {
  const progress = getGoalProgressInPeriod(goal, now, viewPeriod);
  const target = getGoalTargetValue(goal);

  return target > 0 && progress >= target;
};

export const getGoalCompletionRatio = (
  goal: Goal,
  now = new Date(),
  viewPeriod: GoalPeriod = goal.period,
): number => {
  const target = getGoalTargetValue(goal);
  if (target <= 0) {
    return 0;
  }

  const progress = getGoalProgressInPeriod(goal, now, viewPeriod);
  return Math.min(1, progress / target);
};

export const getGoalProgressPercent = (
  goal: Goal,
  now = new Date(),
): number => {
  const target = getGoalTargetValue(goal);
  if (target <= 0) {
    return 0;
  }

  const progress = getGoalProgressInPeriod(goal, now);
  return Math.min(100, Math.round((progress / target) * 100));
};
