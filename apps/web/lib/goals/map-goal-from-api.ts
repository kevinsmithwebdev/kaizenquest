import type { Goal, GoalEvent } from "@kaizen/domain-goals";

type ApiGoalEvent = {
  id: string;
  type: GoalEvent["type"];
  occurrences?: number;
  duration?: string;
  amount?: number;
  occurredAt: string;
};

type ApiGoal = {
  id: string;
  userId: string;
  name: string;
  description: string;
  category: Goal["category"];
  period: Goal["period"];
  type: Goal["type"];
  target: number | string;
  createdAt: string;
  updatedAt: string;
  history: ApiGoalEvent[];
};

const mapEvent = (event: ApiGoalEvent): GoalEvent => {
  const occurredAt = new Date(event.occurredAt);
  if (event.type === "OCCURANCE") {
    return {
      id: event.id,
      type: "OCCURANCE",
      occurrences: event.occurrences!,
      occurredAt,
    };
  }
  if (event.type === "TIME") {
    return {
      id: event.id,
      type: "TIME",
      duration: event.duration!,
      occurredAt,
    };
  }
  return {
    id: event.id,
    type: "AMOUNT",
    amount: event.amount!,
    occurredAt,
  };
};

export const mapGoalFromApi = (goal: ApiGoal): Goal => {
  const base = {
    id: goal.id,
    userId: goal.userId,
    name: goal.name,
    description: goal.description,
    category: goal.category,
    period: goal.period,
    createdAt: new Date(goal.createdAt),
    updatedAt: new Date(goal.updatedAt),
    history: goal.history.map(mapEvent),
  };

  if (goal.type === "OCCURANCE") {
    return { ...base, type: "OCCURANCE", target: goal.target as number };
  }
  if (goal.type === "TIME") {
    return { ...base, type: "TIME", target: goal.target as string };
  }
  return { ...base, type: "AMOUNT", target: goal.target as number };
};
