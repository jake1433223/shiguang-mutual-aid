import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { NotificationsService } from "../notifications/notifications.service";
import {
  AdjustCoinsDto,
  AdjustCreditDto,
  AdminAuditLogListDto,
  AdminCommentListDto,
  AdminDemandListDto,
  AdminReportListDto,
  AdminUserListDto,
  BanUserDto,
  ResolveReportDto,
  TakeDownDemandDto,
} from "./dto/admin.dto";

/** 审计日志 action 枚举 */
export type AuditAction =
  | "USER_BAN"
  | "USER_UNBAN"
  | "USER_COIN_ADJUST"
  | "USER_CREDIT_ADJUST"
  | "DEMAND_TAKE_DOWN"
  | "DEMAND_RESTORE"
  | "COMMENT_DELETE"
  | "REPORT_RESOLVE"
  | "REPORT_DISMISS";

function toBool(v?: string): boolean | undefined {
  if (v === undefined) return undefined;
  if (v === "true") return true;
  if (v === "false") return false;
  return undefined;
}

function formatUser(u: any) {
  return {
    id: u.id,
    email: u.email,
    name: u.name,
    avatar: u.avatar,
    bio: u.bio,
    tier: u.tier,
    coins: u.coins,
    creditScore: u.creditScore,
    role: u.role,
    emailVerified: u.emailVerified ? u.emailVerified.toISOString() : null,
    bannedAt: u.bannedAt ? u.bannedAt.toISOString() : null,
    banReason: u.banReason,
    createdAt: u.createdAt.toISOString(),
    _count: u._count ?? {
      demands: 0,
      applications: 0,
      comments: 0,
    },
  };
}

function formatDemand(d: any) {
  return {
    id: d.id,
    title: d.title,
    desc: d.desc,
    category: d.category,
    reward: d.reward,
    status: d.status,
    tags: (() => {
      try {
        const arr = JSON.parse(d.tags ?? "[]");
        return Array.isArray(arr) ? arr : [];
      } catch {
        return [];
      }
    })(),
    location: d.location,
    deadline: d.deadline.toISOString(),
    publishedAt: d.publishedAt.toISOString(),
    views: d.views,
    takenDownAt: d.takenDownAt ? d.takenDownAt.toISOString() : null,
    takeDownReason: d.takeDownReason,
    publisherId: d.publisherId,
    publisher: d.publisher
      ? {
          id: d.publisher.id,
          name: d.publisher.name,
          avatar: d.publisher.avatar,
          email: d.publisher.email,
        }
      : null,
    _count: d._count ?? { applications: 0, comments: 0 },
  };
}

function formatComment(c: any) {
  return {
    id: c.id,
    content: c.content,
    rating: c.rating,
    createdAt: c.createdAt.toISOString(),
    demandId: c.demandId,
    authorId: c.authorId,
    author: c.author
      ? {
          id: c.author.id,
          name: c.author.name,
          avatar: c.author.avatar,
          email: c.author.email,
        }
      : null,
    demand: c.demand
      ? { id: c.demand.id, title: c.demand.title }
      : null,
  };
}

function formatReport(r: any) {
  return {
    id: r.id,
    reason: r.reason,
    description: r.description,
    status: r.status,
    resolution: r.resolution,
    targetType: r.targetType,
    targetId: r.targetId,
    createdAt: r.createdAt.toISOString(),
    resolvedAt: r.resolvedAt ? r.resolvedAt.toISOString() : null,
    reporterId: r.reporterId,
    reporter: r.reporter
      ? {
          id: r.reporter.id,
          name: r.reporter.name,
          email: r.reporter.email,
        }
      : null,
  };
}

function formatAuditLog(a: any) {
  return {
    id: a.id,
    action: a.action,
    targetType: a.targetType,
    targetId: a.targetId,
    detail: a.detail,
    ip: a.ip,
    createdAt: a.createdAt.toISOString(),
    adminId: a.adminId,
    admin: a.admin
      ? { id: a.admin.id, name: a.admin.name, email: a.admin.email }
      : null,
  };
}

@Injectable()
export class AdminService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationsService: NotificationsService,
  ) {}

  /** 写审计日志（不抛错） */
  private async writeAudit(params: {
    adminId: string;
    action: AuditAction;
    targetType?: string;
    targetId?: string;
    detail?: Record<string, unknown>;
    ip?: string;
  }) {
    try {
      await this.prisma.auditLog.create({
        data: {
          adminId: params.adminId,
          action: params.action,
          targetType: params.targetType ?? null,
          targetId: params.targetId ?? null,
          detail: params.detail ? JSON.stringify(params.detail) : null,
          ip: params.ip ?? null,
        },
      });
    } catch {
      // 审计日志失败不影响主流程
    }
  }

  // ============================================================
  // 数据看板
  // ============================================================

  async getStats() {
    const [
      userCount,
      demandCount,
      openDemandCount,
      applicationCount,
      commentCount,
      pendingReportCount,
      transactionCount,
      coinsInCirculation,
      recent7dUsers,
      recent7dDemands,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.demand.count(),
      this.prisma.demand.count({ where: { status: "OPEN" } }),
      this.prisma.application.count(),
      this.prisma.comment.count(),
      this.prisma.report.count({ where: { status: "PENDING" } }),
      this.prisma.transaction.count(),
      this.prisma.user.aggregate({ _sum: { coins: true } }),
      this.prisma.user.count({
        where: {
          createdAt: { gte: new Date(Date.now() - 7 * 86400_000) },
        },
      }),
      this.prisma.demand.count({
        where: {
          publishedAt: { gte: new Date(Date.now() - 7 * 86400_000) },
        },
      }),
    ]);

    return {
      users: userCount,
      demands: demandCount,
      openDemands: openDemandCount,
      applications: applicationCount,
      comments: commentCount,
      pendingReports: pendingReportCount,
      transactions: transactionCount,
      coinsInCirculation: coinsInCirculation._sum.coins ?? 0,
      recent7dUsers,
      recent7dDemands,
    };
  }

  // ============================================================
  // 用户管理
  // ============================================================

  async listUsers(query: AdminUserListDto) {
    const { page = 1, pageSize = 20, role, banned, keyword } = query;
    const where: any = {};
    if (role) where.role = role;
    const bannedBool = toBool(banned);
    if (bannedBool === true) where.bannedAt = { not: null };
    else if (bannedBool === false) where.bannedAt = null;
    if (keyword && keyword.trim()) {
      const kw = keyword.trim();
      where.OR = [
        { email: { contains: kw } },
        { name: { contains: kw } },
      ];
    }

    const [items, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
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
          emailVerified: true,
          bannedAt: true,
          banReason: true,
          createdAt: true,
          _count: {
            select: { demands: true, applications: true, comments: true },
          },
        },
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      items: items.map(formatUser),
      total,
      page,
      pageSize,
    };
  }

  async banUser(adminId: string, userId: string, dto: BanUserDto, ip?: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException("用户不存在");
    if (user.role === "ADMIN") {
      throw new ForbiddenException("不能封禁管理员账号");
    }
    if (user.bannedAt) {
      throw new BadRequestException("该用户已被封禁");
    }
    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: { bannedAt: new Date(), banReason: dto.reason },
      select: { id: true, name: true, bannedAt: true, banReason: true },
    });
    await this.writeAudit({
      adminId,
      action: "USER_BAN",
      targetType: "USER",
      targetId: userId,
      detail: { reason: dto.reason },
      ip,
    });
    this.notificationsService.notifySystem({
      userId,
      title: "账号已被封禁",
      content: `你的账号已被管理员封禁，原因：${dto.reason}。如有异议请联系客服。`,
    });
    return updated;
  }

  async unbanUser(adminId: string, userId: string, ip?: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException("用户不存在");
    if (!user.bannedAt) {
      throw new BadRequestException("该用户未被封禁");
    }
    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: { bannedAt: null, banReason: null },
      select: { id: true, name: true, bannedAt: true, banReason: true },
    });
    await this.writeAudit({
      adminId,
      action: "USER_UNBAN",
      targetType: "USER",
      targetId: userId,
      ip,
    });
    this.notificationsService.notifySystem({
      userId,
      title: "账号已解封",
      content: "你的账号已被管理员解封，可以正常使用平台服务。",
    });
    return updated;
  }

  async adjustCoins(
    adminId: string,
    userId: string,
    dto: AdjustCoinsDto,
    ip?: string,
  ) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException("用户不存在");
    if (user.coins + dto.amount < 0) {
      throw new BadRequestException(
        `调整后余额不能为负，当前 ${user.coins}，调整 ${dto.amount}`,
      );
    }
    // 事务：更新余额 + 写流水
    const result = await this.prisma.$transaction(async (tx) => {
      const updated = await tx.user.update({
        where: { id: userId },
        data: { coins: { increment: dto.amount } },
        select: { id: true, coins: true },
      });
      await tx.transaction.create({
        data: {
          userId,
          amount: dto.amount,
          balance: updated.coins,
          type: "ADMIN_ADJUST",
          refType: "ADMIN",
          refId: adminId,
          remark: dto.remark ?? `管理员调整 ${dto.amount > 0 ? "+" : ""}${dto.amount}`,
        },
      });
      return updated;
    });
    await this.writeAudit({
      adminId,
      action: "USER_COIN_ADJUST",
      targetType: "USER",
      targetId: userId,
      detail: { amount: dto.amount, remark: dto.remark, balanceAfter: result.coins },
      ip,
    });
    this.notificationsService.notifyCoinAdjusted({
      userId,
      title: "拾光币变动",
      content:
        dto.amount > 0
          ? `管理员为你充值 ${dto.amount} 拾光币，当前余额 ${result.coins}。`
          : `管理员扣减了 ${Math.abs(dto.amount)} 拾光币，当前余额 ${result.coins}。`,
    });
    return result;
  }

  async adjustCredit(
    adminId: string,
    userId: string,
    dto: AdjustCreditDto,
    ip?: string,
  ) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException("用户不存在");
    if (user.creditScore + dto.delta < 0) {
      throw new BadRequestException(
        `调整后信用分不能为负，当前 ${user.creditScore}，调整 ${dto.delta}`,
      );
    }
    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: { creditScore: { increment: dto.delta } },
      select: { id: true, creditScore: true },
    });
    await this.writeAudit({
      adminId,
      action: "USER_CREDIT_ADJUST",
      targetType: "USER",
      targetId: userId,
      detail: { delta: dto.delta, remark: dto.remark, creditAfter: updated.creditScore },
      ip,
    });
    this.notificationsService.notifySystem({
      userId,
      title: "信用分变动",
      content:
        dto.delta > 0
          ? `管理员为你增加 ${dto.delta} 信用分，当前 ${updated.creditScore}。`
          : `管理员扣减了 ${Math.abs(dto.delta)} 信用分，当前 ${updated.creditScore}。`,
    });
    return updated;
  }

  // ============================================================
  // 需求管理
  // ============================================================

  async listDemands(query: AdminDemandListDto) {
    const { page = 1, pageSize = 20, status, category, takenDown, keyword } =
      query;
    const where: any = {};
    if (status) where.status = status;
    if (category) where.category = category;
    const takenDownBool = toBool(takenDown);
    if (takenDownBool === true) where.takenDownAt = { not: null };
    else if (takenDownBool === false) where.takenDownAt = null;
    if (keyword && keyword.trim()) {
      const kw = keyword.trim();
      where.OR = [{ title: { contains: kw } }, { desc: { contains: kw } }];
    }

    const [items, total] = await Promise.all([
      this.prisma.demand.findMany({
        where,
        orderBy: { publishedAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: {
          publisher: {
            select: { id: true, name: true, avatar: true, email: true },
          },
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

  async takeDownDemand(
    adminId: string,
    demandId: string,
    dto: TakeDownDemandDto,
    ip?: string,
  ) {
    const demand = await this.prisma.demand.findUnique({
      where: { id: demandId },
    });
    if (!demand) throw new NotFoundException("需求不存在");
    if (demand.takenDownAt) {
      throw new BadRequestException("该需求已被下架");
    }
    const updated = await this.prisma.demand.update({
      where: { id: demandId },
      data: { takenDownAt: new Date(), takeDownReason: dto.reason },
      select: { id: true, takenDownAt: true, takeDownReason: true },
    });
    await this.writeAudit({
      adminId,
      action: "DEMAND_TAKE_DOWN",
      targetType: "DEMAND",
      targetId: demandId,
      detail: { reason: dto.reason, title: demand.title },
      ip,
    });
    this.notificationsService.notifySystem({
      userId: demand.publisherId,
      title: "需求已被下架",
      content: `你的需求「${demand.title}」已被管理员下架，原因：${dto.reason}。如有异议请联系客服。`,
      link: `/demands/${demandId}`,
    });
    return updated;
  }

  async restoreDemand(adminId: string, demandId: string, ip?: string) {
    const demand = await this.prisma.demand.findUnique({
      where: { id: demandId },
    });
    if (!demand) throw new NotFoundException("需求不存在");
    if (!demand.takenDownAt) {
      throw new BadRequestException("该需求未被下架");
    }
    const updated = await this.prisma.demand.update({
      where: { id: demandId },
      data: { takenDownAt: null, takeDownReason: null },
      select: { id: true, takenDownAt: true, takeDownReason: true },
    });
    await this.writeAudit({
      adminId,
      action: "DEMAND_RESTORE",
      targetType: "DEMAND",
      targetId: demandId,
      detail: { title: demand.title },
      ip,
    });
    this.notificationsService.notifySystem({
      userId: demand.publisherId,
      title: "需求已恢复",
      content: `你的需求「${demand.title}」已被管理员恢复显示。`,
      link: `/demands/${demandId}`,
    });
    return updated;
  }

  // ============================================================
  // 评论管理
  // ============================================================

  async listComments(query: AdminCommentListDto) {
    const { page = 1, pageSize = 20, keyword } = query;
    const where: any = {};
    if (keyword && keyword.trim()) {
      where.content = { contains: keyword.trim() };
    }
    const [items, total] = await Promise.all([
      this.prisma.comment.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: {
          author: {
            select: { id: true, name: true, avatar: true, email: true },
          },
          demand: { select: { id: true, title: true } },
        },
      }),
      this.prisma.comment.count({ where }),
    ]);
    return {
      items: items.map(formatComment),
      total,
      page,
      pageSize,
    };
  }

  async deleteComment(adminId: string, commentId: string, ip?: string) {
    const comment = await this.prisma.comment.findUnique({
      where: { id: commentId },
    });
    if (!comment) throw new NotFoundException("评论不存在");
    await this.prisma.comment.delete({ where: { id: commentId } });
    await this.writeAudit({
      adminId,
      action: "COMMENT_DELETE",
      targetType: "COMMENT",
      targetId: commentId,
      detail: { content: comment.content.slice(0, 100) },
      ip,
    });
    this.notificationsService.notifySystem({
      userId: comment.authorId,
      title: "评论已被删除",
      content: "你的一条评论因违反社区规范被管理员删除。",
    });
    return { id: commentId };
  }

  // ============================================================
  // 举报管理
  // ============================================================

  async listReports(query: AdminReportListDto) {
    const { page = 1, pageSize = 20, status, targetType } = query;
    const where: any = {};
    if (status) where.status = status;
    if (targetType) where.targetType = targetType;

    const [items, total] = await Promise.all([
      this.prisma.report.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: {
          reporter: {
            select: { id: true, name: true, email: true },
          },
        },
      }),
      this.prisma.report.count({ where }),
    ]);

    return {
      items: items.map(formatReport),
      total,
      page,
      pageSize,
    };
  }

  async resolveReport(
    adminId: string,
    reportId: string,
    dto: ResolveReportDto,
    ip?: string,
  ) {
    const report = await this.prisma.report.findUnique({
      where: { id: reportId },
    });
    if (!report) throw new NotFoundException("举报不存在");
    if (report.status !== "PENDING") {
      throw new BadRequestException("该举报已被处理");
    }
    const updated = await this.prisma.report.update({
      where: { id: reportId },
      data: {
        status: "RESOLVED",
        resolution: dto.resolution ?? null,
        resolvedAt: new Date(),
      },
    });
    await this.writeAudit({
      adminId,
      action: "REPORT_RESOLVE",
      targetType: "REPORT",
      targetId: reportId,
      detail: { reason: report.reason, targetType: report.targetType, resolution: dto.resolution },
      ip,
    });
    this.notificationsService.notifyReportResolved({
      reporterId: report.reporterId,
      title: "举报已处理",
      content: `你提交的举报（${report.targetType}）已被管理员受理${
        dto.resolution ? `：${dto.resolution}` : "。"
      }`,
    });
    return updated;
  }

  async dismissReport(
    adminId: string,
    reportId: string,
    dto: ResolveReportDto,
    ip?: string,
  ) {
    const report = await this.prisma.report.findUnique({
      where: { id: reportId },
    });
    if (!report) throw new NotFoundException("举报不存在");
    if (report.status !== "PENDING") {
      throw new BadRequestException("该举报已被处理");
    }
    const updated = await this.prisma.report.update({
      where: { id: reportId },
      data: {
        status: "DISMISSED",
        resolution: dto.resolution ?? null,
        resolvedAt: new Date(),
      },
    });
    await this.writeAudit({
      adminId,
      action: "REPORT_DISMISS",
      targetType: "REPORT",
      targetId: reportId,
      detail: { reason: report.reason, targetType: report.targetType, resolution: dto.resolution },
      ip,
    });
    this.notificationsService.notifyReportResolved({
      reporterId: report.reporterId,
      title: "举报已驳回",
      content: `你提交的举报（${report.targetType}）被管理员驳回${
        dto.resolution ? `：${dto.resolution}` : "。"
      }`,
    });
    return updated;
  }

  // ============================================================
  // 审计日志
  // ============================================================

  async listAuditLogs(query: AdminAuditLogListDto) {
    const { page = 1, pageSize = 20, action } = query;
    const where: any = {};
    if (action) where.action = action;

    const [items, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: {
          admin: {
            select: { id: true, name: true, email: true },
          },
        },
      }),
      this.prisma.auditLog.count({ where }),
    ]);
    return {
      items: items.map(formatAuditLog),
      total,
      page,
      pageSize,
    };
  }
}
