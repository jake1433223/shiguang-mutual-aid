import { createParamDecorator, ExecutionContext } from "@nestjs/common";

/**
 * @CurrentUser() 装饰器
 * 从 request.user 取出 JWT 校验后的用户对象
 * 用法：someMethod(@CurrentUser() user: AuthedUser)
 */
export interface AuthedUser {
  id: string;
  email: string;
  name: string;
  role: string; // USER | ADMIN
}

export const CurrentUser = createParamDecorator(
  (data: keyof AuthedUser | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<{ user?: AuthedUser }>();
    const user = request.user;
    if (!user) return undefined;
    return data ? user[data] : user;
  }
);
