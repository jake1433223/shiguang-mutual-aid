import { Body, Controller, Get, Post, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { AuthedUser, CurrentUser } from "../common/decorators/current-user.decorator";
import { RechargeService } from "./recharge.service";
import { CreateRechargeDto } from "./dto/recharge.dto";

@Controller("recharge")
@UseGuards(JwtAuthGuard)
export class RechargeController {
  constructor(private readonly rechargeService: RechargeService) {}

  @Get("packages")
  packages() {
    return this.rechargeService.packages();
  }

  @Post()
  create(@CurrentUser() user: AuthedUser, @Body() dto: CreateRechargeDto) {
    return this.rechargeService.recharge(user.id, dto);
  }
}
