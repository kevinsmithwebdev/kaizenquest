import type {
  Goal as WireGoal,
  GoalEvent as WireGoalEvent,
} from "@kaizen/shared-contracts";

import type { Goal, GoalEvent } from "./goal.types";

const mapGoalEventFromWire = (event: WireGoalEvent): GoalEvent => {
  const occurredAt = new Date(event.occurredAt);

  if (event.type === "OCCURANCE") {
    return {
      id: event.id,
      type: "OCCURANCE",
      occurrences: event.occurrences,
      occurredAt,
    };
  }

  if (event.type === "TIME") {
    return {
      id: event.id,
      type: "TIME",
      duration: event.duration,
      occurredAt,
    };
  }

  return {
    id: event.id,
    type: "AMOUNT",
    amount: event.amount,
    occurredAt,
  };
};

export const mapGoalFromWire = (goal: WireGoal): Goal => {
  const base = {
    id: goal.id,
    userId: goal.userId,
    name: goal.name,
    description: goal.description,
    category: goal.category,
    period: goal.period,
    createdAt: new Date(goal.createdAt),
    updatedAt: new Date(goal.updatedAt),
    history: goal.history.map(mapGoalEventFromWire),
  };

  if (goal.type === "OCCURANCE") {
    return { ...base, type: "OCCURANCE", target: goal.target };
  }

  if (goal.type === "TIME") {
    return { ...base, type: "TIME", target: goal.target };
  }

  return { ...base, type: "AMOUNT", target: goal.target };
};
