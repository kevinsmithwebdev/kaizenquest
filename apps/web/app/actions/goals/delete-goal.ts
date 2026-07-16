"use server";

import { revalidatePath } from "next/cache";

import { createServerApiClient } from "@/lib/api";
import { routes } from "@/lib/navigation";
import { goalIdSchema, requireCurrentUser } from "@/lib/goals";
import { getFirstZodIssueMessage } from "@kaizen/shared-utils";
import { ApiError } from "@kaizen/shared-api-client";

import type { GoalMutationResult } from "./goal.types";

export async function deleteGoal(goalId: string): Promise<GoalMutationResult> {
  try {
    await requireCurrentUser();
    const parsed = goalIdSchema.safeParse(goalId);

    if (!parsed.success) {
      return {
        error: getFirstZodIssueMessage(parsed.error),
        goal: null,
      };
    }

    const api = createServerApiClient();
    await api.deleteGoal(parsed.data);
    revalidatePath(routes.dashboard);

    return { error: null, goal: null };
  } catch (error) {
    if (error instanceof ApiError) {
      return { error: error.message, goal: null };
    }
    throw error;
  }
}
