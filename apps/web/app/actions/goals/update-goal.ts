"use server";

import { revalidatePath } from "next/cache";

import { createServerApiClient } from "@/lib/api";
import { routes } from "@/lib/navigation";
import { mapGoalFromApi } from "@/lib/goals/map-goal-from-api";
import {
  requireCurrentUser,
  updateGoalSchema,
  type UpdateGoalInput,
} from "@/lib/goals";
import { getFirstZodIssueMessage } from "@kaizen/shared-utils";
import { ApiError } from "@kaizen/shared-api-client";

import type { GoalMutationResult } from "./goal.types";

export async function updateGoal(
  input: UpdateGoalInput,
): Promise<GoalMutationResult> {
  try {
    await requireCurrentUser();
    const parsed = updateGoalSchema.safeParse(input);

    if (!parsed.success) {
      return {
        error: getFirstZodIssueMessage(parsed.error),
        goal: null,
      };
    }

    const api = createServerApiClient();
    const updated = await api.updateGoal(parsed.data.id, parsed.data);
    revalidatePath(routes.dashboard);

    return {
      error: null,
      goal: mapGoalFromApi(updated as never),
    };
  } catch (error) {
    if (error instanceof ApiError) {
      return { error: error.message, goal: null };
    }
    throw error;
  }
}
