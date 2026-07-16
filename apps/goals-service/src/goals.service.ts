import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from "@nestjs/common";
import { verifyAuthToken } from "@kaizen/domain-auth";
import {
  createGoalCreatedEvent,
  createGoalDeletedEvent,
  createGoalEventLoggedEvent,
  createGoalUpdatedEvent,
  KAFKA_TOPICS,
  validateGoalTarget,
  type CreateGoalInput,
  type GoalEventInput,
  type UpdateGoalInput,
} from "@kaizen/shared-contracts";
import { publishKafkaMessage } from "@kaizen/shared-nestjs";

import { mapGoalFromPrisma } from "./map-goal";
import { PrismaService } from "./prisma.service";
import {
  toPrismaGoalCreateData,
  toPrismaGoalEventCreateData,
  toPrismaGoalUpdateData,
} from "./to-prisma-goal";

const goalWithEventsInclude = {
  events: {
    orderBy: {
      occurredAt: "desc" as const,
    },
  },
};

@Injectable()
export class GoalsService {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  async list(authorizationHeader?: string) {
    const userId = await this.requireUserId(authorizationHeader);
    const goals = await this.prisma.goal.findMany({
      where: { userId },
      include: goalWithEventsInclude,
      orderBy: { updatedAt: "desc" },
    });

    return {
      goals: goals.map((goal) => mapGoalFromPrisma(goal, goal.events)),
    };
  }

  async create(
    authorizationHeader: string | undefined,
    input: CreateGoalInput,
  ) {
    const userId = await this.requireUserId(authorizationHeader);
    const created = await this.prisma.goal.create({
      data: toPrismaGoalCreateData(userId, input),
    });

    const goal = mapGoalFromPrisma(created, []);
    const event = createGoalCreatedEvent({ goal });
    await publishKafkaMessage(KAFKA_TOPICS.GOALS_GOAL_CREATED, event);

    return goal;
  }

  async update(
    authorizationHeader: string | undefined,
    id: string,
    input: UpdateGoalInput,
  ) {
    const userId = await this.requireUserId(authorizationHeader);

    if (input.id !== id) {
      throw new BadRequestException("Goal ID in path and body must match.");
    }

    const existing = await this.prisma.goal.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      throw new NotFoundException("Goal not found");
    }

    const targetParsed = validateGoalTarget(existing.type, input.target);
    if (!targetParsed.success) {
      throw new BadRequestException(
        targetParsed.error.issues[0]?.message ?? "Invalid target",
      );
    }

    await this.prisma.goal.update({
      where: { id },
      data: toPrismaGoalUpdateData(
        { ...input, target: targetParsed.data },
        existing.type,
      ),
    });

    const updated = await this.prisma.goal.findFirst({
      where: { id, userId },
      include: goalWithEventsInclude,
    });

    if (!updated) {
      throw new NotFoundException("Goal not found");
    }

    const goal = mapGoalFromPrisma(updated, updated.events);
    const event = createGoalUpdatedEvent({ goal });
    await publishKafkaMessage(KAFKA_TOPICS.GOALS_GOAL_UPDATED, event);

    return goal;
  }

  async remove(authorizationHeader: string | undefined, id: string) {
    const userId = await this.requireUserId(authorizationHeader);
    const existing = await this.prisma.goal.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      throw new NotFoundException("Goal not found");
    }

    await this.prisma.goal.delete({ where: { id } });

    const event = createGoalDeletedEvent({ goalId: id, userId });
    await publishKafkaMessage(KAFKA_TOPICS.GOALS_GOAL_DELETED, event);

    return { ok: true };
  }

  async addEvent(
    authorizationHeader: string | undefined,
    goalId: string,
    input: GoalEventInput,
  ) {
    const userId = await this.requireUserId(authorizationHeader);
    const existing = await this.prisma.goal.findFirst({
      where: { id: goalId, userId },
    });

    if (!existing) {
      throw new NotFoundException("Goal not found");
    }

    if (input.type !== existing.type) {
      throw new BadRequestException("Event type does not match goal type");
    }

    const createdEvent = await this.prisma.goalEvent.create({
      data: toPrismaGoalEventCreateData(goalId, input),
    });

    const updated = await this.prisma.goal.findFirst({
      where: { id: goalId, userId },
      include: goalWithEventsInclude,
    });

    if (!updated) {
      throw new NotFoundException("Goal not found");
    }

    const goal = mapGoalFromPrisma(updated, updated.events);
    const mappedEvent = goal.history.find((e) => e.id === createdEvent.id);
    if (!mappedEvent) {
      throw new Error(`Created event ${createdEvent.id} missing from history`);
    }

    const kafkaEvent = createGoalEventLoggedEvent({
      goalId,
      userId,
      event: mappedEvent,
    });
    await publishKafkaMessage(KAFKA_TOPICS.GOALS_GOAL_EVENT_LOGGED, kafkaEvent);

    return goal;
  }

  private async requireUserId(authorizationHeader?: string) {
    if (!authorizationHeader?.startsWith("Bearer ")) {
      throw new UnauthorizedException("Missing bearer token.");
    }

    const token = authorizationHeader.slice("Bearer ".length).trim();
    const userId = await verifyAuthToken(token);
    if (!userId) {
      throw new UnauthorizedException("Invalid token.");
    }
    return userId;
  }
}
