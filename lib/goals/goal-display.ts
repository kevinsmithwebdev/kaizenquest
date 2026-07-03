import type { Goal, GoalPeriod } from "./goal.types";
import {
  formatAmount,
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

const GOAL_PERIOD_LABELS: Record<GoalPeriod, string> = {
  DAY: "today",
  WEEK: "this week",
  MONTH: "this month",
};

export const getGoalPeriodLabel = (period: GoalPeriod): string => {
  return GOAL_PERIOD_LABELS[period];
};

export const getGoalTargetDisplay = (goal: Goal): GoalTargetDisplay => {
  const label = getGoalPeriodLabel(goal.period);

  if (goal.type === "OCCURANCE") {
    return {
      value: formatOccurrenceCount(goal.target),
      label,
    };
  }

  if (goal.type === "TIME") {
    return {
      value: formatMinutesAsGoalDuration(
        parseIso8601DurationToMinutes(goal.target),
      ),
      label,
    };
  }

  return {
    value: formatAmount(goal.target),
    label,
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

  if (goal.type === "TIME") {
    return {
      current: String(progress),
      suffix: `/ ${formatMinutesAsGoalDuration(parseIso8601DurationToMinutes(goal.target))}`,
      percent:
        targetValue > 0 ? Math.min(100, (progress / targetValue) * 100) : 0,
    };
  }

  return {
    current: formatAmount(progress),
    suffix: `/ ${formatAmount(goal.target)}`,
    percent:
      targetValue > 0 ? Math.min(100, (progress / targetValue) * 100) : 0,
  };
};

export const getGoalProgressColor = (percent: number): string => {
  if (percent >= 100) {
    return "var(--success)";
  }

  if (percent > 50) {
    return "var(--energy)";
  }

  if (percent > 25) {
    return "var(--brand)";
  }

  return "var(--destructive)";
};
