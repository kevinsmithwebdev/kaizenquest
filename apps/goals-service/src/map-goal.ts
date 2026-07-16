import type {
  Goal as ApiGoal,
  GoalEvent as ApiGoalEvent,
} from "@kaizen/shared-contracts";
import { matchGoalType, normalizeGoalCategory } from "@kaizen/domain-goals";

import type {
  Goal as PrismaGoal,
  GoalEvent as PrismaGoalEvent,
} from "./generated/prisma/client";

const mapGoalEventFromPrisma = (event: PrismaGoalEvent): ApiGoalEvent =>
  matchGoalType<ApiGoalEvent>(event.type, {
    OCCURANCE: () => {
      if (event.occurrences === null) {
        throw new Error(
          `Goal event ${event.id} is OCCURANCE but has no occurrences`,
        );
      }

      return {
        id: event.id,
        type: "OCCURANCE",
        occurrences: event.occurrences,
        occurredAt: event.occurredAt.toISOString(),
      };
    },
    TIME: () => {
      if (event.duration === null) {
        throw new Error(`Goal event ${event.id} is TIME but has no duration`);
      }

      return {
        id: event.id,
        type: "TIME",
        duration: event.duration,
        occurredAt: event.occurredAt.toISOString(),
      };
    },
    AMOUNT: () => {
      if (event.amount === null) {
        throw new Error(`Goal event ${event.id} is AMOUNT but has no amount`);
      }

      return {
        id: event.id,
        type: "AMOUNT",
        amount: event.amount,
        occurredAt: event.occurredAt.toISOString(),
      };
    },
  });

export const mapGoalFromPrisma = (
  goal: PrismaGoal,
  events: PrismaGoalEvent[],
): ApiGoal => {
  const history = events.map(mapGoalEventFromPrisma);
  const base = {
    id: goal.id,
    userId: goal.userId,
    name: goal.name,
    description: goal.description,
    category: normalizeGoalCategory(goal.category),
    period: goal.period,
    createdAt: goal.createdAt.toISOString(),
    updatedAt: goal.updatedAt.toISOString(),
    history,
  };

  return matchGoalType<ApiGoal>(goal.type, {
    OCCURANCE: () => {
      if (goal.targetOccurrences === null) {
        throw new Error(
          `Goal ${goal.id} is OCCURANCE but has no targetOccurrences`,
        );
      }

      return {
        ...base,
        type: "OCCURANCE",
        target: goal.targetOccurrences,
      };
    },
    TIME: () => {
      if (goal.targetDuration === null) {
        throw new Error(`Goal ${goal.id} is TIME but has no targetDuration`);
      }

      return {
        ...base,
        type: "TIME",
        target: goal.targetDuration,
      };
    },
    AMOUNT: () => {
      if (goal.targetAmount === null) {
        throw new Error(`Goal ${goal.id} is AMOUNT but has no targetAmount`);
      }

      return {
        ...base,
        type: "AMOUNT",
        target: goal.targetAmount,
      };
    },
  });
};
