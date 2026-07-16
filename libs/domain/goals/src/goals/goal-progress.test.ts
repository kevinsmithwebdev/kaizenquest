import { describe, expect, it } from "vitest";

import type { Goal } from "./goal.types";
import { getGoalProgressInPeriod, isGoalMet } from "./goal-progress";

const dayGoal: Goal = {
  id: "goal-1",
  userId: "user-1",
  name: "Meditate",
  description: "",
  category: "spiritual",
  period: "DAY",
  type: "OCCURANCE",
  target: 2,
  createdAt: new Date("2026-06-29T00:00:00.000Z"),
  updatedAt: new Date("2026-06-29T00:00:00.000Z"),
  history: [
    {
      id: "event-1",
      type: "OCCURANCE",
      occurrences: 1,
      occurredAt: new Date("2026-06-29T08:00:00.000Z"),
    },
    {
      id: "event-2",
      type: "OCCURANCE",
      occurrences: 1,
      occurredAt: new Date("2026-06-28T20:00:00.000Z"),
    },
  ],
};

describe("getGoalProgressInPeriod", () => {
  it("counts only events from the current day for DAY goals", () => {
    const now = new Date("2026-06-29T12:00:00.000Z");

    expect(getGoalProgressInPeriod(dayGoal, now)).toBe(1);
  });

  it("marks a DAY goal met when today's progress reaches the target", () => {
    const now = new Date("2026-06-29T12:00:00.000Z");

    expect(
      isGoalMet(
        {
          ...dayGoal,
          history: [
            ...dayGoal.history,
            {
              id: "event-3",
              type: "OCCURANCE",
              occurrences: 1,
              occurredAt: new Date("2026-06-29T18:00:00.000Z"),
            },
          ],
        },
        now,
      ),
    ).toBe(true);
  });

  it("sums AMOUNT events in the current period", () => {
    const amountGoal: Goal = {
      ...dayGoal,
      type: "AMOUNT",
      target: 100,
      history: [
        {
          id: "event-1",
          type: "AMOUNT",
          amount: 25.5,
          occurredAt: new Date("2026-06-29T08:00:00.000Z"),
        },
        {
          id: "event-2",
          type: "AMOUNT",
          amount: 10,
          occurredAt: new Date("2026-06-28T20:00:00.000Z"),
        },
      ],
    };
    const now = new Date("2026-06-29T12:00:00.000Z");

    expect(getGoalProgressInPeriod(amountGoal, now)).toBe(25.5);
  });
});
