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

vi.mock("next/cache", () => ({
  revalidatePath: mocks.revalidatePath,
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

import { ApiError } from "@kaizen/shared-api-client";

import { mockUser } from "@/lib/auth/test-helpers";
import { UnauthorizedError } from "@/lib/auth";

import { updateGoal } from "./update-goal";

const authUser = mockUser;

const apiUpdatedGoal = {
  id: "goal-1",
  userId: "user-1",
  name: "Meditate more",
  description: "Updated",
  period: "MONTH" as const,
  type: "OCCURANCE" as const,
  target: 7,
  category: null,
  createdAt: "2026-06-29T00:00:00.000Z",
  updatedAt: "2026-06-29T00:00:00.000Z",
  history: [],
};

describe("updateGoal", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getCurrentUser.mockResolvedValue(authUser);
    mocks.updateGoal.mockResolvedValue(apiUpdatedGoal);
  });

  it("returns not found when the API reports the goal is missing", async () => {
    mocks.updateGoal.mockRejectedValue(new ApiError("Goal not found", 404));

    const result = await updateGoal({
      id: "goal-1",
      name: "Meditate more",
      description: "",
      period: "WEEK",
      target: 7,
    });

    expect(result).toEqual({ error: "Goal not found", goal: null });
  });

  it("returns an API error when the update fails", async () => {
    mocks.updateGoal.mockRejectedValue(
      new ApiError("Target does not match goal type", 400),
    );

    const result = await updateGoal({
      id: "goal-1",
      name: "Meditate more",
      description: "",
      period: "WEEK",
      target: "PT2H",
    });

    expect(result).toEqual({
      error: "Target does not match goal type",
      goal: null,
    });
  });

  it("updates an OCCURANCE goal", async () => {
    const result = await updateGoal({
      id: "goal-1",
      name: "Meditate more",
      description: "Updated",
      period: "MONTH",
      target: 7,
    });

    expect(mocks.updateGoal).toHaveBeenCalledWith("goal-1", {
      id: "goal-1",
      name: "Meditate more",
      description: "Updated",
      period: "MONTH",
      target: 7,
    });
    expect(result.error).toBeNull();
    expect(result.goal).toMatchObject({
      id: "goal-1",
      name: "Meditate more",
      type: "OCCURANCE",
      target: 7,
      history: [],
    });
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/dashboard");
  });

  it("throws unauthorized when there is no current user", async () => {
    mocks.getCurrentUser.mockResolvedValue(null);

    await expect(
      updateGoal({
        id: "goal-1",
        name: "Meditate more",
        description: "",
        period: "WEEK",
        target: 7,
      }),
    ).rejects.toThrow(UnauthorizedError);
    expect(mocks.updateGoal).not.toHaveBeenCalled();
  });
});
