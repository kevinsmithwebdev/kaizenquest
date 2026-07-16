import { Controller, Get, Headers, Inject } from "@nestjs/common";

import { AnalyticsService } from "./analytics.service";

@Controller("analytics")
export class AnalyticsController {
  constructor(
    @Inject(AnalyticsService)
    private readonly analyticsService: AnalyticsService,
  ) {}

  @Get("streak")
  getStreak(@Headers("authorization") authorization?: string) {
    return this.analyticsService.getStreak(authorization);
  }
}
