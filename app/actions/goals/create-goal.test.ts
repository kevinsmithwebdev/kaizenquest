import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getCurrentUser: vi.fn(),
  prisma: {
    goal: {
      create: vi.fn(),
    },
  },
}));

vi.mock("@/lib/auth", () => ({
  getCurrentUser: mocks.getCurrentUser,
}));

vi.mock("@/lib/prisma", () => ({
  prisma: mocks.prisma,
}));

import { createGoal } from "./create-goal";

const authUser = {
  id: "user-1",
  name: "Test User",
  email: "test@example.com",
  emailVerifiedAt: new Date("2026-01-01T00:00:00.000Z"),
  createdAt: new Date("2026-01-01T00:00:00.000Z"),
  updatedAt: new Date("2026-01-01T00:00:00.000Z"),
};

const prismaOccuranceGoal = {
  id: "goal-1",
  userId: "user-1",
  name: "Meditate",
  description: "Daily practice",
  period: "WEEK" as const,
  type: "OCCURANCE" as const,
  targetOccurrences: 5,
  targetDuration: null,
  createdAt: new Date("2026-06-29T00:00:00.000Z"),
  updatedAt: new Date("2026-06-29T00:00:00.000Z"),
};

describe("createGoal", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getCurrentUser.mockResolvedValue(authUser);
    mocks.prisma.goal.create.mockResolvedValue(prismaOccuranceGoal);
  });

  it("returns a validation error for invalid input", async () => {
    const result = await createGoal({
      name: "",
      description: "",
      period: "WEEK",
      type: "OCCURANCE",
      target: 5,
    });

    expect(result).toEqual({ error: "Name is required", goal: null });
    expect(mocks.prisma.goal.create).not.toHaveBeenCalled();
  });

  it("returns unauthorized when there is no current user", async () => {
    mocks.getCurrentUser.mockResolvedValue(null);

    const result = await createGoal({
      name: "Meditate",
      description: "",
      period: "WEEK",
      type: "OCCURANCE",
      target: 5,
    });

    expect(result).toEqual({ error: "Unauthorized", goal: null });
    expect(mocks.prisma.goal.create).not.toHaveBeenCalled();
  });

  it("creates an OCCURANCE goal", async () => {
    const result = await createGoal({
      name: "Meditate",
      description: "Daily practice",
      period: "WEEK",
      type: "OCCURANCE",
      target: 5,
    });

    expect(mocks.prisma.goal.create).toHaveBeenCalledWith({
      data: {
        user: { connect: { id: "user-1" } },
        name: "Meditate",
        description: "Daily practice",
        period: "WEEK",
        type: "OCCURANCE",
        targetOccurrences: 5,
        targetDuration: null,
      },
    });
    expect(result.error).toBeNull();
    expect(result.goal).toMatchObject({
      id: "goal-1",
      userId: "user-1",
      type: "OCCURANCE",
      target: 5,
      history: [],
    });
  });

  it("creates a TIME goal", async () => {
    mocks.prisma.goal.create.mockResolvedValue({
      ...prismaOccuranceGoal,
      id: "goal-2",
      type: "TIME",
      targetOccurrences: null,
      targetDuration: "PT2H",
    });

    const result = await createGoal({
      name: "Read",
      description: "",
      period: "MONTH",
      type: "TIME",
      target: "PT2H",
    });

    expect(mocks.prisma.goal.create).toHaveBeenCalledWith({
      data: {
        user: { connect: { id: "user-1" } },
        name: "Read",
        description: "",
        period: "MONTH",
        type: "TIME",
        targetOccurrences: null,
        targetDuration: "PT2H",
      },
    });
    expect(result.error).toBeNull();
    expect(result.goal).toMatchObject({
      id: "goal-2",
      type: "TIME",
      target: "PT2H",
      history: [],
    });
  });
});
