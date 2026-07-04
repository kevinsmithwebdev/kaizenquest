import type { GoalType } from "./goal.types";

type GoalTypeHandlers<R> = { [K in GoalType]: () => R };

export const matchGoalType = <R>(
  type: GoalType,
  handlers: GoalTypeHandlers<R>,
): R => handlers[type]();
