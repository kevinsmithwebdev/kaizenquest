export {
  GOAL_PERIODS,
  GOAL_TYPES,
  type GoalPeriod,
  type GoalType,
} from "@kaizen/shared-contracts";

export const GOAL_TYPE_LABELS = {
  OCCURANCE: "Occurrences",
  TIME: "Time",
  AMOUNT: "Amount",
} as const satisfies Record<
  import("@kaizen/shared-contracts").GoalType,
  string
>;
