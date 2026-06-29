import { NextResponse } from "next/server";

import type { Goal } from "@/lib/goals";
import { listGoalsForUser, requireCurrentUser } from "@/lib/goals";

const serializeGoal = (goal: Goal) => ({
  ...goal,
  createdAt: goal.createdAt.toISOString(),
  updatedAt: goal.updatedAt.toISOString(),
  history: goal.history.map((event) => ({
    ...event,
    occurredAt: event.occurredAt.toISOString(),
  })),
});

export async function GET() {
  try {
    const user = await requireCurrentUser();
    const goals = await listGoalsForUser(user.id);

    return NextResponse.json({
      goals: goals.map(serializeGoal),
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    throw error;
  }
}
