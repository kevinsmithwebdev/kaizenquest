"use server";

import { revalidatePath } from "next/cache";

import { isUnauthorizedError } from "@/lib/auth";
import { routes } from "@/lib/navigation";
import { prisma } from "@/lib/prisma";
import { goalIdSchema, requireCurrentUser } from "@/lib/goals";
import { getFirstZodIssueMessage } from "@/lib/zod/get-first-zod-issue-message";

import type { GoalMutationResult } from "./goal.types";

export async function deleteGoal(goalId: string): Promise<GoalMutationResult> {
  try {
    const user = await requireCurrentUser();
    const parsed = goalIdSchema.safeParse(goalId);

    if (!parsed.success) {
      return {
        error: getFirstZodIssueMessage(parsed.error),
        goal: null,
      };
    }

    const existing = await prisma.goal.findFirst({
      where: { id: parsed.data, userId: user.id },
    });

    if (!existing) {
      return { error: "Goal not found", goal: null };
    }

    await prisma.$transaction([
      prisma.goalEvent.deleteMany({ where: { goalId: parsed.data } }),
      prisma.goal.delete({ where: { id: parsed.data } }),
    ]);

    revalidatePath(routes.dashboard);

    return { error: null, goal: null };
  } catch (error) {
    if (isUnauthorizedError(error)) {
      return { error: "Unauthorized", goal: null };
    }

    throw error;
  }
}
