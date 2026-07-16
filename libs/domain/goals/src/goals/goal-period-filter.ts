import { GOAL_PERIODS } from "./goal.constants";
import type { Goal, GoalPeriod } from "./goal.types";

export const GOAL_PERIOD_FILTER_LABELS: Record<GoalPeriod, string> = {
  DAY: "Daily",
  WEEK: "Weekly",
  MONTH: "Monthly",
};

export const getGoalPeriodsPresent = (goals: Goal[]): GoalPeriod[] => {
  const present = new Set(goals.map((goal) => goal.period));
  return GOAL_PERIODS.filter((period) => present.has(period));
};

export const shouldShowPeriodFilter = (goals: Goal[]): boolean => {
  return getGoalPeriodsPresent(goals).length > 1;
};

export const filterGoalsBySelectedPeriods = (
  goals: Goal[],
  selectedPeriods: ReadonlySet<GoalPeriod>,
  availablePeriods: GoalPeriod[],
): Goal[] => {
  const selectedAvailable = availablePeriods.filter((period) =>
    selectedPeriods.has(period),
  );

  if (
    selectedAvailable.length === 0 ||
    selectedAvailable.length === availablePeriods.length
  ) {
    return goals;
  }

  const allowed = new Set(selectedAvailable);
  return goals.filter((goal) => allowed.has(goal.period));
};
