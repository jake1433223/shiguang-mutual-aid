import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  NotFoundException,
  BadRequestException,
  Logger,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import * as bcrypt from "bcrypt";
import * as crypto from "crypto";
import { PrismaService } from "../prisma/prisma.service";
import { MailService } from "../mail/mail.service";
import { RegisterDto } from "./dto/register.dto";
import { LoginDto } from "./dto/login.dto";
import { VerifyEmailDto, ResendVerificationDto } from "./dto/verify-email.dto";
import { ForgotPasswordDto, ResetPasswordDto } from "./dto/reset-password.dto";
import type { AuthedUser } from "../common/decorators/current-user.decorator";

/** 返回给前端的用户对象（去掉 password） */
export type SafeUser = Omit<UserRow, "password">;
interface UserRow {
  id: string;
  email: string;
  password: string;
  name: string;
  avatar: string;
  bio: string;
  tier: number;
  coins: number;
  creditScore: number;
  role: string;
  emailVerified: Date | null;
  bannedAt: Date | null;
  banReason: string | null;
  createdAt: Date;
  updatedAt: Date;
}

function toSafeUser(u: UserRow): SafeUser {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { password, ...rest } = u;
  return rest;
}

/** 邮箱验证 token 有效期 30 分钟 */
const VERIFICATION_TTL_MS = 30 * 60 * 1000;

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly mailService: MailService,
  ) {}

  /** 注册：创建用户 + 发验证邮件 + 写注册赠送流水 */
  async register(dto: RegisterDto) {
    const existed = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (existed) {
      throw new ConflictException("该邮箱已被注册");
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);
    const avatar = dto.name.charAt(0);

    // 事务：创建用户 + 写注册赠送流水
    const user = await this.prisma.$transaction(async (tx) => {
      const u = await tx.user.create({
        data: {
          email: dto.email,
          password: passwordHash,
          name: dto.name,
          avatar,
          coins: 100, // 注册送 100 拾光币
          creditScore: 100, // 初始信用分 100
        },
      });
      // 写拾光币流水
      await tx.transaction.create({
        data: {
          userId: u.id,
          amount: 100,
          balance: 100,
          type: "REGISTER_BONUS",
          remark: "注册赠送",
        },
      });
      return u;
    });

    // 发验证邮件（失败不阻塞注册）
    try {
      await this.sendVerificationToken(user.email, user.name, "REGISTER");
    } catch (e) {
      this.logger.error(`注册后发送验证邮件失败：${(e as Error).message}`);
    }

    const token = this.signToken(user.id, user.email, user.name, user.role);
    return { user: toSafeUser(user), token };
  }

  /** 登录：校验密码 + 检查封禁 */
  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (!user) {
      throw new UnauthorizedException("邮箱或密码错误");
    }
    const ok = await bcrypt.compare(dto.password, user.password);
    if (!ok) {
      throw new UnauthorizedException("邮箱或密码错误");
    }
    if (user.bannedAt) {
      throw new UnauthorizedException(
        `账号已被封禁${user.banReason ? `：${user.banReason}` : ""}`,
      );
    }
    const token = this.signToken(user.id, user.email, user.name, user.role);
    return { user: toSafeUser(user), token };
  }

  /** 用 token 解出的 payload 查最新用户信息 */
  async getUserById(id: string): Promise<SafeUser | null> {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) return null;
    return toSafeUser(user);
  }

  // ============================================================
  // 邮箱验证
  // ============================================================

  /** 验证邮箱：从邮件链接拿 token 来激活 */
  async verifyEmail(dto: VerifyEmailDto) {
    const record = await this.prisma.emailVerification.findUnique({
      where: { token: dto.token },
    });
    if (!record) {
      throw new BadRequestException("验证链接无效");
    }
    if (record.usedAt) {
      throw new BadRequestException("验证链接已被使用");
    }
    if (record.purpose !== "REGISTER") {
      throw new BadRequestException("验证链接用途不匹配");
    }
    if (record.expiresAt.getTime() < Date.now()) {
      throw new BadRequestException("验证链接已过期，请重新发送");
    }

    const user = await this.prisma.user.findUnique({
      where: { email: record.email },
    });
    if (!user) {
      throw new NotFoundException("用户不存在");
    }

    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: user.id },
        data: { emailVerified: new Date() },
      }),
      this.prisma.emailVerification.update({
        where: { id: record.id },
        data: { usedAt: new Date() },
      }),
    ]);

    return { message: "邮箱验证成功" };
  }

  /** 重新发送验证邮件 */
  async resendVerification(dto: ResendVerificationDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    // 不暴露用户是否存在
    if (!user) return { message: "如果该邮箱已注册，验证邮件已发送" };
    if (user.emailVerified) {
      return { message: "邮箱已验证，无需重复操作" };
    }
    await this.sendVerificationToken(user.email, user.name, "REGISTER");
    return { message: "验证邮件已发送，请查收" };
  }

  // ============================================================
  // 找回密码
  // ============================================================

  /** 忘记密码：发重置链接到邮箱 */
  async forgotPassword(dto: ForgotPasswordDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    // 不暴露用户是否存在
    if (!user) return { message: "如果该邮箱已注册，重置链接已发送" };

    await this.sendVerificationToken(user.email, user.name, "RESET_PASSWORD");
    return { message: "重置链接已发送，请查收" };
  }

  /** 重置密码：用 token 设置新密码 */
  async resetPassword(dto: ResetPasswordDto) {
    const record = await this.prisma.emailVerification.findUnique({
      where: { token: dto.token },
    });
    if (!record) {
      throw new BadRequestException("重置链接无效");
    }
    if (record.usedAt) {
      throw new BadRequestException("重置链接已被使用");
    }
    if (record.purpose !== "RESET_PASSWORD") {
      throw new BadRequestException("重置链接用途不匹配");
    }
    if (record.expiresAt.getTime() < Date.now()) {
      throw new BadRequestException("重置链接已过期，请重新申请");
    }

    const user = await this.prisma.user.findUnique({
      where: { email: record.email },
    });
    if (!user) {
      throw new NotFoundException("用户不存在");
    }

    const passwordHash = await bcrypt.hash(dto.newPassword, 10);
    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: user.id },
        data: { password: passwordHash },
      }),
      this.prisma.emailVerification.update({
        where: { id: record.id },
        data: { usedAt: new Date() },
      }),
    ]);

    return { message: "密码重置成功，请用新密码登录" };
  }

  // ============================================================
  // 内部方法
  // ============================================================

  /** 生成验证 token 并发邮件 */
  private async sendVerificationToken(
    email: string,
    name: string,
    purpose: "REGISTER" | "RESET_PASSWORD",
  ) {
    // 先把该邮箱同用途的旧 token 全部标记已使用，避免多个有效链接
    await this.prisma.emailVerification.updateMany({
      where: { email, purpose, usedAt: null },
      data: { usedAt: new Date() },
    });

    const token = crypto.randomBytes(32).toString("hex");
    await this.prisma.emailVerification.create({
      data: {
        token,
        email,
        purpose,
        expiresAt: new Date(Date.now() + VERIFICATION_TTL_MS),
      },
    });

    if (purpose === "REGISTER") {
      await this.mailService.sendVerificationEmail(email, token, name);
    } else {
      await this.mailService.sendPasswordResetEmail(email, token, name);
    }
  }

  private signToken(
    userId: string,
    email: string,
    name: string,
    role: string,
  ): string {
    const payload: AuthedUser = { id: userId, email, name, role };
    const expiresIn = this.configService.get<string>("JWT_EXPIRES_IN", "2h");
    return this.jwtService.sign(payload, { expiresIn } as any);
  }
}
