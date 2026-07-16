import { describe, expect, it } from "vitest";

import type { Goal } from "@/lib/goals/goal.types";

import {
  computeUserStreak,
  getBestStreak,
  getCappedActivityLevel,
  getCurrentStreak,
  getEventCountOnDate,
  getWeeklyActivity,
  hasActivityOnDate,
} from "./streak";

const createGoal = (overrides: {
  id: string;
  name?: string;
  period?: Goal["period"];
  history: Goal["history"];
}): Goal => ({
  id: overrides.id,
  userId: "user-1",
  name: overrides.name ?? "Meditate",
  description: "",
  category: "spiritual",
  period: overrides.period ?? "DAY",
  type: "OCCURANCE",
  target: 1,
  createdAt: new Date("2026-06-01T00:00:00.000Z"),
  updatedAt: new Date("2026-06-01T00:00:00.000Z"),
  history: overrides.history,
});

describe("getEventCountOnDate", () => {
  it("counts every logged event on a calendar day across all goals", () => {
    const goals = [
      createGoal({
        id: "goal-1",
        history: [
          {
            id: "event-1",
            type: "OCCURANCE",
            occurrences: 1,
            occurredAt: new Date("2026-07-02T08:00:00"),
          },
          {
            id: "event-2",
            type: "OCCURANCE",
            occurrences: 1,
            occurredAt: new Date("2026-07-02T18:00:00"),
          },
        ],
      }),
      createGoal({
        id: "goal-2",
        name: "Exercise",
        period: "WEEK",
        history: [
          {
            id: "event-3",
            type: "OCCURANCE",
            occurrences: 1,
            occurredAt: new Date("2026-07-02T12:00:00"),
          },
        ],
      }),
    ];

    expect(getEventCountOnDate(goals, new Date("2026-07-02T12:00:00"))).toBe(3);
  });
});

describe("getCurrentStreak", () => {
  it("returns 0 when there is no activity", () => {
    expect(getCurrentStreak([], new Date("2026-07-02T12:00:00"))).toBe(0);
  });

  it("counts consecutive days with at least one logged event", () => {
    const goals = [
      createGoal({
        id: "goal-1",
        history: [
          {
            id: "event-1",
            type: "OCCURANCE",
            occurrences: 1,
            occurredAt: new Date("2026-07-02T08:00:00"),
          },
          {
            id: "event-2",
            type: "OCCURANCE",
            occurrences: 1,
            occurredAt: new Date("2026-07-01T08:00:00"),
          },
          {
            id: "event-3",
            type: "OCCURANCE",
            occurrences: 1,
            occurredAt: new Date("2026-06-30T08:00:00"),
          },
        ],
      }),
    ];

    expect(getCurrentStreak(goals, new Date("2026-07-02T12:00:00"))).toBe(3);
  });

  it("does not break the streak when today has no events yet", () => {
    const goals = [
      createGoal({
        id: "goal-1",
        history: [
          {
            id: "event-1",
            type: "OCCURANCE",
            occurrences: 1,
            occurredAt: new Date("2026-07-01T08:00:00"),
          },
        ],
      }),
    ];

    expect(getCurrentStreak(goals, new Date("2026-07-02T12:00:00"))).toBe(1);
  });

  it("counts a day with any logged event regardless of goal completion", () => {
    const goals = [
      createGoal({
        id: "goal-1",
        history: [
          {
            id: "event-1",
            type: "OCCURANCE",
            occurrences: 1,
            occurredAt: new Date("2026-07-02T08:00:00"),
          },
        ],
      }),
      createGoal({
        id: "goal-2",
        name: "Exercise",
        history: [],
      }),
    ];

    expect(hasActivityOnDate(goals, new Date("2026-07-02T12:00:00"))).toBe(
      true,
    );
    expect(getCurrentStreak(goals, new Date("2026-07-02T12:00:00"))).toBe(1);
  });
});

describe("getBestStreak", () => {
  it("tracks the longest historical run of active days", () => {
    const goals = [
      createGoal({
        id: "goal-1",
        history: [
          {
            id: "event-1",
            type: "OCCURANCE",
            occurrences: 1,
            occurredAt: new Date("2026-07-02T08:00:00"),
          },
          {
            id: "event-2",
            type: "OCCURANCE",
            occurrences: 1,
            occurredAt: new Date("2026-07-01T08:00:00"),
          },
          {
            id: "event-3",
            type: "OCCURANCE",
            occurrences: 1,
            occurredAt: new Date("2026-06-28T08:00:00"),
          },
          {
            id: "event-4",
            type: "OCCURANCE",
            occurrences: 1,
            occurredAt: new Date("2026-06-27T08:00:00"),
          },
          {
            id: "event-5",
            type: "OCCURANCE",
            occurrences: 1,
            occurredAt: new Date("2026-06-26T08:00:00"),
          },
        ],
      }),
    ];

    expect(getBestStreak(goals, new Date("2026-07-02T12:00:00"))).toBe(3);
  });
});

describe("getWeeklyActivity", () => {
  it("returns seven days for the current week with event counts", () => {
    const goals = [
      createGoal({
        id: "goal-1",
        history: [
          {
            id: "event-1",
            type: "OCCURANCE",
            occurrences: 1,
            occurredAt: new Date("2026-06-30T08:00:00"),
          },
        ],
      }),
      createGoal({
        id: "goal-2",
        name: "Exercise",
        history: [
          {
            id: "event-2",
            type: "OCCURANCE",
            occurrences: 1,
            occurredAt: new Date("2026-06-30T08:00:00"),
          },
        ],
      }),
    ];

    const activity = getWeeklyActivity(goals, new Date("2026-07-02T12:00:00"));

    expect(activity).toHaveLength(7);
    expect(activity.map((day) => day.dayLabel)).toEqual([
      "M",
      "T",
      "W",
      "T",
      "F",
      "S",
      "S",
    ]);
    expect(activity[1]?.eventCount).toBe(2);
    expect(activity[2]?.eventCount).toBe(0);
  });

  it("caps the visual activity scale at 10 events", () => {
    expect(getCappedActivityLevel(12)).toBe(10);
    expect(getCappedActivityLevel(4)).toBe(4);
  });
});

describe("computeUserStreak", () => {
  it("combines current streak, best streak, and weekly activity", () => {
    const goals = [
      createGoal({
        id: "goal-1",
        history: [
          {
            id: "event-1",
            type: "OCCURANCE",
            occurrences: 1,
            occurredAt: new Date("2026-07-02T08:00:00"),
          },
        ],
      }),
    ];
    const now = new Date("2026-07-02T12:00:00");

    expect(computeUserStreak(goals, now)).toEqual({
      currentStreak: 1,
      bestStreak: 1,
      weeklyActivity: getWeeklyActivity(goals, now),
    });
  });
});
