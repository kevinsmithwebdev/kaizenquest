import { describe, expect, it } from "vitest";

import type { Goal } from "../goals/goal.types";

import {
  addMonths,
  buildCalendarMonth,
  formatCalendarMonthLabel,
  getMonthRef,
} from "./calendar";

const createGoal = (history: Goal["history"]): Goal => ({
  id: "goal-1",
  userId: "user-1",
  name: "Meditate",
  description: "",
  category: "spiritual",
  period: "DAY",
  type: "OCCURANCE",
  target: 1,
  createdAt: new Date("2026-06-01T00:00:00.000Z"),
  updatedAt: new Date("2026-06-01T00:00:00.000Z"),
  history,
});

describe("getMonthRef", () => {
  it("returns the year and zero-based month for a date", () => {
    expect(getMonthRef(new Date("2026-07-02T12:00:00"))).toEqual({
      year: 2026,
      month: 6,
    });
  });
});

describe("addMonths", () => {
  it("moves across year boundaries", () => {
    expect(addMonths({ year: 2026, month: 11 }, 1)).toEqual({
      year: 2027,
      month: 0,
    });
    expect(addMonths({ year: 2026, month: 0 }, -1)).toEqual({
      year: 2025,
      month: 11,
    });
  });
});

describe("formatCalendarMonthLabel", () => {
  it("formats the visible month and year", () => {
    expect(formatCalendarMonthLabel({ year: 2024, month: 4 })).toBe("May 2024");
  });
});

describe("buildCalendarMonth", () => {
  it("starts the grid on Monday and includes leading and trailing days", () => {
    const days = buildCalendarMonth(
      { year: 2024, month: 4 },
      [],
      new Date("2024-05-10T12:00:00"),
    );

    expect(days).toHaveLength(35);
    expect(days[0]?.date.getDate()).toBe(29);
    expect(days[0]?.date.getMonth()).toBe(3);
    expect(days[11]?.date.getDate()).toBe(10);
    expect(days[11]?.isToday).toBe(true);
    expect(days[34]?.date.getDate()).toBe(2);
    expect(days[34]?.date.getMonth()).toBe(5);
  });

  it("marks event counts for each visible day", () => {
    const goals = [
      createGoal([
        {
          id: "event-1",
          type: "OCCURANCE",
          occurrences: 1,
          occurredAt: new Date("2024-05-10T08:00:00"),
        },
        {
          id: "event-2",
          type: "OCCURANCE",
          occurrences: 1,
          occurredAt: new Date("2024-05-10T18:00:00"),
        },
        {
          id: "event-3",
          type: "OCCURANCE",
          occurrences: 1,
          occurredAt: new Date("2024-05-15T08:00:00"),
        },
      ]),
    ];

    const days = buildCalendarMonth(
      { year: 2024, month: 4 },
      goals,
      new Date("2024-05-10T12:00:00"),
    );

    expect(days.find((day) => day.date.getDate() === 10)?.eventCount).toBe(2);
    expect(days.find((day) => day.date.getDate() === 15)?.isFuture).toBe(true);
    expect(days.find((day) => day.date.getDate() === 15)?.eventCount).toBe(0);
    expect(days.find((day) => day.date.getDate() === 11)?.eventCount).toBe(0);
  });

  it("marks days after today as future", () => {
    const days = buildCalendarMonth(
      { year: 2024, month: 4 },
      [],
      new Date("2024-05-10T12:00:00"),
    );

    expect(days.find((day) => day.date.getDate() === 10)?.isFuture).toBe(false);
    expect(days.find((day) => day.date.getDate() === 11)?.isFuture).toBe(true);
    expect(
      days.find((day) => day.date.getDate() === 2 && day.date.getMonth() === 5)
        ?.isFuture,
    ).toBe(true);
  });
});
