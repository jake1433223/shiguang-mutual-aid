import {
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from "@nestjs/common";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { CurrentUser, AuthedUser } from "../common/decorators/current-user.decorator";
import { NotificationsService } from "./notifications.service";
import { QueryNotificationsDto } from "./dto/query-notifications.dto";

@Controller("notifications")
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  /** 通知列表（含 unreadCount） */
  @Get()
  list(@CurrentUser() user: AuthedUser, @Query() query: QueryNotificationsDto) {
    return this.notificationsService.list(user.id, query);
  }

  /** 未读数（Navbar 红点轮询） */
  @Get("unread-count")
  unreadCount(@CurrentUser() user: AuthedUser) {
    return this.notificationsService.unreadCount(user.id);
  }

  /** 标记单条已读 */
  @Post(":id/read")
  markRead(@CurrentUser() user: AuthedUser, @Param("id") id: string) {
    return this.notificationsService.markRead(user.id, id);
  }

  /** 全部标记已读 */
  @Post("read-all")
  markAllRead(@CurrentUser() user: AuthedUser) {
    return this.notificationsService.markAllRead(user.id);
  }
}
