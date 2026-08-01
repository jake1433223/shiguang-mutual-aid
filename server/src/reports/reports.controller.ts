import { Body, Controller, Get, Post, UseGuards } from "@nestjs/common";
import { Throttle } from "@nestjs/throttler";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import {
  CurrentUser,
  AuthedUser,
} from "../common/decorators/current-user.decorator";
import { ReportsService } from "./reports.service";
import { CreateReportDto } from "./dto/create-report.dto";

@Controller("reports")
@UseGuards(JwtAuthGuard)
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  /** 创建举报（限流：每分钟 5 次，防滥用） */
  @Throttle({ report: { ttl: 60_000, limit: 5 } })
  @Post()
  create(@CurrentUser() user: AuthedUser, @Body() dto: CreateReportDto) {
    return this.reportsService.create(user.id, dto);
  }

  /** 我发起的举报 */
  @Get("mine")
  myReports(@CurrentUser() user: AuthedUser) {
    return this.reportsService.myReports(user.id);
  }
}
