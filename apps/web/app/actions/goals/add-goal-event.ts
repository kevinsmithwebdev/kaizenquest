"use server";

import { revalidatePath } from "next/cache";

import { isUnauthorizedError } from "@/lib/auth";
import { routes } from "@/lib/navigation";
import { prisma } from "@/lib/prisma";
import {
  addGoalEventSchema,
  goalWithEventsInclude,
  mapGoalFromPrisma,
  requireCurrentUser,
  toPrismaGoalEventCreateData,
  type AddGoalEventInput,
} from "@/lib/goals";
import { getFirstZodIssueMessage } from "@/lib/zod/get-first-zod-issue-message";

import type { GoalMutationResult } from "./goal.types";

export async function addGoalEvent(
  input: AddGoalEventInput,
): Promise<GoalMutationResult> {
  try {
    const user = await requireCurrentUser();
    const parsed = addGoalEventSchema.safeParse({
      ...input,
      occurredAt: input.occurredAt ?? new Date(),
    });

    if (!parsed.success) {
      return {
        error: getFirstZodIssueMessage(parsed.error),
        goal: null,
      };
    }

    const existing = await prisma.goal.findFirst({
      where: { id: parsed.data.goalId, userId: user.id },
    });

    if (!existing) {
      return { error: "Goal not found", goal: null };
    }

    if (parsed.data.type !== existing.type) {
      return { error: "Event type does not match goal type", goal: null };
    }

    await prisma.goalEvent.create({
      data: toPrismaGoalEventCreateData(parsed.data.goalId, parsed.data),
    });

    const updated = await prisma.goal.findFirst({
      where: { id: parsed.data.goalId, userId: user.id },
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
