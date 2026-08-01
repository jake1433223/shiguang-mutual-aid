import { Body, Controller, Get, Patch, Query, UseGuards } from "@nestjs/common";
import { UsersService } from "./users.service";
import { UpdateUserDto } from "./dto/update-user.dto";
import { QueryTransactionsDto } from "./dto/query-transactions.dto";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { CurrentUser, AuthedUser } from "../common/decorators/current-user.decorator";

@Controller("users")
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get("me")
  getMe(@CurrentUser() user: AuthedUser) {
    return this.usersService.getMe(user.id);
  }

  @Patch("me")
  updateMe(@CurrentUser() user: AuthedUser, @Body() dto: UpdateUserDto) {
    return this.usersService.updateMe(user.id, dto);
  }

  @Get("me/demands")
  myDemands(@CurrentUser() user: AuthedUser) {
    return this.usersService.myDemands(user.id);
  }

  @Get("me/applications")
  myApplications(@CurrentUser() user: AuthedUser) {
    return this.usersService.myApplications(user.id);
  }

  @Get("me/transactions")
  myTransactions(
    @CurrentUser() user: AuthedUser,
    @Query() query: QueryTransactionsDto,
  ) {
    return this.usersService.myTransactions(user.id, query);
  }
}
