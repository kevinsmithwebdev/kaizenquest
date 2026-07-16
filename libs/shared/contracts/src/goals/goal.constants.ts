export const GOAL_PERIODS = ["DAY", "WEEK", "MONTH"] as const;
export const GOAL_TYPES = ["OCCURANCE", "TIME", "AMOUNT"] as const;

export const GOAL_CATEGORIES = [
  "health",
  "spiritual",
  "learning",
  "creative",
  "work",
  "productivity",
  "financial",
  "social",
  "hobby",
  "charity",
] as const;

export type GoalPeriod = (typeof GOAL_PERIODS)[number];
export type GoalType = (typeof GOAL_TYPES)[number];
export type GoalCategory = (typeof GOAL_CATEGORIES)[number];
