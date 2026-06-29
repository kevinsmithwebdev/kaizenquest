"use server";

import { prisma } from "@/lib/prisma";
import { goalIdSchema, requireCurrentUser } from "@/lib/goals";

import type { GoalMutationResult } from "./goal.types";

export async function deleteGoal(goalId: string): Promise<GoalMutationResult> {
  try {
    const user = await requireCurrentUser();
    const parsed = goalIdSchema.safeParse(goalId);

    if (!parsed.success) {
      return {
        error: parsed.error.issues[0]?.message ?? "Invalid input",
        goal: null,
      };
    }

    const result = await prisma.goal.deleteMany({
      where: { id: parsed.data, userId: user.id },
    });

    if (result.count === 0) {
      return { error: "Goal not found", goal: null };
    }

    return { error: null, goal: null };
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return { error: "Unauthorized", goal: null };
    }

    throw error;
  }
}
