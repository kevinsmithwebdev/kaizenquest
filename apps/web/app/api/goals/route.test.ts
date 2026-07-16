import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  listGoalsForUser: vi.fn(),
  requireCurrentUser: vi.fn(),
}));

vi.mock("@/lib/goals", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/goals")>();
  return {
    ...actual,
    listGoalsForUser: mocks.listGoalsForUser,
    requireCurrentUser: mocks.requireCurrentUser,
  };
});

import { GET } from "./route";

describe("GET /api/goals", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  beforeEach(() => {
    vi.clearAllMocks();
    mocks.requireCurrentUser.mockResolvedValue({ id: "user-1" });
    mocks.listGoalsForUser.mockResolvedValue([
      {
        id: "goal-1",
        userId: "user-1",
        name: "Meditate",
        description: "",
        category: null,
        period: "WEEK",
        type: "OCCURANCE",
        target: 5,
        createdAt: new Date("2026-06-29T00:00:00.000Z"),
        updatedAt: new Date("2026-06-29T00:00:00.000Z"),
        history: [
          {
            id: "event-1",
            type: "OCCURANCE",
            occurrences: 1,
            occurredAt: new Date("2026-06-30T00:00:00.000Z"),
          },
        ],
      },
    ]);
  });

  it("returns 401 when unauthenticated", async () => {
    const { UnauthorizedError } = await import("@/lib/auth");
    mocks.requireCurrentUser.mockRejectedValue(new UnauthorizedError());

    const response = await GET();

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({ error: "Unauthorized" });
  });

  it("returns serialized goals on success", async () => {
    const response = await GET();

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      goals: [
        {
          id: "goal-1",
          userId: "user-1",
          name: "Meditate",
          description: "",
          category: null,
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
              occurredAt: "2026-06-30T00:00:00.000Z",
            },
          ],
        },
      ],
    });
  });

  it("rethrows unexpected errors", async () => {
    mocks.requireCurrentUser.mockRejectedValue(new Error("database down"));

    await expect(GET()).rejects.toThrow("database down");
  });
});
