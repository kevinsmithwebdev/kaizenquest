"use server";

import { revalidatePath } from "next/cache";

import { createServerApiClient } from "@/lib/api";
import { routes } from "@/lib/navigation";
import { mapGoalFromApi } from "@/lib/goals/map-goal-from-api";
import {
  addGoalEventSchema,
  requireCurrentUser,
  type AddGoalEventInput,
} from "@/lib/goals";
import { getFirstZodIssueMessage } from "@kaizen/shared-utils";
import { ApiError } from "@kaizen/shared-api-client";

import type { GoalMutationResult } from "./goal.types";

export async function addGoalEvent(
  input: AddGoalEventInput,
): Promise<GoalMutationResult> {
  try {
    await requireCurrentUser();
    const occurredAt =
      input.occurredAt instanceof Date
        ? input.occurredAt.toISOString()
        : (input.occurredAt ?? new Date().toISOString());

    const parsed = addGoalEventSchema.safeParse({
      ...input,
      occurredAt,
    });

    if (!parsed.success) {
      // Domain schema coerces Date; try wire format via contracts path
      return {
        error: getFirstZodIssueMessage(parsed.error),
        goal: null,
      };
    }

    const { goalId, ...event } = parsed.data;
    const api = createServerApiClient();
    const wireEvent = {
      ...event,
      occurredAt:
        event.occurredAt instanceof Date
          ? event.occurredAt.toISOString()
          : String(event.occurredAt),
    };
    const updated = await api.addGoalEvent(goalId, wireEvent);
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
