import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { UpdateUserDto } from "./dto/update-user.dto";

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  /** 我的拾光币交易流水 */
  async myTransactions(
    userId: string,
    query: { page?: number; pageSize?: number; type?: string },
  ) {
    const { page = 1, pageSize = 20, type } = query;
    const where: any = { userId };
    if (type) where.type = type;
    const [items, total] = await Promise.all([
      this.prisma.transaction.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.transaction.count({ where }),
    ]);
    return {
      items: items.map((t) => ({
        id: t.id,
        amount: t.amount,
        balance: t.balance,
        type: t.type,
        refType: t.refType,
        refId: t.refId,
        remark: t.remark,
        createdAt: t.createdAt.toISOString(),
        userId: t.userId,
      })),
      total,
      page,
      pageSize,
    };
  }

  /** 获取个人资料（去掉 password） */
  async getMe(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        bio: true,
        tier: true,
        coins: true,
        creditScore: true,
        role: true,
        createdAt: true,
      },
    });
    return user;
  }

  async updateMe(userId: string, dto: UpdateUserDto) {
    const data: Record<string, unknown> = {};
    if (dto.name !== undefined) {
      data.name = dto.name;
      // 同步更新头像首字
      data.avatar = dto.name.charAt(0);
    }
    if (dto.avatar !== undefined) data.avatar = dto.avatar;
    if (dto.bio !== undefined) data.bio = dto.bio;

    return this.prisma.user.update({
      where: { id: userId },
      data,
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        bio: true,
        tier: true,
        coins: true,
        creditScore: true,
        role: true,
        createdAt: true,
      },
    });
  }

  /** 我发布的需求 */
  async myDemands(userId: string) {
    return this.prisma.demand.findMany({
      where: { publisherId: userId },
      orderBy: { publishedAt: "desc" },
      include: {
        _count: { select: { applications: true, comments: true } },
      },
    });
  }

  /** 我接的单 */
  async myApplications(userId: string) {
    return this.prisma.application.findMany({
      where: { helperId: userId },
      orderBy: { createdAt: "desc" },
      include: {
        demand: {
          select: {
            id: true,
            title: true,
            reward: true,
            status: true,
            deadline: true,
            publisher: { select: { id: true, name: true, avatar: true, tier: true } },
          },
        },
      },
    });
  }
}
