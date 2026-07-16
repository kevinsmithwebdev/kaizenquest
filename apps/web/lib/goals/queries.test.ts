import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  createGoal: vi.fn(),
  updateGoal: vi.fn(),
  deleteGoal: vi.fn(),
  addGoalEvent: vi.fn(),
  listGoals: vi.fn(),
}));

vi.mock("@/lib/api", () => ({
  createServerApiClient: () => ({
    createGoal: mocks.createGoal,
    updateGoal: mocks.updateGoal,
    deleteGoal: mocks.deleteGoal,
    addGoalEvent: mocks.addGoalEvent,
    listGoals: mocks.listGoals,
  }),
}));

import { getGoalForUser, listGoalsForUser } from "./queries";

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
      occurrences: 1,
      occurredAt: "2026-06-29T12:00:00.000Z",
    },
  ],
};

describe("listGoalsForUser", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  beforeEach(() => {
    vi.clearAllMocks();
    mocks.listGoals.mockResolvedValue([apiOccuranceGoal]);
  });

  it("returns mapped goals with history for the user", async () => {
    const goals = await listGoalsForUser("user-1");

    expect(mocks.listGoals).toHaveBeenCalledWith();
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
    expect(goals[0]?.createdAt).toEqual(new Date("2026-06-29T00:00:00.000Z"));
    expect(goals[0]?.history[0]?.occurredAt).toEqual(
      new Date("2026-06-29T12:00:00.000Z"),
    );
  });
});

describe("getGoalForUser", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  beforeEach(() => {
    vi.clearAllMocks();
    mocks.listGoals.mockResolvedValue([apiOccuranceGoal]);
  });

  it("returns null when the goal is not in the listed goals", async () => {
    mocks.listGoals.mockResolvedValue([]);

    const goal = await getGoalForUser("user-2", "goal-1");

    expect(goal).toBeNull();
    expect(mocks.listGoals).toHaveBeenCalledWith();
  });

  it("returns a mapped goal when found", async () => {
    const goal = await getGoalForUser("user-1", "goal-1");

    expect(goal).toMatchObject({
      id: "goal-1",
      userId: "user-1",
      type: "OCCURANCE",
      target: 5,
    });
  });
});
