export const KAFKA_TOPICS = {
  AUTH_USER_REGISTERED: "kaizen.auth.user-registered.v1",
  GOALS_GOAL_CREATED: "kaizen.goals.goal-created.v1",
  GOALS_GOAL_UPDATED: "kaizen.goals.goal-updated.v1",
  GOALS_GOAL_DELETED: "kaizen.goals.goal-deleted.v1",
  GOALS_GOAL_EVENT_LOGGED: "kaizen.goals.goal-event-logged.v1",
} as const;

export type KafkaTopic = (typeof KAFKA_TOPICS)[keyof typeof KAFKA_TOPICS];
