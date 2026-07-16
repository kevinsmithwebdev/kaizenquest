import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getCurrentUser: vi.fn(),
  revalidatePath: vi.fn(),
  createGoal: vi.fn(),
  updateGoal: vi.fn(),
  deleteGoal: vi.fn(),
  addGoalEvent: vi.fn(),
  listGoals: vi.fn(),
}));

vi.mock("@/lib/auth", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/auth")>();
  return {
    ...actual,
    getCurrentUser: mocks.getCurrentUser,
  };
});

vi.mock("@/lib/api", () => ({
  createServerApiClient: () => ({
    createGoal: mocks.createGoal,
    updateGoal: mocks.updateGoal,
    deleteGoal: mocks.deleteGoal,
    addGoalEvent: mocks.addGoalEvent,
    listGoals: mocks.listGoals,
  }),
}));

vi.mock("next/cache", () => ({
  revalidatePath: mocks.revalidatePath,
}));

import { ApiError } from "@kaizen/shared-api-client";

import { mockUser } from "@/lib/auth/test-helpers";
import { UnauthorizedError } from "@/lib/auth";

import { addGoalEvent } from "./add-goal-event";

const authUser = mockUser;

const apiOccuranceGoal = {
  id: "goal-1",
  userId: "user-1",
  name: "Meditate",
  description: "Daily practice",
  period: "WEEK" as const,
  type: "OCCURANCE" as const,
  target: 5,
  category: null,
  createdAt: "2026-06-29T00:00:00.000Z",
  updatedAt: "2026-06-29T00:00:00.000Z",
  history: [
    {
      id: "event-1",
      type: "OCCURANCE" as const,
      occurrences: 2,
      occurredAt: "2026-06-29T12:00:00.000Z",
    },
  ],
};

describe("addGoalEvent", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getCurrentUser.mockResolvedValue(authUser);
    mocks.addGoalEvent.mockResolvedValue(apiOccuranceGoal);
  });

  it("returns a validation error for invalid input", async () => {
    const result = await addGoalEvent({
      goalId: "goal-1",
      type: "OCCURANCE",
      occurrences: 0,
      occurredAt: new Date("2026-06-29T12:00:00.000Z"),
    });

    expect(result.error).toBeTruthy();
    expect(result.goal).toBeNull();
    expect(mocks.addGoalEvent).not.toHaveBeenCalled();
  });

  it("throws unauthorized when there is no current user", async () => {
    mocks.getCurrentUser.mockResolvedValue(null);

    await expect(
      addGoalEvent({
        goalId: "goal-1",
        type: "OCCURANCE",
        occurrences: 1,
        occurredAt: new Date("2026-06-29T12:00:00.000Z"),
      }),
    ).rejects.toThrow(UnauthorizedError);
    expect(mocks.addGoalEvent).not.toHaveBeenCalled();
  });

  it("returns not found when the API reports the goal is missing", async () => {
    mocks.addGoalEvent.mockRejectedValue(new ApiError("Goal not found", 404));

    const result = await addGoalEvent({
      goalId: "missing-goal",
      type: "OCCURANCE",
      occurrences: 1,
      occurredAt: new Date("2026-06-29T12:00:00.000Z"),
    });

    expect(result).toEqual({ error: "Goal not found", goal: null });
  });

  it("returns an error when the event type does not match the goal type", async () => {
    mocks.addGoalEvent.mockRejectedValue(
      new ApiError("Event type does not match goal type", 400),
    );

    const result = await addGoalEvent({
      goalId: "goal-1",
      type: "TIME",
      duration: "PT30M",
      occurredAt: new Date("2026-06-29T12:00:00.000Z"),
    });

    expect(result).toEqual({
      error: "Event type does not match goal type",
      goal: null,
    });
  });

  it("creates an OCCURANCE event and returns the updated goal", async () => {
    const occurredAt = new Date("2026-06-29T12:00:00.000Z");

    const result = await addGoalEvent({
      goalId: "goal-1",
      type: "OCCURANCE",
      occurrences: 2,
      occurredAt,
    });

    expect(mocks.addGoalEvent).toHaveBeenCalledWith("goal-1", {
      type: "OCCURANCE",
      occurrences: 2,
      occurredAt: occurredAt.toISOString(),
    });
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/dashboard");
    expect(result.error).toBeNull();
    expect(result.goal).toMatchObject({
      id: "goal-1",
      type: "OCCURANCE",
      history: [
        {
          id: "event-1",
          type: "OCCURANCE",
          occurrences: 2,
        },
      ],
    });
    expect(result.goal?.history[0]?.occurredAt).toEqual(occurredAt);
  });
});
