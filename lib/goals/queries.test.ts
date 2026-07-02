import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  prisma: {
    goal: {
      findMany: vi.fn(),
      findFirst: vi.fn(),
    },
  },
}));

vi.mock("@/lib/prisma", () => ({
  prisma: mocks.prisma,
}));

import { getGoalForUser, listGoalsForUser } from "./queries";

const prismaOccuranceGoal = {
  id: "goal-1",
  userId: "user-1",
  name: "Meditate",
  description: "Daily practice",
  period: "WEEK" as const,
  type: "OCCURANCE" as const,
  targetOccurrences: 5,
  targetDuration: null,
  category: null,
  createdAt: new Date("2026-06-29T00:00:00.000Z"),
  updatedAt: new Date("2026-06-29T00:00:00.000Z"),
  events: [
    {
      id: "event-1",
      goalId: "goal-1",
      type: "OCCURANCE" as const,
      occurrences: 1,
      duration: null,
      occurredAt: new Date("2026-06-29T12:00:00.000Z"),
    },
  ],
};

describe("listGoalsForUser", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  beforeEach(() => {
    vi.clearAllMocks();
    mocks.prisma.goal.findMany.mockResolvedValue([prismaOccuranceGoal]);
  });

  it("returns mapped goals with history for the user", async () => {
    const goals = await listGoalsForUser("user-1");

    expect(mocks.prisma.goal.findMany).toHaveBeenCalledWith({
      where: { userId: "user-1" },
      include: {
        events: {
          orderBy: { occurredAt: "desc" },
        },
      },
      orderBy: { updatedAt: "desc" },
    });
    expect(goals).toHaveLength(1);
    expect(goals[0]).toMatchObject({
      id: "goal-1",
      type: "OCCURANCE",
      target: 5,
      history: [
        {
          id: "event-1",
          type: "OCCURANCE",
          occurrences: 1,
        },
      ],
    });
  });
});

describe("getGoalForUser", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  beforeEach(() => {
    vi.clearAllMocks();
    mocks.prisma.goal.findFirst.mockResolvedValue(prismaOccuranceGoal);
  });

  it("returns null when the goal is not owned by the user", async () => {
    mocks.prisma.goal.findFirst.mockResolvedValue(null);

    const goal = await getGoalForUser("goal-1", "user-2");

    expect(goal).toBeNull();
    expect(mocks.prisma.goal.findFirst).toHaveBeenCalledWith({
      where: { id: "goal-1", userId: "user-2" },
      include: {
        events: {
          orderBy: { occurredAt: "desc" },
        },
      },
    });
  });

  it("returns a mapped goal when found", async () => {
    const goal = await getGoalForUser("goal-1", "user-1");

    expect(goal).toMatchObject({
      id: "goal-1",
      userId: "user-1",
      type: "OCCURANCE",
      target: 5,
    });
  });
});
