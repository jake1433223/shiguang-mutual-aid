import { Body, Controller, Delete, Get, Param, Post, Query, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { CurrentUser, AuthedUser } from "../common/decorators/current-user.decorator";
import { DemandsService } from "./demands.service";
import { CreateDemandDto } from "./dto/create-demand.dto";
import { QueryDemandsDto } from "./dto/query-demands.dto";

@Controller("demands")
export class DemandsController {
  constructor(private readonly demandsService: DemandsService) {}

  /** 列表 + 筛选 + 分页 */
  @Get()
  list(@Query() query: QueryDemandsDto) {
    return this.demandsService.list(query);
  }

  /** 详情 */
  @Get(":id")
  detail(@Param("id") id: string) {
    return this.demandsService.detail(id);
  }

  /** 创建需求 */
  @Post()
  @UseGuards(JwtAuthGuard)
  create(@CurrentUser() user: AuthedUser, @Body() dto: CreateDemandDto) {
    return this.demandsService.create(user.id, dto);
  }

  /** 删除需求（退回冻结奖励） */
  @Delete(":id")
  @UseGuards(JwtAuthGuard)
  delete(@CurrentUser() user: AuthedUser, @Param("id") id: string) {
    return this.demandsService.delete(user.id, id);
  }
}
