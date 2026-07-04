import type { ZodError } from "zod";

export const getFirstZodIssueMessage = (
  error: ZodError,
  fallback = "Invalid input",
): string => error.issues[0]?.message ?? fallback;
