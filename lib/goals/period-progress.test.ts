import { describe, expect, it } from "vitest";

import type { Goal } from "./goal.types";
import {
  formatGoalsCompletedLabel,
  getPeriodProgressSummary,
} from "./period-progress";

const baseGoal: Goal = {
  id: "goal-1",
  userId: "user-1",
  name: "Meditate",
  description: "",
  category: "spiritual",
  period: "DAY",
  type: "OCCURANCE",
  target: 1,
  createdAt: new Date("2026-06-29T00:00:00.000Z"),
  updatedAt: new Date("2026-06-29T00:00:00.000Z"),
  history: [],
};

const metGoal = (overrides: Partial<Goal> = {}): Goal => ({
  ...baseGoal,
  ...overrides,
  history: [
    {
      id: "event-1",
      type: "OCCURANCE",
      occurrences: 1,
      occurredAt: new Date("2026-06-29T08:00:00.000Z"),
    },
  ],
});

const unmetGoal = (overrides: Partial<Goal> = {}): Goal => ({
  ...baseGoal,
  ...overrides,
});

describe("getPeriodProgressSummary", () => {
  const now = new Date("2026-06-29T12:00:00.000Z");

  it("returns zeroed summary when no goals match the period", () => {
    const summary = getPeriodProgressSummary(
      [unmetGoal({ period: "WEEK" })],
      "MONTH",
      now,
    );

    expect(summary).toEqual({
      period: "MONTH",
      label: "This Month's Progress",
      completed: 0,
      total: 0,
      percent: 0,
      segments: [],
    });
  });

  it("includes all goals in today's summary using the day window", () => {
    const goals = [
      metGoal({ id: "g1", period: "WEEK", category: "health" }),
      unmetGoal({ id: "g2", period: "MONTH", category: "learning" }),
    ];

    const summary = getPeriodProgressSummary(goals, "DAY", now);

    expect(summary.total).toBe(2);
    expect(summary.completed).toBe(1);
    expect(summary.segments).toHaveLength(2);
  });

  it("counts completed goals and overall percent for the period", () => {
    const goals = [
      metGoal({ id: "g1", category: "health" }),
      metGoal({ id: "g2", category: "health" }),
      unmetGoal({ id: "g3", category: "learning" }),
      metGoal({ id: "g4", category: "learning", period: "WEEK" }),
    ];

    const summary = getPeriodProgressSummary(goals, "DAY", now);

    expect(summary.completed).toBe(3);
    expect(summary.total).toBe(4);
    expect(summary.percent).toBe(75);
  });

  it("reflects partial category progress in segment fill", () => {
    const goals = [
      {
        ...unmetGoal({ id: "g1", category: "learning", period: "MONTH" }),
        target: 2,
        history: [
          {
            id: "event-1",
            type: "OCCURANCE" as const,
            occurrences: 1,
            occurredAt: new Date("2026-06-29T08:00:00.000Z"),
          },
        ],
      },
    ];

    const summary = getPeriodProgressSummary(goals, "MONTH", now);

    expect(summary.completed).toBe(0);
    expect(summary.segments[0]).toMatchObject({
      categoryKey: "learning",
      fillPercent: 50,
      completed: 0,
      total: 1,
    });
  });

  it("allocates segment width by category share and fill by category completion", () => {
    const goals = [
      metGoal({ id: "g1", category: "health" }),
      unmetGoal({ id: "g2", category: "health" }),
      unmetGoal({ id: "g3", category: "learning" }),
    ];

    const summary = getPeriodProgressSummary(goals, "DAY", now);

    expect(summary.segments).toHaveLength(2);
    expect(summary.segments[0]).toMatchObject({
      categoryKey: "health",
      widthPercent: (2 / 3) * 100,
      fillPercent: 50,
      completed: 1,
      total: 2,
    });
    expect(summary.segments[1]).toMatchObject({
      categoryKey: "learning",
      widthPercent: (1 / 3) * 100,
      fillPercent: 0,
      completed: 0,
      total: 1,
    });
  });

  it("places uncategorized goals last", () => {
    const goals = [
      unmetGoal({ id: "g1", category: null }),
      metGoal({ id: "g2", category: "health" }),
    ];

    const summary = getPeriodProgressSummary(goals, "DAY", now);

    expect(summary.segments.map((segment) => segment.categoryKey)).toEqual([
      "health",
      "uncategorized",
    ]);
  });
});

describe("formatGoalsCompletedLabel", () => {
  it("uses singular goal when total is one", () => {
    expect(formatGoalsCompletedLabel(1, 1)).toBe("1 of 1 goal completed");
  });

  it("uses plural goals otherwise", () => {
    expect(formatGoalsCompletedLabel(3, 5)).toBe("3 of 5 goals completed");
  });

  it("describes empty periods without goals", () => {
    expect(formatGoalsCompletedLabel(0, 0)).toBe("No goals set");
  });
});
