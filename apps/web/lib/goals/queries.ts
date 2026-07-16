import { createServerApiClient } from "@/lib/api";
import type { Goal } from "@kaizen/domain-goals";

import { mapGoalFromApi } from "./map-goal-from-api";

export const listGoalsForUser = async (_userId: string): Promise<Goal[]> => {
  const api = createServerApiClient();
  const goals = (await api.listGoals()) as Parameters<
    typeof mapGoalFromApi
  >[0][];
  return goals.map(mapGoalFromApi);
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
