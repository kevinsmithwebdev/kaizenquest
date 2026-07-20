import { createServerApiClient } from "@/lib/api";
import { mapGoalFromWire, type Goal } from "@kaizen/domain-goals";

export const listGoalsForUser = async (_userId: string): Promise<Goal[]> => {
  const api = createServerApiClient();
  const { goals } = await api.listGoals();
  return goals.map((goal) => mapGoalFromWire(goal));
};

export const getGoalForUser = async (
  userId: string,
  goalId: string,
): Promise<Goal | null> => {
  const goals = await listGoalsForUser(userId);
  return goals.find((goal) => goal.id === goalId) ?? null;
};

export const goalWithEventsInclude = {
  events: { orderBy: { occurredAt: "asc" as const } },
};
