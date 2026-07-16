export {
  GOAL_PERIODS,
  GOAL_TYPES,
  GOAL_TYPE_LABELS,
} from "./goals/goal.constants";
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
} from "./goals/goal-categories";
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
} from "./goals/goal.schemas";
export type { Goal, GoalEvent, GoalPeriod, GoalType } from "./goals/goal.types";
export {
  getGoalProgressColor,
  getGoalPeriodLabel,
  getGoalProgressDisplay,
  getGoalTargetDisplay,
} from "./goals/goal-display";
export {
  formatMinutesAsGoalDuration,
  formatOccurrenceCount,
  getGoalCompletionRatio,
  getGoalProgressInPeriod,
  getGoalProgressPercent,
  getGoalTargetValue,
  isGoalMet,
  parseIso8601DurationToMinutes,
} from "./goals/goal-progress";
export {
  PERIOD_PROGRESS_LABELS,
  formatGoalsCompletedLabel,
  getPeriodProgressSummary,
  type PeriodProgressSegment,
  type PeriodProgressSummary,
} from "./goals/period-progress";
export { isIso8601Duration, iso8601DurationSchema } from "./goals/iso-duration";
export { matchGoalType } from "./goals/match-goal-type";
export { isUpdateGoalInputEqual } from "./goals/goal-input-utils";
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
  OCCURRENCE_MIN,
  OCCURRENCE_MAX,
  HOURS_MIN,
  HOURS_MAX,
  MINUTES_MIN,
  MINUTES_MAX,
  AMOUNT_MIN,
  AMOUNT_MAX,
  sanitizeAmountInput,
} from "./goals/goal-event-input";
export {
  GOAL_PERIOD_FILTER_LABELS,
  getGoalPeriodsPresent,
  shouldShowPeriodFilter,
  filterGoalsBySelectedPeriods,
} from "./goals/goal-period-filter";
export {
  getGoalFormValidationErrors,
  isGoalFormValid,
  type GoalFormValidationErrors,
} from "./goals/goal-form-validation";
export type { DayActivity, UserStreak } from "./streak/streak.types";
export {
  MAX_ACTIVITY_EVENTS,
  computeUserStreak,
  getBestStreak,
  getCappedActivityLevel,
  getCurrentStreak,
  getEventCountOnDate,
  getWeeklyActivity,
  hasActivityOnDate,
} from "./streak/streak";
export type { CalendarDay, MonthRef } from "./calendar/calendar.types";
export {
  CALENDAR_WEEKDAY_LABELS,
  addMonths,
  buildCalendarMonth,
  formatCalendarMonthLabel,
  getMonthRef,
} from "./calendar/calendar";
