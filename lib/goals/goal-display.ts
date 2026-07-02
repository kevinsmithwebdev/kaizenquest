import type { Goal } from "./goal.types";
import {
  formatMinutesAsGoalDuration,
  formatOccurrenceCount,
  getGoalProgressInPeriod,
  getGoalTargetValue,
  parseIso8601DurationToMinutes,
} from "./goal-progress";

export type GoalTargetDisplay = {
  value: string;
  label: string;
};

export const getGoalTargetDisplay = (goal: Goal): GoalTargetDisplay => {
  if (goal.type === "OCCURANCE") {
    return {
      value: formatOccurrenceCount(goal.target),
      label: "occurrences",
    };
  }

  return {
    value: formatMinutesAsGoalDuration(
      parseIso8601DurationToMinutes(goal.target),
    ),
    label: "time",
  };
};

export const getGoalProgressDisplay = (goal: Goal, now = new Date()) => {
  const progress = getGoalProgressInPeriod(goal, now);
  const targetValue = getGoalTargetValue(goal);

  if (goal.type === "OCCURANCE") {
    return {
      current: String(progress),
      suffix: `/ ${formatOccurrenceCount(goal.target)}`,
      percent:
        targetValue > 0 ? Math.min(100, (progress / targetValue) * 100) : 0,
    };
  }

  return {
    current: String(progress),
    suffix: `/ ${formatMinutesAsGoalDuration(parseIso8601DurationToMinutes(goal.target))}`,
    percent:
      targetValue > 0 ? Math.min(100, (progress / targetValue) * 100) : 0,
  };
};

const goalAccentColors = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
] as const;

export const getGoalAccentColor = (index: number): string => {
  return (
    goalAccentColors[index % goalAccentColors.length] ?? goalAccentColors[0]
  );
};
