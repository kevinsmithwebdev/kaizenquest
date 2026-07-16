import { describe, expect, it } from "vitest";

import {
  toPrismaGoalCreateData,
  toPrismaGoalEventCreateData,
  toPrismaGoalUpdateData,
} from "./to-prisma-goal";

describe("toPrismaGoalCreateData", () => {
  it("maps an OCCURANCE goal", () => {
    expect(
      toPrismaGoalCreateData("user-1", {
        name: "Meditate",
        description: "",
        period: "WEEK",
        type: "OCCURANCE",
        target: 5,
      }),
    ).toEqual({
      user: { connect: { id: "user-1" } },
      name: "Meditate",
      description: "",
      category: null,
      period: "WEEK",
      type: "OCCURANCE",
      targetOccurrences: 5,
      targetDuration: null,
      targetAmount: null,
    });
  });

  it("maps a TIME goal", () => {
    expect(
      toPrismaGoalCreateData("user-1", {
        name: "Read",
        description: "",
        period: "MONTH",
        type: "TIME",
        target: "PT2H",
      }),
    ).toEqual({
      user: { connect: { id: "user-1" } },
      name: "Read",
      description: "",
      category: null,
      period: "MONTH",
      type: "TIME",
      targetOccurrences: null,
      targetDuration: "PT2H",
      targetAmount: null,
    });
  });

  it("maps an AMOUNT goal", () => {
    expect(
      toPrismaGoalCreateData("user-1", {
        name: "Save",
        description: "",
        period: "MONTH",
        type: "AMOUNT",
        target: 100,
      }),
    ).toEqual({
      user: { connect: { id: "user-1" } },
      name: "Save",
      description: "",
      category: null,
      period: "MONTH",
      type: "AMOUNT",
      targetOccurrences: null,
      targetDuration: null,
      targetAmount: 100,
    });
  });
});

describe("toPrismaGoalUpdateData", () => {
  it("maps an OCCURANCE update", () => {
    expect(
      toPrismaGoalUpdateData(
        {
          id: "goal-1",
          name: "Meditate",
          description: "",
          period: "WEEK",
          target: 7,
        },
        "OCCURANCE",
      ),
    ).toEqual({
      name: "Meditate",
      description: "",
      period: "WEEK",
      targetOccurrences: 7,
      targetDuration: null,
      targetAmount: null,
    });
  });
});

describe("toPrismaGoalEventCreateData", () => {
  it("maps an OCCURANCE event", () => {
    expect(
      toPrismaGoalEventCreateData("goal-1", {
        type: "OCCURANCE",
        occurrences: 2,
        occurredAt: new Date("2026-06-30T00:00:00.000Z"),
      }),
    ).toEqual({
      goal: { connect: { id: "goal-1" } },
      type: "OCCURANCE",
      occurredAt: new Date("2026-06-30T00:00:00.000Z"),
      occurrences: 2,
      duration: null,
      amount: null,
    });
  });

  it("maps a TIME event", () => {
    expect(
      toPrismaGoalEventCreateData("goal-1", {
        type: "TIME",
        duration: "PT1H",
        occurredAt: new Date("2026-06-30T00:00:00.000Z"),
      }),
    ).toEqual({
      goal: { connect: { id: "goal-1" } },
      type: "TIME",
      occurredAt: new Date("2026-06-30T00:00:00.000Z"),
      occurrences: null,
      duration: "PT1H",
      amount: null,
    });
  });
});
