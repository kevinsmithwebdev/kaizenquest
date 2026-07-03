import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getCurrentUser: vi.fn(),
  prisma: {
    goal: {
      findFirst: vi.fn(),
      delete: vi.fn(),
    },
    goalEvent: {
      deleteMany: vi.fn(),
    },
    $transaction: vi.fn(),
  },
}));

vi.mock("@/lib/auth", () => ({
  getCurrentUser: mocks.getCurrentUser,
}));

vi.mock("@/lib/prisma", () => ({
  prisma: mocks.prisma,
}));

import { deleteGoal } from "./delete-goal";

const authUser = {
  id: "user-1",
  name: "Test User",
  email: "test@example.com",
  emailVerifiedAt: new Date("2026-01-01T00:00:00.000Z"),
  createdAt: new Date("2026-01-01T00:00:00.000Z"),
  updatedAt: new Date("2026-01-01T00:00:00.000Z"),
};

const existingGoal = {
  id: "goal-1",
  userId: "user-1",
  name: "Meditate",
  description: "",
  period: "WEEK" as const,
  type: "OCCURANCE" as const,
  targetOccurrences: 5,
  targetDuration: null,
  targetAmount: null,
  category: null,
  createdAt: new Date("2026-06-29T00:00:00.000Z"),
  updatedAt: new Date("2026-06-29T00:00:00.000Z"),
};

describe("deleteGoal", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getCurrentUser.mockResolvedValue(authUser);
    mocks.prisma.goal.findFirst.mockResolvedValue(existingGoal);
    mocks.prisma.goalEvent.deleteMany.mockResolvedValue({ count: 2 });
    mocks.prisma.goal.delete.mockResolvedValue(existingGoal);
    mocks.prisma.$transaction.mockImplementation((operations) =>
      Promise.all(operations),
    );
  });

  it("returns not found when the goal does not exist for the user", async () => {
    mocks.prisma.goal.findFirst.mockResolvedValue(null);

    const result = await deleteGoal("goal-1");

    expect(result).toEqual({ error: "Goal not found", goal: null });
    expect(mocks.prisma.$transaction).not.toHaveBeenCalled();
  });

  it("deletes a goal and its events for the current user", async () => {
    const result = await deleteGoal("goal-1");

    expect(mocks.prisma.goalEvent.deleteMany).toHaveBeenCalledWith({
      where: { goalId: "goal-1" },
    });
    expect(mocks.prisma.goal.delete).toHaveBeenCalledWith({
      where: { id: "goal-1" },
    });
    expect(mocks.prisma.$transaction).toHaveBeenCalledTimes(1);
    expect(result).toEqual({ error: null, goal: null });
  });

  it("returns unauthorized when there is no current user", async () => {
    mocks.getCurrentUser.mockResolvedValue(null);

    const result = await deleteGoal("goal-1");

    expect(result).toEqual({ error: "Unauthorized", goal: null });
    expect(mocks.prisma.$transaction).not.toHaveBeenCalled();
  });

  it("returns a validation error for an empty goal id", async () => {
    const result = await deleteGoal("   ");

    expect(result.error).toBe("Goal ID is required");
    expect(result.goal).toBeNull();
    expect(mocks.prisma.$transaction).not.toHaveBeenCalled();
  });
});
