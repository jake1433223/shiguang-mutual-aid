import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
  Req,
} from "@nestjs/common";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { AdminGuard } from "./admin.guard";
import {
  CurrentUser,
  AuthedUser,
} from "../common/decorators/current-user.decorator";
import { AdminService } from "./admin.service";
import {
  AdjustCoinsDto,
  AdjustCreditDto,
  AdminAuditLogListDto,
  AdminCommentListDto,
  AdminDemandListDto,
  AdminReportListDto,
  AdminUserListDto,
  BanUserDto,
  ResolveReportDto,
  TakeDownDemandDto,
} from "./dto/admin.dto";

@Controller("admin")
@UseGuards(JwtAuthGuard, AdminGuard)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  // 数据看板
  @Get("stats")
  stats() {
    return this.adminService.getStats();
  }

  // ============================================================
  // 用户管理
  // ============================================================

  @Get("users")
  listUsers(@Query() query: AdminUserListDto) {
    return this.adminService.listUsers(query);
  }

  @Post("users/:id/ban")
  banUser(
    @CurrentUser() user: AuthedUser,
    @Param("id") id: string,
    @Body() dto: BanUserDto,
    @Req() req: any,
  ) {
    return this.adminService.banUser(user.id, id, dto, req?.ip);
  }

  @Post("users/:id/unban")
  unbanUser(
    @CurrentUser() user: AuthedUser,
    @Param("id") id: string,
    @Req() req: any,
  ) {
    return this.adminService.unbanUser(user.id, id, req?.ip);
  }

  @Post("users/:id/coins")
  adjustCoins(
    @CurrentUser() user: AuthedUser,
    @Param("id") id: string,
    @Body() dto: AdjustCoinsDto,
    @Req() req: any,
  ) {
    return this.adminService.adjustCoins(user.id, id, dto, req?.ip);
  }

  @Post("users/:id/credit")
  adjustCredit(
    @CurrentUser() user: AuthedUser,
    @Param("id") id: string,
    @Body() dto: AdjustCreditDto,
    @Req() req: any,
  ) {
    return this.adminService.adjustCredit(user.id, id, dto, req?.ip);
  }

  // ============================================================
  // 需求管理
  // ============================================================

  @Get("demands")
  listDemands(@Query() query: AdminDemandListDto) {
    return this.adminService.listDemands(query);
  }

  @Post("demands/:id/take-down")
  takeDownDemand(
    @CurrentUser() user: AuthedUser,
    @Param("id") id: string,
    @Body() dto: TakeDownDemandDto,
    @Req() req: any,
  ) {
    return this.adminService.takeDownDemand(user.id, id, dto, req?.ip);
  }

  @Post("demands/:id/restore")
  restoreDemand(
    @CurrentUser() user: AuthedUser,
    @Param("id") id: string,
    @Req() req: any,
  ) {
    return this.adminService.restoreDemand(user.id, id, req?.ip);
  }

  // ============================================================
  // 评论管理
  // ============================================================

  @Get("comments")
  listComments(@Query() query: AdminCommentListDto) {
    return this.adminService.listComments(query);
  }

  @Delete("comments/:id")
  deleteComment(
    @CurrentUser() user: AuthedUser,
    @Param("id") id: string,
    @Req() req: any,
  ) {
    return this.adminService.deleteComment(user.id, id, req?.ip);
  }

  // ============================================================
  // 举报管理
  // ============================================================

  @Get("reports")
  listReports(@Query() query: AdminReportListDto) {
    return this.adminService.listReports(query);
  }

  @Post("reports/:id/resolve")
  resolveReport(
    @CurrentUser() user: AuthedUser,
    @Param("id") id: string,
    @Body() dto: ResolveReportDto,
    @Req() req: any,
  ) {
    return this.adminService.resolveReport(user.id, id, dto, req?.ip);
  }

  @Post("reports/:id/dismiss")
  dismissReport(
    @CurrentUser() user: AuthedUser,
    @Param("id") id: string,
    @Body() dto: ResolveReportDto,
    @Req() req: any,
  ) {
    return this.adminService.dismissReport(user.id, id, dto, req?.ip);
  }

  // ============================================================
  // 审计日志
  // ============================================================

  @Get("audit-logs")
  listAuditLogs(@Query() query: AdminAuditLogListDto) {
    return this.adminService.listAuditLogs(query);
  }
}
