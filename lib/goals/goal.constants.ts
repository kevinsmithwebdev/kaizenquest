export const GOAL_PERIODS = ["DAY", "WEEK", "MONTH"] as const;
export const GOAL_TYPES = ["OCCURANCE", "TIME", "AMOUNT"] as const;

export const GOAL_TYPE_LABELS = {
  OCCURANCE: "Occurrences",
  TIME: "Time",
  AMOUNT: "Amount",
} as const satisfies Record<(typeof GOAL_TYPES)[number], string>;
