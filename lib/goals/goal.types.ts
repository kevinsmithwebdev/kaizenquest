import type { GoalCategory } from "./goal-categories";
import type { GOAL_PERIODS, GOAL_TYPES } from "./goal.constants";

export type GoalPeriod = (typeof GOAL_PERIODS)[number];
export type GoalType = (typeof GOAL_TYPES)[number];

export type GoalEvent =
  | { id: string; type: "OCCURANCE"; occurrences: number; occurredAt: Date }
  | { id: string; type: "TIME"; duration: string; occurredAt: Date };

type GoalBase = {
  id: string;
  userId: string;
  name: string;
  description: string;
  category: GoalCategory | null;
  period: GoalPeriod;
  createdAt: Date;
  updatedAt: Date;
  history: GoalEvent[];
};

export type Goal =
  | (GoalBase & { type: "OCCURANCE"; target: number })
  | (GoalBase & { type: "TIME"; target: string });
