import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getCurrentUser: vi.fn(),
  prisma: {
    goal: {
      findFirst: vi.fn(),
      update: vi.fn(),
    },
  },
}));

vi.mock("@/lib/auth", () => ({
  getCurrentUser: mocks.getCurrentUser,
}));

vi.mock("@/lib/prisma", () => ({
  prisma: mocks.prisma,
}));

import { updateGoal } from "./update-goal";

const authUser = {
  id: "user-1",
  name: "Test User",
  email: "test@example.com",
  emailVerifiedAt: new Date("2026-01-01T00:00:00.000Z"),
  createdAt: new Date("2026-01-01T00:00:00.000Z"),
  updatedAt: new Date("2026-01-01T00:00:00.000Z"),
};

const existingOccuranceGoal = {
  id: "goal-1",
  userId: "user-1",
  name: "Meditate",
  description: "Daily practice",
  period: "WEEK" as const,
  type: "OCCURANCE" as const,
  targetOccurrences: 5,
  targetDuration: null,
  createdAt: new Date("2026-06-29T00:00:00.000Z"),
  updatedAt: new Date("2026-06-29T00:00:00.000Z"),
};

describe("updateGoal", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getCurrentUser.mockResolvedValue(authUser);
    mocks.prisma.goal.findFirst
      .mockResolvedValueOnce(existingOccuranceGoal)
      .mockResolvedValueOnce({
        ...existingOccuranceGoal,
        name: "Meditate more",
        targetOccurrences: 7,
        events: [],
      });
    mocks.prisma.goal.update.mockResolvedValue({});
  });

  it("returns not found when the goal does not belong to the user", async () => {
    mocks.prisma.goal.findFirst.mockReset();
    mocks.prisma.goal.findFirst.mockResolvedValue(null);

    const result = await updateGoal({
      id: "goal-1",
      name: "Meditate more",
      description: "",
      period: "WEEK",
      target: 7,
    });

    expect(result).toEqual({ error: "Goal not found", goal: null });
    expect(mocks.prisma.goal.update).not.toHaveBeenCalled();
  });

  it("returns a validation error when target does not match goal type", async () => {
    mocks.prisma.goal.findFirst.mockReset();
    mocks.prisma.goal.findFirst.mockResolvedValue(existingOccuranceGoal);

    const result = await updateGoal({
      id: "goal-1",
      name: "Meditate more",
      description: "",
      period: "WEEK",
      target: "PT2H",
    });

    expect(result.error).toBeTruthy();
    expect(result.goal).toBeNull();
    expect(mocks.prisma.goal.update).not.toHaveBeenCalled();
  });

  it("updates an OCCURANCE goal", async () => {
    const result = await updateGoal({
      id: "goal-1",
      name: "Meditate more",
      description: "Updated",
      period: "MONTH",
      target: 7,
    });

    expect(mocks.prisma.goal.update).toHaveBeenCalledWith({
      where: { id: "goal-1" },
      data: {
        name: "Meditate more",
        description: "Updated",
        period: "MONTH",
        targetOccurrences: 7,
        targetDuration: null,
      },
    });
    expect(result.error).toBeNull();
    expect(result.goal).toMatchObject({
      id: "goal-1",
      name: "Meditate more",
      type: "OCCURANCE",
      target: 7,
      history: [],
    });
  });

  it("returns unauthorized when there is no current user", async () => {
    mocks.getCurrentUser.mockResolvedValue(null);

    const result = await updateGoal({
      id: "goal-1",
      name: "Meditate more",
      description: "",
      period: "WEEK",
      target: 7,
    });

    expect(result).toEqual({ error: "Unauthorized", goal: null });
  });
});
