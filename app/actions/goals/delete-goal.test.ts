import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getCurrentUser: vi.fn(),
  prisma: {
    goal: {
      deleteMany: vi.fn(),
    },
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

describe("deleteGoal", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getCurrentUser.mockResolvedValue(authUser);
    mocks.prisma.goal.deleteMany.mockResolvedValue({ count: 1 });
  });

  it("returns not found when the goal does not exist for the user", async () => {
    mocks.prisma.goal.deleteMany.mockResolvedValue({ count: 0 });

    const result = await deleteGoal("goal-1");

    expect(result).toEqual({ error: "Goal not found", goal: null });
    expect(mocks.prisma.goal.deleteMany).toHaveBeenCalledWith({
      where: { id: "goal-1", userId: "user-1" },
    });
  });

  it("deletes a goal owned by the current user", async () => {
    const result = await deleteGoal("goal-1");

    expect(mocks.prisma.goal.deleteMany).toHaveBeenCalledWith({
      where: { id: "goal-1", userId: "user-1" },
    });
    expect(result).toEqual({ error: null, goal: null });
  });

  it("returns unauthorized when there is no current user", async () => {
    mocks.getCurrentUser.mockResolvedValue(null);

    const result = await deleteGoal("goal-1");

    expect(result).toEqual({ error: "Unauthorized", goal: null });
    expect(mocks.prisma.goal.deleteMany).not.toHaveBeenCalled();
  });

  it("returns a validation error for an empty goal id", async () => {
    const result = await deleteGoal("   ");

    expect(result.error).toBe("Goal ID is required");
    expect(result.goal).toBeNull();
    expect(mocks.prisma.goal.deleteMany).not.toHaveBeenCalled();
  });
});
