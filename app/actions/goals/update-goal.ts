"use server";

import { prisma } from "@/lib/prisma";
import {
  mapGoalFromPrisma,
  requireCurrentUser,
  toPrismaGoalUpdateData,
  updateGoalSchema,
  validateGoalTarget,
  type UpdateGoalInput,
} from "@/lib/goals";

import type { GoalMutationResult } from "./goal.types";

const goalWithEventsInclude = {
  events: {
    orderBy: {
      occurredAt: "desc" as const,
    },
  },
};

export async function updateGoal(
  input: UpdateGoalInput,
): Promise<GoalMutationResult> {
  try {
    const user = await requireCurrentUser();
    const parsed = updateGoalSchema.safeParse(input);

    if (!parsed.success) {
      return {
        error: parsed.error.issues[0]?.message ?? "Invalid input",
        goal: null,
      };
    }

    const existing = await prisma.goal.findFirst({
      where: { id: parsed.data.id, userId: user.id },
    });

    if (!existing) {
      return { error: "Goal not found", goal: null };
    }

    const targetParsed = validateGoalTarget(existing.type, parsed.data.target);

    if (!targetParsed.success) {
      return {
        error: targetParsed.error.issues[0]?.message ?? "Invalid target",
        goal: null,
      };
    }

    await prisma.goal.update({
      where: { id: parsed.data.id },
      data: toPrismaGoalUpdateData(
        { ...parsed.data, target: targetParsed.data },
        existing.type,
      ),
    });

    const updated = await prisma.goal.findFirst({
      where: { id: parsed.data.id, userId: user.id },
      include: goalWithEventsInclude,
    });

    if (!updated) {
      return { error: "Goal not found", goal: null };
    }

    return {
      error: null,
      goal: mapGoalFromPrisma(updated, updated.events),
    };
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return { error: "Unauthorized", goal: null };
    }

    throw error;
  }
}
