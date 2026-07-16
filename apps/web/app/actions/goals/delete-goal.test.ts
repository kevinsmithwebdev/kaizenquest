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

import { deleteGoal } from "./delete-goal";

const authUser = mockUser;

describe("deleteGoal", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getCurrentUser.mockResolvedValue(authUser);
    mocks.deleteGoal.mockResolvedValue(undefined);
  });

  it("returns not found when the API reports the goal is missing", async () => {
    mocks.deleteGoal.mockRejectedValue(new ApiError("Goal not found", 404));

    const result = await deleteGoal("goal-1");

    expect(result).toEqual({ error: "Goal not found", goal: null });
  });

  it("deletes a goal for the current user", async () => {
    const result = await deleteGoal("goal-1");

    expect(mocks.deleteGoal).toHaveBeenCalledWith("goal-1");
    expect(result).toEqual({ error: null, goal: null });
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/dashboard");
  });

  it("throws unauthorized when there is no current user", async () => {
    mocks.getCurrentUser.mockResolvedValue(null);

    await expect(deleteGoal("goal-1")).rejects.toThrow(UnauthorizedError);
    expect(mocks.deleteGoal).not.toHaveBeenCalled();
  });

  it("returns a validation error for an empty goal id", async () => {
    const result = await deleteGoal("   ");

    expect(result.error).toBe("Goal ID is required");
    expect(result.goal).toBeNull();
    expect(mocks.deleteGoal).not.toHaveBeenCalled();
  });
});
