import { listGoalsForUser } from "@/lib/goals/queries";

import { computeUserStreak, type UserStreak } from "@kaizen/domain-goals";

export const getStreakForUser = async (userId: string): Promise<UserStreak> => {
  const goals = await listGoalsForUser(userId);
  return computeUserStreak(goals);
};
