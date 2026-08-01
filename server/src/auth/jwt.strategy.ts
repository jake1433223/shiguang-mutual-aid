import { ExtractJwt, Strategy } from "passport-jwt";
import { PassportStrategy } from "@nestjs/passport";
import { Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PrismaService } from "../prisma/prisma.service";
import type { AuthedUser } from "../common/decorators/current-user.decorator";

interface JwtPayload {
  id: string;
  email: string;
  name: string;
  role?: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, "jwt") {
  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>("JWT_SECRET", "default-secret"),
    });
  }

  /** passport 校验通过后会调用这个方法，返回值会挂在 request.user 上 */
  async validate(payload: JwtPayload): Promise<AuthedUser> {
    const user = await this.prisma.user.findUnique({
      where: { id: payload.id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        bannedAt: true,
      },
    });
    if (!user) {
      throw new UnauthorizedException("用户不存在或 token 已失效");
    }
    // 封禁用户拒绝访问
    if (user.bannedAt) {
      throw new UnauthorizedException("账号已被封禁，请联系管理员");
    }
    return { id: user.id, email: user.email, name: user.name, role: user.role };
  }
}
