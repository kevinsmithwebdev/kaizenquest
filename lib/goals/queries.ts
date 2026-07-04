import { prisma } from "@/lib/prisma";

import { mapGoalFromPrisma } from "./map-goal";
import type { Goal } from "./goal.types";

export const goalWithEventsInclude = {
  events: {
    orderBy: {
      occurredAt: "desc" as const,
    },
  },
};

export const listGoalsForUser = async (userId: string): Promise<Goal[]> => {
  const goals = await prisma.goal.findMany({
    where: { userId },
    include: goalWithEventsInclude,
    orderBy: { updatedAt: "desc" },
  });

  return goals.map((goal) => mapGoalFromPrisma(goal, goal.events));
};

export const getGoalForUser = async (
  goalId: string,
  userId: string,
): Promise<Goal | null> => {
  const goal = await prisma.goal.findFirst({
    where: { id: goalId, userId },
    include: goalWithEventsInclude,
  });

  if (!goal) {
    return null;
  }

  return mapGoalFromPrisma(goal, goal.events);
};
