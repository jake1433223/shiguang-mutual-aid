import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { CurrentUser, AuthedUser } from "../common/decorators/current-user.decorator";
import { ApplicationsService } from "./applications.service";
import {
  CreateApplicationDto,
  UpdateApplicationDto,
  ApplicationStatusEnum,
} from "./dto/update-application.dto";
import { IsEnum, IsOptional } from "class-validator";

class ListMyApplicationsDto {
  @IsOptional()
  @IsEnum(ApplicationStatusEnum)
  status?: ApplicationStatusEnum;
}

@Controller("applications")
@UseGuards(JwtAuthGuard)
export class ApplicationsController {
  constructor(private readonly applicationsService: ApplicationsService) {}

  /** 我的接单 */
  @Get("my")
  myList(@CurrentUser() user: AuthedUser, @Query() query: ListMyApplicationsDto) {
    return this.applicationsService.myList(user.id, query.status);
  }

  /** 接单 */
  @Post(":demandId")
  create(
    @CurrentUser() user: AuthedUser,
    @Param("demandId") demandId: string,
    @Body() dto: CreateApplicationDto,
  ) {
    return this.applicationsService.create(user.id, demandId, dto);
  }

  /** 某需求下的所有申请（仅发布者） */
  @Get("demand/:demandId")
  listByDemand(@CurrentUser() user: AuthedUser, @Param("demandId") demandId: string) {
    return this.applicationsService.listByDemand(user.id, demandId);
  }

  /** 接受 / 拒绝 / 完成 */
  @Patch(":id")
  update(
    @CurrentUser() user: AuthedUser,
    @Param("id") id: string,
    @Body() dto: UpdateApplicationDto,
  ) {
    return this.applicationsService.update(user.id, id, dto);
  }

  /** 取消申请（帮手本人） */
  @Post(":id/cancel")
  cancel(@CurrentUser() user: AuthedUser, @Param("id") id: string) {
    return this.applicationsService.cancel(user.id, id);
  }
}
