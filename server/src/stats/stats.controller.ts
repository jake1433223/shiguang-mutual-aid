import { Controller, Get, Query } from "@nestjs/common";
import { StatsService } from "./stats.service";

@Controller("stats")
export class StatsController {
  constructor(private readonly statsService: StatsService) {}

  /** 公开站点概览（首页 Hero 数字） */
  @Get("overview")
  overview() {
    return this.statsService.overview();
  }

  /** 分类排行榜 */
  @Get("leaderboard")
  leaderboard(@Query("category") category: string) {
    return this.statsService.leaderboard(category || "TECH", 10);
  }
}
