import { z } from "zod";

const ISO_8601_DURATION_REGEX =
  /^P(?:(\d+)Y)?(?:(\d+)M)?(?:(\d+)W)?(?:(\d+)D)?(?:T(?:(\d+)H)?(?:(\d+)M)?(?:(\d+(?:\.\d+)?)S)?)?$/;

export const isIso8601Duration = (value: string): boolean => {
  const match = ISO_8601_DURATION_REGEX.exec(value);
  if (!match) {
    return false;
  }

  return match.slice(1).some((part) => part !== undefined);
};

export const iso8601DurationSchema = z
  .string()
  .refine(
    isIso8601Duration,
    "Enter a valid ISO 8601 duration (e.g. PT2H, PT30M)",
  );
