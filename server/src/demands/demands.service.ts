import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { CreateDemandDto } from "./dto/create-demand.dto";
import { QueryDemandsDto, SortEnum } from "./dto/query-demands.dto";

/** tags 字段的 JSON 序列化/反序列化辅助 */
function parseTags(raw: string | null | undefined): string[] {
  if (!raw) return [];
  try {
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

/** 把 Prisma 行拍平成前端友好格式 */
function formatDemand(d: {
  id: string;
  title: string;
  desc: string;
  category: string;
  reward: number;
  status: string;
  tags: string | null;
  location: string | null;
  deadline: Date;
  publishedAt: Date;
  views: number;
  publisherId: string;
  publisher: { id: string; name: string; avatar: string; tier: number };
  _count?: { applications: number; comments: number };
}) {
  return {
    id: d.id,
    title: d.title,
    desc: d.desc,
    category: d.category,
    reward: d.reward,
    status: d.status,
    tags: parseTags(d.tags),
    location: d.location,
    deadline: d.deadline.toISOString(),
    publishedAt: d.publishedAt.toISOString(),
    views: d.views,
    publisherId: d.publisherId,
    publisher: d.publisher,
    _count: d._count ?? { applications: 0, comments: 0 },
  };
}

@Injectable()
export class DemandsService {
  constructor(private readonly prisma: PrismaService) {}

  async list(query: QueryDemandsDto) {
    const { category, status, sort, keyword, page = 1, pageSize = 12 } = query;

    const where: Prisma.DemandWhereInput = {};
    if (category) where.category = category;
    if (status) where.status = status;
    if (keyword && keyword.trim()) {
      const kw = keyword.trim();
      where.OR = [
        { title: { contains: kw } },
        { desc: { contains: kw } },
      ];
    }

    let orderBy: Prisma.DemandOrderByWithRelationInput = { publishedAt: "desc" };
    if (sort === SortEnum.REWARD_DESC) orderBy = { reward: "desc" };
    else if (sort === SortEnum.APPLICANTS_DESC) orderBy = { applications: { _count: "desc" } };

    const [items, total] = await Promise.all([
      this.prisma.demand.findMany({
        where,
        orderBy,
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: {
          publisher: { select: { id: true, name: true, avatar: true, tier: true } },
          _count: { select: { applications: true, comments: true } },
        },
      }),
      this.prisma.demand.count({ where }),
    ]);

    return {
      items: items.map(formatDemand),
      total,
      page,
      pageSize,
    };
  }

  async detail(id: string) {
    const demand = await this.prisma.demand.findUnique({
      where: { id },
      include: {
        publisher: { select: { id: true, name: true, avatar: true, tier: true, bio: true } },
        _count: { select: { applications: true, comments: true } },
      },
    });
    if (!demand) throw new NotFoundException("需求不存在");

    // 异步 +1 浏览数（不阻塞返回）
    this.prisma.demand.update({ where: { id }, data: { views: { increment: 1 } } }).catch(() => {});

    return formatDemand(demand);
  }

  async create(userId: string, dto: CreateDemandDto) {
    // 校验余额
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException("用户不存在");
    if (user.coins < dto.reward) {
      throw new BadRequestException(`拾光币不足，当前余额 ${user.coins}，需要 ${dto.reward}`);
    }

    // 创建需求 + 扣余额 + 写冻结流水（事务）
    const demand = await this.prisma.$transaction(async (tx) => {
      const d = await tx.demand.create({
        data: {
          title: dto.title,
          desc: dto.desc,
          category: dto.category,
          reward: dto.reward,
          status: "OPEN",
          tags: JSON.stringify(dto.tags ?? []),
          location: dto.location ?? null,
          deadline: new Date(dto.deadline),
          publisherId: userId,
        },
        include: {
          publisher: { select: { id: true, name: true, avatar: true, tier: true } },
          _count: { select: { applications: true, comments: true } },
        },
      });
      // 扣冻结奖励
      const updated = await tx.user.update({
        where: { id: userId },
        data: { coins: { decrement: dto.reward } },
        select: { coins: true },
      });
      // 写拾光币流水：DEMAND_FREEZE
      await tx.transaction.create({
        data: {
          userId,
          amount: -dto.reward,
          balance: updated.coins,
          type: "DEMAND_FREEZE",
          refType: "DEMAND",
          refId: d.id,
          remark: `发布需求「${dto.title}」冻结奖励`,
        },
      });
      return d;
    });

    return formatDemand(demand);
  }

  async delete(userId: string, demandId: string) {
    const demand = await this.prisma.demand.findUnique({ where: { id: demandId } });
    if (!demand) throw new NotFoundException("需求不存在");
    if (demand.publisherId !== userId) throw new ForbiddenException("无权操作他人需求");
    if (demand.status !== "OPEN") {
      throw new BadRequestException("仅招募中的需求可以删除");
    }

    // 删除需求 + 退回冻结奖励 + 写退款流水（事务）
    await this.prisma.$transaction(async (tx) => {
      await tx.demand.delete({ where: { id: demandId } });
      const updated = await tx.user.update({
        where: { id: userId },
        data: { coins: { increment: demand.reward } },
        select: { coins: true },
      });
      // 写拾光币流水：DEMAND_REFUND
      await tx.transaction.create({
        data: {
          userId,
          amount: demand.reward,
          balance: updated.coins,
          type: "DEMAND_REFUND",
          refType: "DEMAND",
          refId: demandId,
          remark: `删除需求「${demand.title}」退回奖励`,
        },
      });
    });

    return { id: demandId };
  }
}
