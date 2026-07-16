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

import { mockUser } from "@/lib/auth/test-helpers";
import { UnauthorizedError } from "@/lib/auth";

import { createGoal } from "./create-goal";

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
  history: [],
};

describe("createGoal", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getCurrentUser.mockResolvedValue(authUser);
    mocks.createGoal.mockResolvedValue(apiOccuranceGoal);
  });

  it("returns a validation error for invalid input", async () => {
    const result = await createGoal({
      name: "",
      description: "",
      period: "WEEK",
      type: "OCCURANCE",
      target: 5,
    });

    expect(result).toEqual({ error: "Name is required", goal: null });
    expect(mocks.createGoal).not.toHaveBeenCalled();
  });

  it("throws unauthorized when there is no current user", async () => {
    mocks.getCurrentUser.mockResolvedValue(null);

    await expect(
      createGoal({
        name: "Meditate",
        description: "",
        period: "WEEK",
        type: "OCCURANCE",
        target: 5,
      }),
    ).rejects.toThrow(UnauthorizedError);
    expect(mocks.createGoal).not.toHaveBeenCalled();
  });

  it("creates an OCCURANCE goal", async () => {
    const result = await createGoal({
      name: "Meditate",
      description: "Daily practice",
      period: "WEEK",
      type: "OCCURANCE",
      target: 5,
    });

    expect(mocks.createGoal).toHaveBeenCalledWith({
      name: "Meditate",
      description: "Daily practice",
      period: "WEEK",
      type: "OCCURANCE",
      target: 5,
    });
    expect(result.error).toBeNull();
    expect(result.goal).toMatchObject({
      id: "goal-1",
      userId: "user-1",
      type: "OCCURANCE",
      target: 5,
      history: [],
    });
    expect(result.goal?.createdAt).toEqual(
      new Date("2026-06-29T00:00:00.000Z"),
    );
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/dashboard");
  });

  it("creates a TIME goal", async () => {
    mocks.createGoal.mockResolvedValue({
      ...apiOccuranceGoal,
      id: "goal-2",
      type: "TIME",
      target: "PT2H",
    });

    const result = await createGoal({
      name: "Read",
      description: "",
      period: "MONTH",
      type: "TIME",
      target: "PT2H",
    });

    expect(mocks.createGoal).toHaveBeenCalledWith({
      name: "Read",
      description: "",
      period: "MONTH",
      type: "TIME",
      target: "PT2H",
    });
    expect(result.error).toBeNull();
    expect(result.goal).toMatchObject({
      id: "goal-2",
      type: "TIME",
      target: "PT2H",
      history: [],
    });
  });
});
