export { GOAL_PERIODS, GOAL_TYPES } from "./goal.constants";
export {
  DEFAULT_GOAL_CATEGORY_COLOR,
  DEFAULT_GOAL_CATEGORY_ICON,
  GOAL_CATEGORIES,
  GOAL_CATEGORY_CONFIG,
  LEGACY_GOAL_CATEGORY_MAP,
  getGoalCategoryColor,
  getGoalCategoryColors,
  getGoalCategoryIcon,
  isGoalCategory,
  normalizeGoalCategory,
  type GoalCategory,
  type GoalCategoryColors,
} from "./goal-categories";
export {
  createGoalSchema,
  goalEventSchema,
  addGoalEventSchema,
  goalIdSchema,
  positiveIntSchema,
  updateGoalSchema,
  validateGoalTarget,
  type AddGoalEventInput,
  type CreateGoalInput,
  type GoalEventInput,
  type UpdateGoalInput,
} from "./goal.schemas";
export type { Goal, GoalEvent, GoalPeriod, GoalType } from "./goal.types";
export {
  getGoalProgressColor,
  getGoalPeriodLabel,
  getGoalProgressDisplay,
  getGoalTargetDisplay,
} from "./goal-display";
export {
  formatMinutesAsGoalDuration,
  formatOccurrenceCount,
  getGoalCompletionRatio,
  getGoalProgressInPeriod,
  getGoalProgressPercent,
  getGoalTargetValue,
  isGoalMet,
  parseIso8601DurationToMinutes,
} from "./goal-progress";
export {
  PERIOD_PROGRESS_LABELS,
  formatGoalsCompletedLabel,
  getPeriodProgressSummary,
  type PeriodProgressSegment,
  type PeriodProgressSummary,
} from "./period-progress";
export { isIso8601Duration, iso8601DurationSchema } from "./iso-duration";
export { mapGoalFromPrisma } from "./map-goal";
export { getGoalForUser, listGoalsForUser } from "./queries";
export { requireCurrentUser } from "./require-current-user";
export {
  toPrismaGoalCreateData,
  toPrismaGoalEventCreateData,
  toPrismaGoalUpdateData,
} from "./to-prisma-goal";
export {
  clampAmount,
  clampHours,
  clampMinutes,
  clampOccurrences,
  formatAdjustedTimeDisplay,
  getAdjustedTimeParts,
  getTotalMinutes,
  isPositiveAmountValue,
  isPositiveOccurrenceValue,
  isPositiveTimeValue,
  minutesToIso8601Duration,
  roundAmountToThirdDecimal,
} from "./goal-event-input";
