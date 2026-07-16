import { describe, expect, it } from "vitest";

import {
  addGoalEventSchema,
  createGoalSchema,
  goalSchema,
  updateGoalSchema,
} from "../index";

describe("createGoalSchema", () => {
  it("accepts an OCCURANCE goal", () => {
    const result = createGoalSchema.safeParse({
      name: "Meditate",
      description: "",
      period: "DAY",
      type: "OCCURANCE",
      target: 1,
    });

    expect(result.success).toBe(true);
  });

  it("rejects a TIME goal with an invalid duration", () => {
    const result = createGoalSchema.safeParse({
      name: "Read",
      description: "",
      period: "WEEK",
      type: "TIME",
      target: "P2H",
    });

    expect(result.success).toBe(false);
  });
});

describe("updateGoalSchema", () => {
  it("accepts a valid update", () => {
    const result = updateGoalSchema.safeParse({
      id: "goal-1",
      name: "Meditate",
      description: "",
      period: "WEEK",
      target: 5,
    });

    expect(result.success).toBe(true);
  });
});

describe("addGoalEventSchema", () => {
  it("accepts a wire-format event with ISO datetime", () => {
    const result = addGoalEventSchema.safeParse({
      goalId: "goal-1",
      type: "OCCURANCE",
      occurrences: 1,
      occurredAt: "2026-06-29T12:00:00.000Z",
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(typeof result.data.occurredAt).toBe("string");
    }
  });

  it("rejects an event without goalId", () => {
    const result = addGoalEventSchema.safeParse({
      type: "OCCURANCE",
      occurrences: 1,
      occurredAt: "2026-06-29T12:00:00.000Z",
    });

    expect(result.success).toBe(false);
  });
});

describe("goalSchema", () => {
  it("accepts a full goal response DTO", () => {
    const result = goalSchema.safeParse({
      id: "goal-1",
      userId: "user-1",
      name: "Meditate",
      description: "",
      category: "spiritual",
      period: "WEEK",
      type: "OCCURANCE",
      target: 5,
      createdAt: "2026-06-29T00:00:00.000Z",
      updatedAt: "2026-06-29T00:00:00.000Z",
      history: [
        {
          id: "event-1",
          type: "OCCURANCE",
          occurrences: 1,
          occurredAt: "2026-06-29T12:00:00.000Z",
        },
      ],
    });

    expect(result.success).toBe(true);
  });
});
