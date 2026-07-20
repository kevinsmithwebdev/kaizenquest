export { MIN_PASSWORD_LENGTH } from "./auth/auth.constants";
export {
  signUpSchema,
  signInSchema,
  authUserSchema,
  authTokenResponseSchema,
  type SignUpInput,
  type SignInInput,
  type AuthUser,
  type AuthTokenResponse,
} from "./auth/auth.schemas";

export {
  GOAL_PERIODS,
  GOAL_TYPES,
  GOAL_CATEGORIES,
  type GoalPeriod,
  type GoalType,
  type GoalCategory,
} from "./goals/goal.constants";
export {
  isIso8601Duration,
  parseIso8601DurationParts,
  parseIso8601DurationToMinutes,
} from "./goals/iso-duration";
export {
  iso8601DurationSchema,
  positiveIntSchema,
  positiveFloatSchema,
  goalIdSchema,
  createGoalSchema,
  updateGoalSchema,
  goalEventSchema,
  addGoalEventSchema,
  goalSchema,
  goalsListResponseSchema,
  validateGoalTarget,
  type CreateGoalInput,
  type UpdateGoalInput,
  type GoalEventInput,
  type AddGoalEventInput,
  type GoalEvent,
  type Goal,
  type GoalsListResponse,
} from "./goals/goal.schemas";

export { KAFKA_TOPICS, type KafkaTopic } from "./kafka/topics";
export {
  kafkaEventEnvelopeSchema,
  parseKafkaEvent,
  createKafkaEventEnvelope,
  type KafkaEventEnvelope,
} from "./kafka/envelope";
export {
  userRegisteredPayloadSchema,
  userRegisteredEventSchema,
  createUserRegisteredEvent,
  type UserRegisteredPayload,
  type UserRegisteredEvent,
} from "./kafka/auth.events";
export {
  goalCreatedPayloadSchema,
  goalUpdatedPayloadSchema,
  goalDeletedPayloadSchema,
  goalEventLoggedPayloadSchema,
  goalCreatedEventSchema,
  goalUpdatedEventSchema,
  goalDeletedEventSchema,
  goalEventLoggedEventSchema,
  createGoalCreatedEvent,
  createGoalUpdatedEvent,
  createGoalDeletedEvent,
  createGoalEventLoggedEvent,
  type GoalCreatedPayload,
  type GoalUpdatedPayload,
  type GoalDeletedPayload,
  type GoalEventLoggedPayload,
} from "./kafka/goals.events";
