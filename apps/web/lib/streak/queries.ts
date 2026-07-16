import { listGoalsForUser } from "@/lib/goals/queries";

import { computeUserStreak } from "./streak";
import type { UserStreak } from "./streak.types";

export const getStreakForUser = async (userId: string): Promise<UserStreak> => {
  const goals = await listGoalsForUser(userId);
  return computeUserStreak(goals);
};
