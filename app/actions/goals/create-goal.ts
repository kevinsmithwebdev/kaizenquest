"use server";

import { prisma } from "@/lib/prisma";
import {
  createGoalSchema,
  mapGoalFromPrisma,
  requireCurrentUser,
  toPrismaGoalCreateData,
  type CreateGoalInput,
} from "@/lib/goals";

import type { GoalMutationResult } from "./goal.types";

export async function createGoal(
  input: CreateGoalInput,
): Promise<GoalMutationResult> {
  try {
    const user = await requireCurrentUser();
    const parsed = createGoalSchema.safeParse(input);

    if (!parsed.success) {
      return {
        error: parsed.error.issues[0]?.message ?? "Invalid input",
        goal: null,
      };
    }

    const created = await prisma.goal.create({
      data: toPrismaGoalCreateData(user.id, parsed.data),
    });

    return {
      error: null,
      goal: mapGoalFromPrisma(created, []),
    };
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return { error: "Unauthorized", goal: null };
    }

    throw error;
  }
}
