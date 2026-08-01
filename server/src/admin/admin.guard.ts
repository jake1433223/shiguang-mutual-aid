import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { AuthedUser } from "../common/decorators/current-user.decorator";

/**
 * 管理员守卫：仅 role === "ADMIN" 可访问
 * 必须在 JwtAuthGuard 之后使用（依赖 request.user 已被填充）
 */
@Injectable()
export class AdminGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(ctx: ExecutionContext): boolean {
    const req = ctx
      .switchToHttp()
      .getRequest<{ user?: AuthedUser }>();
    const user = req.user;
    if (!user || user.role !== "ADMIN") {
      throw new ForbiddenException("无管理员权限");
    }
    return true;
  }
}
