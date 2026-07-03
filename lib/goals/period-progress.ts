import {
  GOAL_CATEGORIES,
  getGoalCategoryColors,
  type GoalCategory,
} from "./goal-categories";
import { getGoalCompletionRatio, isGoalMet } from "./goal-progress";
import type { Goal, GoalPeriod } from "./goal.types";

export const PERIOD_PROGRESS_LABELS: Record<GoalPeriod, string> = {
  DAY: "Today's Progress",
  WEEK: "This Week's Progress",
  MONTH: "This Month's Progress",
};

export type PeriodProgressSegment = {
  categoryKey: string;
  color: string;
  /** Share of the bar width allocated to this category (0–100). */
  widthPercent: number;
  /** Completion within this category segment (0–100). */
  fillPercent: number;
  completed: number;
  total: number;
};

export type PeriodProgressSummary = {
  period: GoalPeriod;
  label: string;
  completed: number;
  total: number;
  percent: number;
  segments: PeriodProgressSegment[];
};

const sortCategories = (
  a: GoalCategory | null,
  b: GoalCategory | null,
): number => {
  if (a === null) {
    return 1;
  }

  if (b === null) {
    return -1;
  }

  return GOAL_CATEGORIES.indexOf(a) - GOAL_CATEGORIES.indexOf(b);
};

export const getPeriodProgressSummary = (
  goals: Goal[],
  period: GoalPeriod,
  now = new Date(),
): PeriodProgressSummary => {
  const periodGoals =
    period === "DAY" ? goals : goals.filter((goal) => goal.period === period);
  const total = periodGoals.length;
  const completed = periodGoals.filter((goal) =>
    isGoalMet(goal, now, period),
  ).length;
  const percent = total > 0 ? Math.round((completed / total) * 100) : 0;

  if (total === 0) {
    return {
      period,
      label: PERIOD_PROGRESS_LABELS[period],
      completed: 0,
      total: 0,
      percent: 0,
      segments: [],
    };
  }

  const groups = new Map<GoalCategory | null, Goal[]>();

  for (const goal of periodGoals) {
    const existing = groups.get(goal.category) ?? [];
    existing.push(goal);
    groups.set(goal.category, existing);
  }

  const segments: PeriodProgressSegment[] = [...groups.keys()]
    .sort(sortCategories)
    .map((category) => {
      const categoryGoals = groups.get(category) ?? [];
      const categoryTotal = categoryGoals.length;
      const categoryCompleted = categoryGoals.filter((goal) =>
        isGoalMet(goal, now, period),
      ).length;
      const categoryCompletionTotal = categoryGoals.reduce(
        (sum, goal) => sum + getGoalCompletionRatio(goal, now, period),
        0,
      );
      const colors = getGoalCategoryColors(category);

      return {
        categoryKey: category ?? "uncategorized",
        color: colors.icon,
        widthPercent: (categoryTotal / total) * 100,
        fillPercent:
          categoryTotal > 0
            ? (categoryCompletionTotal / categoryTotal) * 100
            : 0,
        completed: categoryCompleted,
        total: categoryTotal,
      };
    });

  return {
    period,
    label: PERIOD_PROGRESS_LABELS[period],
    completed,
    total,
    percent,
    segments,
  };
};

export const formatGoalsCompletedLabel = (
  completed: number,
  total: number,
): string => {
  if (total === 0) {
    return "No goals set";
  }

  const goalLabel = total === 1 ? "goal" : "goals";
  return `${completed} of ${total} ${goalLabel} completed`;
};
