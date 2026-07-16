import { describe, expect, it } from "vitest";

import { mapGoalFromPrisma } from "./map-goal";

const basePrismaGoal = {
  id: "goal-1",
  userId: "user-1",
  name: "Meditate",
  description: "Daily practice",
  period: "WEEK" as const,
  category: null,
  createdAt: new Date("2026-06-29T00:00:00.000Z"),
  updatedAt: new Date("2026-06-29T00:00:00.000Z"),
};

describe("mapGoalFromPrisma", () => {
  it("maps an OCCURANCE goal with events", () => {
    const goal = mapGoalFromPrisma(
      {
        ...basePrismaGoal,
        type: "OCCURANCE",
        targetOccurrences: 5,
        targetDuration: null,
        targetAmount: null,
      },
      [
        {
          id: "event-1",
          goalId: "goal-1",
          type: "OCCURANCE",
          occurrences: 2,
          duration: null,
          amount: null,
          occurredAt: new Date("2026-06-30T00:00:00.000Z"),
        },
      ],
    );

    expect(goal).toMatchObject({
      id: "goal-1",
      type: "OCCURANCE",
      target: 5,
      history: [
        {
          id: "event-1",
          type: "OCCURANCE",
          occurrences: 2,
        },
      ],
    });
  });

  it("maps a TIME goal", () => {
    const goal = mapGoalFromPrisma(
      {
        ...basePrismaGoal,
        type: "TIME",
        targetOccurrences: null,
        targetDuration: "PT2H",
        targetAmount: null,
      },
      [],
    );

    expect(goal).toMatchObject({
      type: "TIME",
      target: "PT2H",
      history: [],
    });
  });

  it("maps an AMOUNT goal", () => {
    const goal = mapGoalFromPrisma(
      {
        ...basePrismaGoal,
        type: "AMOUNT",
        targetOccurrences: null,
        targetDuration: null,
        targetAmount: 12.5,
      },
      [],
    );

    expect(goal).toMatchObject({
      type: "AMOUNT",
      target: 12.5,
      history: [],
    });
  });

  it("throws when an OCCURANCE goal has no targetOccurrences", () => {
    expect(() =>
      mapGoalFromPrisma(
        {
          ...basePrismaGoal,
          type: "OCCURANCE",
          targetOccurrences: null,
          targetDuration: null,
          targetAmount: null,
        },
        [],
      ),
    ).toThrow("Goal goal-1 is OCCURANCE but has no targetOccurrences");
  });

  it("throws when an OCCURANCE event has no occurrences", () => {
    expect(() =>
      mapGoalFromPrisma(
        {
          ...basePrismaGoal,
          type: "OCCURANCE",
          targetOccurrences: 5,
          targetDuration: null,
          targetAmount: null,
        },
        [
          {
            id: "event-1",
            goalId: "goal-1",
            type: "OCCURANCE",
            occurrences: null,
            duration: null,
            amount: null,
            occurredAt: new Date("2026-06-30T00:00:00.000Z"),
          },
        ],
      ),
    ).toThrow("Goal event event-1 is OCCURANCE but has no occurrences");
  });
});
