"use server";

import { revalidatePath } from "next/cache";

import { isUnauthorizedError } from "@/lib/auth";
import { routes } from "@/lib/navigation";
import { prisma } from "@/lib/prisma";
import {
  goalWithEventsInclude,
  mapGoalFromPrisma,
  requireCurrentUser,
  toPrismaGoalUpdateData,
  updateGoalSchema,
  validateGoalTarget,
  type UpdateGoalInput,
} from "@/lib/goals";
import { getFirstZodIssueMessage } from "@kaizen/shared-utils";

import type { GoalMutationResult } from "./goal.types";

export async function updateGoal(
  input: UpdateGoalInput,
): Promise<GoalMutationResult> {
  try {
    const user = await requireCurrentUser();
    const parsed = updateGoalSchema.safeParse(input);

    if (!parsed.success) {
      return {
        error: getFirstZodIssueMessage(parsed.error),
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
        error: getFirstZodIssueMessage(targetParsed.error, "Invalid target"),
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

    revalidatePath(routes.dashboard);

    return {
      error: null,
      goal: mapGoalFromPrisma(updated, updated.events),
    };
  } catch (error) {
    if (isUnauthorizedError(error)) {
      return { error: "Unauthorized", goal: null };
    }

    throw error;
  }
}
