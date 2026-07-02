import { describe, expect, it } from "vitest";

import {
  createGoalSchema,
  goalEventSchema,
  updateGoalSchema,
} from "./goal.schemas";
import { isIso8601Duration } from "./iso-duration";

describe("isIso8601Duration", () => {
  it("accepts valid ISO 8601 durations", () => {
    expect(isIso8601Duration("PT2H")).toBe(true);
    expect(isIso8601Duration("PT30M")).toBe(true);
    expect(isIso8601Duration("P1D")).toBe(true);
    expect(isIso8601Duration("P1DT2H30M")).toBe(true);
  });

  it("rejects invalid duration strings", () => {
    expect(isIso8601Duration("P2H")).toBe(false);
    expect(isIso8601Duration("2 hours")).toBe(false);
    expect(isIso8601Duration("P")).toBe(false);
    expect(isIso8601Duration("")).toBe(false);
  });
});

describe("createGoalSchema", () => {
  it("accepts a DAY goal", () => {
    const result = createGoalSchema.safeParse({
      name: "Meditate",
      description: "",
      period: "DAY",
      type: "OCCURANCE",
      target: 1,
    });

    expect(result.success).toBe(true);
  });

  it("accepts a learning category", () => {
    const result = createGoalSchema.safeParse({
      name: "Read",
      description: "",
      category: "learning",
      period: "MONTH",
      type: "OCCURANCE",
      target: 2,
    });

    expect(result.success).toBe(true);
  });

  it("rejects a legacy category slug", () => {
    const result = createGoalSchema.safeParse({
      name: "Run",
      description: "",
      category: "fitness",
      period: "WEEK",
      type: "OCCURANCE",
      target: 3,
    });

    expect(result.success).toBe(false);
  });

  it("accepts an OCCURANCE goal with a category", () => {
    const result = createGoalSchema.safeParse({
      name: "Meditate",
      description: "Daily practice",
      category: "spiritual",
      period: "WEEK",
      type: "OCCURANCE",
      target: 5,
    });

    expect(result.success).toBe(true);
  });

  it("rejects an invalid category", () => {
    const result = createGoalSchema.safeParse({
      name: "Meditate",
      description: "",
      category: "invalid",
      period: "WEEK",
      type: "OCCURANCE",
      target: 5,
    });

    expect(result.success).toBe(false);
  });

  it("accepts a null category", () => {
    const result = createGoalSchema.safeParse({
      name: "Meditate",
      description: "",
      category: null,
      period: "WEEK",
      type: "OCCURANCE",
      target: 5,
    });

    expect(result.success).toBe(true);
  });

  it("accepts an OCCURANCE goal", () => {
    const result = createGoalSchema.safeParse({
      name: "Meditate",
      description: "Daily practice",
      period: "WEEK",
      type: "OCCURANCE",
      target: 5,
    });

    expect(result.success).toBe(true);
  });

  it("accepts a TIME goal", () => {
    const result = createGoalSchema.safeParse({
      name: "Read",
      description: "",
      period: "MONTH",
      type: "TIME",
      target: "PT2H",
    });

    expect(result.success).toBe(true);
  });

  it("accepts an AMOUNT goal", () => {
    const result = createGoalSchema.safeParse({
      name: "Save",
      description: "",
      period: "MONTH",
      type: "AMOUNT",
      target: 500.5,
    });

    expect(result.success).toBe(true);
  });

  it("rejects an AMOUNT goal with a non-positive target", () => {
    const result = createGoalSchema.safeParse({
      name: "Save",
      description: "",
      period: "MONTH",
      type: "AMOUNT",
      target: 0,
    });

    expect(result.success).toBe(false);
  });

  it("rejects a TIME goal with an invalid duration", () => {
    const result = createGoalSchema.safeParse({
      name: "Read",
      description: "",
      period: "MONTH",
      type: "TIME",
      target: "P2H",
    });

    expect(result.success).toBe(false);
  });

  it("rejects an OCCURANCE goal with a non-positive target", () => {
    const result = createGoalSchema.safeParse({
      name: "Meditate",
      description: "",
      period: "WEEK",
      type: "OCCURANCE",
      target: 0,
    });

    expect(result.success).toBe(false);
  });

  it("rejects a goal without a name", () => {
    const result = createGoalSchema.safeParse({
      name: "   ",
      description: "",
      period: "WEEK",
      type: "OCCURANCE",
      target: 3,
    });

    expect(result.success).toBe(false);
  });
});

describe("updateGoalSchema", () => {
  it("accepts valid update input with an integer target", () => {
    const result = updateGoalSchema.safeParse({
      id: "goal-1",
      name: "Meditate",
      description: "Updated",
      period: "WEEK",
      target: 7,
    });

    expect(result.success).toBe(true);
  });

  it("accepts valid update input with a duration target", () => {
    const result = updateGoalSchema.safeParse({
      id: "goal-1",
      name: "Read",
      description: "",
      period: "MONTH",
      target: "PT2H",
    });

    expect(result.success).toBe(true);
  });

  it("accepts valid update input with a float target", () => {
    const result = updateGoalSchema.safeParse({
      id: "goal-1",
      name: "Save",
      description: "",
      period: "MONTH",
      target: 250.75,
    });

    expect(result.success).toBe(true);
  });

  it("rejects update input without an id", () => {
    const result = updateGoalSchema.safeParse({
      id: "   ",
      name: "Read",
      description: "",
      period: "MONTH",
      target: "PT2H",
    });

    expect(result.success).toBe(false);
  });
});

describe("goalEventSchema", () => {
  it("accepts an OCCURANCE event", () => {
    const result = goalEventSchema.safeParse({
      type: "OCCURANCE",
      occurrences: 1,
      occurredAt: "2026-06-29T12:00:00.000Z",
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.occurredAt).toBeInstanceOf(Date);
    }
  });

  it("accepts a TIME event", () => {
    const result = goalEventSchema.safeParse({
      type: "TIME",
      duration: "PT45M",
      occurredAt: "2026-06-29T12:00:00.000Z",
    });

    expect(result.success).toBe(true);
  });

  it("accepts an AMOUNT event", () => {
    const result = goalEventSchema.safeParse({
      type: "AMOUNT",
      amount: 12.5,
      occurredAt: "2026-06-29T12:00:00.000Z",
    });

    expect(result.success).toBe(true);
  });

  it("rejects a TIME event with an invalid duration", () => {
    const result = goalEventSchema.safeParse({
      type: "TIME",
      duration: "45 minutes",
      occurredAt: "2026-06-29T12:00:00.000Z",
    });

    expect(result.success).toBe(false);
  });
});
