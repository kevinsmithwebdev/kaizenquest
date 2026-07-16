"use server";

import { revalidatePath } from "next/cache";

import { routes } from "@/lib/navigation";
import { prisma } from "@/lib/prisma";
import { isUnauthorizedError } from "@/lib/auth";
import {
  createGoalSchema,
  mapGoalFromPrisma,
  requireCurrentUser,
  toPrismaGoalCreateData,
  type CreateGoalInput,
} from "@/lib/goals";
import { getFirstZodIssueMessage } from "@/lib/zod/get-first-zod-issue-message";

import type { GoalMutationResult } from "./goal.types";

export async function createGoal(
  input: CreateGoalInput,
): Promise<GoalMutationResult> {
  try {
    const user = await requireCurrentUser();
    const parsed = createGoalSchema.safeParse(input);

    if (!parsed.success) {
      return {
        error: getFirstZodIssueMessage(parsed.error),
        goal: null,
      };
    }

    const created = await prisma.goal.create({
      data: toPrismaGoalCreateData(user.id, parsed.data),
    });

    revalidatePath(routes.dashboard);

    return {
      error: null,
      goal: mapGoalFromPrisma(created, []),
    };
  } catch (error) {
    if (isUnauthorizedError(error)) {
      return { error: "Unauthorized", goal: null };
    }

    throw error;
  }
}
