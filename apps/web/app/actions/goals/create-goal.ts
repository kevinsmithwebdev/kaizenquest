"use server";

import { revalidatePath } from "next/cache";

import { createServerApiClient } from "@/lib/api";
import { routes } from "@/lib/navigation";
import { mapGoalFromApi } from "@/lib/goals/map-goal-from-api";
import {
  createGoalSchema,
  requireCurrentUser,
  type CreateGoalInput,
} from "@/lib/goals";
import { getFirstZodIssueMessage } from "@kaizen/shared-utils";
import { ApiError } from "@kaizen/shared-api-client";

import type { GoalMutationResult } from "./goal.types";

export async function createGoal(
  input: CreateGoalInput,
): Promise<GoalMutationResult> {
  try {
    await requireCurrentUser();
    const parsed = createGoalSchema.safeParse(input);

    if (!parsed.success) {
      return {
        error: getFirstZodIssueMessage(parsed.error),
        goal: null,
      };
    }

    const api = createServerApiClient();
    const created = await api.createGoal(parsed.data);
    revalidatePath(routes.dashboard);

    return {
      error: null,
      goal: mapGoalFromApi(created as never),
    };
  } catch (error) {
    if (error instanceof ApiError) {
      return { error: error.message, goal: null };
    }
    throw error;
  }
}
