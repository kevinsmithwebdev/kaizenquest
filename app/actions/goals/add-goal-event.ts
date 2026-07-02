"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";
import {
  addGoalEventSchema,
  mapGoalFromPrisma,
  requireCurrentUser,
  toPrismaGoalEventCreateData,
  type AddGoalEventInput,
} from "@/lib/goals";

import type { GoalMutationResult } from "./goal.types";

const goalWithEventsInclude = {
  events: {
    orderBy: {
      occurredAt: "desc" as const,
    },
  },
};

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
        error: parsed.error.issues[0]?.message ?? "Invalid input",
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

    revalidatePath("/dashboard");

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
