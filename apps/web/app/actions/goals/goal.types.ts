import type { Goal } from "@/lib/goals";

export type GoalMutationResult = {
  error: string | null;
  goal: Goal | null;
};
