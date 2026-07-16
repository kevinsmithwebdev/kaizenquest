import { z } from "zod";

import { isIso8601Duration } from "./iso-duration-parse";

export {
  isIso8601Duration,
  parseIso8601DurationToMinutes,
} from "./iso-duration-parse";

export const iso8601DurationSchema = z
  .string()
  .refine(
    isIso8601Duration,
    "Enter a valid ISO 8601 duration (e.g. PT2H, PT30M)",
  );
