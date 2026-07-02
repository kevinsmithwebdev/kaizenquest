import { describe, expect, it } from "vitest";

import { getGoalPeriodLabel, getGoalTargetDisplay } from "./goal-display";
import type { Goal } from "./goal.types";

const weekOccuranceGoal: Goal = {
  id: "goal-1",
  userId: "user-1",
  name: "Meditate",
  description: "",
  category: "spiritual",
  period: "WEEK",
  type: "OCCURANCE",
  target: 5,
  createdAt: new Date(),
  updatedAt: new Date(),
  history: [],
};

describe("getGoalPeriodLabel", () => {
  it("returns period-specific labels", () => {
    expect(getGoalPeriodLabel("DAY")).toBe("today");
    expect(getGoalPeriodLabel("WEEK")).toBe("this week");
    expect(getGoalPeriodLabel("MONTH")).toBe("this month");
  });
});

describe("getGoalTargetDisplay", () => {
  it("uses the goal period for the label", () => {
    expect(getGoalTargetDisplay(weekOccuranceGoal)).toEqual({
      value: "5 times",
      label: "this week",
    });

    expect(
      getGoalTargetDisplay({
        ...weekOccuranceGoal,
        period: "DAY",
        target: 1,
      }),
    ).toEqual({
      value: "1 time",
      label: "today",
    });

    expect(
      getGoalTargetDisplay({
        ...weekOccuranceGoal,
        period: "MONTH",
        type: "TIME",
        target: "PT2H",
      }),
    ).toEqual({
      value: "2 hr",
      label: "this month",
    });

    expect(
      getGoalTargetDisplay({
        ...weekOccuranceGoal,
        period: "MONTH",
        type: "AMOUNT",
        target: 500,
      }),
    ).toEqual({
      value: "500",
      label: "this month",
    });
  });
});
