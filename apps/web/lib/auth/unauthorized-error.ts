export class UnauthorizedError extends Error {
  constructor() {
    super("Unauthorized");
    this.name = "UnauthorizedError";
  }
}

export const isUnauthorizedError = (error: unknown): boolean =>
  error instanceof UnauthorizedError ||
  (error instanceof Error && error.message === "Unauthorized");
