export type ApiClientOptions = {
  baseUrl: string;
  getAccessToken?: () => string | null | Promise<string | null>;
};

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly body?: unknown,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export const createApiClient = (options: ApiClientOptions) => {
  const request = async <T>(
    path: string,
    init: RequestInit = {},
  ): Promise<T> => {
    const token = options.getAccessToken
      ? await options.getAccessToken()
      : null;
    const headers = new Headers(init.headers);
    headers.set("Content-Type", "application/json");
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }

    const response = await fetch(`${options.baseUrl}${path}`, {
      ...init,
      headers,
    });

    const text = await response.text();
    const body = text ? JSON.parse(text) : null;

    if (!response.ok) {
      throw new ApiError(
        typeof body?.message === "string" ? body.message : response.statusText,
        response.status,
        body,
      );
    }

    return body as T;
  };

  return {
    signUp: (input: { name: string; email: string; password: string }) =>
      request<{ accessToken: string; user: unknown }>("/auth/sign-up", {
        method: "POST",
        body: JSON.stringify(input),
      }),
    signIn: (input: { email: string; password: string }) =>
      request<{ accessToken: string; user: unknown }>("/auth/sign-in", {
        method: "POST",
        body: JSON.stringify(input),
      }),
    me: () => request<unknown>("/auth/me"),
    listGoals: () => request<unknown[]>("/goals"),
    createGoal: (input: unknown) =>
      request<unknown>("/goals", {
        method: "POST",
        body: JSON.stringify(input),
      }),
    updateGoal: (id: string, input: unknown) =>
      request<unknown>(`/goals/${id}`, {
        method: "PATCH",
        body: JSON.stringify(input),
      }),
    deleteGoal: (id: string) =>
      request<unknown>(`/goals/${id}`, { method: "DELETE" }),
    addGoalEvent: (id: string, input: unknown) =>
      request<unknown>(`/goals/${id}/events`, {
        method: "POST",
        body: JSON.stringify(input),
      }),
    getStreak: () => request<unknown>("/analytics/streak"),
  };
};

export type ApiClient = ReturnType<typeof createApiClient>;
