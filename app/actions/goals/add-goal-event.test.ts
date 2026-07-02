import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getCurrentUser: vi.fn(),
  revalidatePath: vi.fn(),
  prisma: {
    goal: {
      findFirst: vi.fn(),
    },
    goalEvent: {
      create: vi.fn(),
    },
  },
}));

vi.mock("@/lib/auth", () => ({
  getCurrentUser: mocks.getCurrentUser,
}));

vi.mock("@/lib/prisma", () => ({
  prisma: mocks.prisma,
}));

vi.mock("next/cache", () => ({
  revalidatePath: mocks.revalidatePath,
}));

import { addGoalEvent } from "./add-goal-event";

const authUser = {
  id: "user-1",
  name: "Test User",
  email: "test@example.com",
  emailVerifiedAt: new Date("2026-01-01T00:00:00.000Z"),
  createdAt: new Date("2026-01-01T00:00:00.000Z"),
  updatedAt: new Date("2026-01-01T00:00:00.000Z"),
};

const prismaOccuranceGoal = {
  id: "goal-1",
  userId: "user-1",
  name: "Meditate",
  description: "Daily practice",
  period: "WEEK" as const,
  type: "OCCURANCE" as const,
  targetOccurrences: 5,
  targetDuration: null,
  targetAmount: null,
  category: null,
  createdAt: new Date("2026-06-29T00:00:00.000Z"),
  updatedAt: new Date("2026-06-29T00:00:00.000Z"),
  events: [
    {
      id: "event-1",
      goalId: "goal-1",
      type: "OCCURANCE" as const,
      occurrences: 2,
      duration: null,
      amount: null,
      occurredAt: new Date("2026-06-29T12:00:00.000Z"),
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
    mocks.prisma.goal.findFirst
      .mockResolvedValueOnce(prismaOccuranceGoal)
      .mockResolvedValueOnce(prismaOccuranceGoal);
    mocks.prisma.goalEvent.create.mockResolvedValue(
      prismaOccuranceGoal.events[0],
    );
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
    expect(mocks.prisma.goalEvent.create).not.toHaveBeenCalled();
  });

  it("returns unauthorized when there is no current user", async () => {
    mocks.getCurrentUser.mockResolvedValue(null);

    const result = await addGoalEvent({
      goalId: "goal-1",
      type: "OCCURANCE",
      occurrences: 1,
      occurredAt: new Date("2026-06-29T12:00:00.000Z"),
    });

    expect(result).toEqual({ error: "Unauthorized", goal: null });
    expect(mocks.prisma.goalEvent.create).not.toHaveBeenCalled();
  });

  it("returns not found when the goal does not exist", async () => {
    mocks.prisma.goal.findFirst.mockReset();
    mocks.prisma.goal.findFirst.mockResolvedValue(null);

    const result = await addGoalEvent({
      goalId: "missing-goal",
      type: "OCCURANCE",
      occurrences: 1,
      occurredAt: new Date("2026-06-29T12:00:00.000Z"),
    });

    expect(result).toEqual({ error: "Goal not found", goal: null });
    expect(mocks.prisma.goalEvent.create).not.toHaveBeenCalled();
  });

  it("returns an error when the event type does not match the goal type", async () => {
    mocks.prisma.goal.findFirst.mockReset();
    mocks.prisma.goal.findFirst.mockResolvedValue(prismaOccuranceGoal);

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
    expect(mocks.prisma.goalEvent.create).not.toHaveBeenCalled();
  });

  it("creates an OCCURANCE event and returns the updated goal", async () => {
    const occurredAt = new Date("2026-06-29T12:00:00.000Z");

    const result = await addGoalEvent({
      goalId: "goal-1",
      type: "OCCURANCE",
      occurrences: 2,
      occurredAt,
    });

    expect(mocks.prisma.goalEvent.create).toHaveBeenCalledWith({
      data: {
        goal: { connect: { id: "goal-1" } },
        type: "OCCURANCE",
        occurredAt,
        occurrences: 2,
        duration: null,
        amount: null,
      },
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
  });
});
