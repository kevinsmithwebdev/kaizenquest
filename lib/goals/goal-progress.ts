import type { Goal, GoalPeriod } from "./goal.types";

const ISO_8601_DURATION_REGEX =
  /^P(?:(\d+)Y)?(?:(\d+)M)?(?:(\d+)W)?(?:(\d+)D)?(?:T(?:(\d+)H)?(?:(\d+)M)?(?:(\d+(?:\.\d+)?)S)?)?$/;

export const parseIso8601DurationToMinutes = (value: string): number => {
  const match = ISO_8601_DURATION_REGEX.exec(value);
  if (!match) {
    return 0;
  }

  const weeks = Number(match[3] ?? 0);
  const days = Number(match[4] ?? 0);
  const hours = Number(match[5] ?? 0);
  const minutes = Number(match[6] ?? 0);
  const seconds = Number(match[7] ?? 0);

  return (
    weeks * 7 * 24 * 60 +
    days * 24 * 60 +
    hours * 60 +
    minutes +
    Math.round(seconds / 60)
  );
};

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

const getPeriodStart = (period: GoalPeriod, now = new Date()): Date => {
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);

  if (period === "WEEK") {
    const dayOffset = (start.getDay() + 6) % 7;
    start.setDate(start.getDate() - dayOffset);
    return start;
  }

  return new Date(start.getFullYear(), start.getMonth(), 1);
};

export const getGoalProgressInPeriod = (
  goal: Goal,
  now = new Date(),
): number => {
  const periodStart = getPeriodStart(goal.period, now);

  return goal.history
    .filter((event) => event.occurredAt >= periodStart)
    .reduce((total, event) => {
      if (event.type === "OCCURANCE") {
        return total + event.occurrences;
      }

      return total + parseIso8601DurationToMinutes(event.duration);
    }, 0);
};

export const getGoalTargetValue = (goal: Goal): number => {
  if (goal.type === "OCCURANCE") {
    return goal.target;
  }

  return parseIso8601DurationToMinutes(goal.target);
};

export const isGoalMet = (goal: Goal, now = new Date()): boolean => {
  const progress = getGoalProgressInPeriod(goal, now);
  const target = getGoalTargetValue(goal);

  return target > 0 && progress >= target;
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
