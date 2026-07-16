import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  Inject,
  Param,
  Patch,
  Post,
} from "@nestjs/common";
import {
  createGoalSchema,
  goalEventSchema,
  updateGoalSchema,
} from "@kaizen/shared-contracts";
import { ZodValidationPipe } from "@kaizen/shared-nestjs";

import { GoalsService } from "./goals.service";

@Controller("goals")
export class GoalsController {
  constructor(
    @Inject(GoalsService) private readonly goalsService: GoalsService,
  ) {}

  @Get()
  list(@Headers("authorization") authorization?: string) {
    return this.goalsService.list(authorization);
  }

  @Post()
  create(
    @Headers("authorization") authorization: string | undefined,
    @Body(new ZodValidationPipe(createGoalSchema)) body: unknown,
  ) {
    return this.goalsService.create(authorization, body as never);
  }

  @Patch(":id")
  update(
    @Headers("authorization") authorization: string | undefined,
    @Param("id") id: string,
    @Body(new ZodValidationPipe(updateGoalSchema)) body: unknown,
  ) {
    return this.goalsService.update(authorization, id, body as never);
  }

  @Delete(":id")
  remove(
    @Headers("authorization") authorization: string | undefined,
    @Param("id") id: string,
  ) {
    return this.goalsService.remove(authorization, id);
  }

  @Post(":id/events")
  addEvent(
    @Headers("authorization") authorization: string | undefined,
    @Param("id") id: string,
    @Body(new ZodValidationPipe(goalEventSchema)) body: unknown,
  ) {
    return this.goalsService.addEvent(authorization, id, body as never);
  }
}
