import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { QueryNotificationsDto } from "./dto/query-notifications.dto";

/**
 * 通知类型枚举（与 schema.prisma 中 Notification.type 对应）
 * APPLICATION_ACCEPTED | APPLICATION_REJECTED | DEMAND_COMPLETED
 * COMMENT_POSTED | SYSTEM | REPORT_RESOLVED | COIN_ADJUSTED
 */
export type NotificationType =
  | "APPLICATION_ACCEPTED"
  | "APPLICATION_REJECTED"
  | "DEMAND_COMPLETED"
  | "COMMENT_POSTED"
  | "SYSTEM"
  | "REPORT_RESOLVED"
  | "COIN_ADJUSTED";

function formatNotification(n: any) {
  return {
    id: n.id,
    type: n.type,
    title: n.title,
    content: n.content,
    link: n.link,
    read: n.read,
    createdAt: n.createdAt.toISOString(),
    userId: n.userId,
  };
}

@Injectable()
export class NotificationsService {
  constructor(private readonly prisma: PrismaService) {}

  /** 当前用户的通知列表 */
  async list(userId: string, query: QueryNotificationsDto) {
    const { unreadOnly, page = 1, pageSize = 20 } = query;
    const where: any = { userId };
    if (unreadOnly) where.read = false;

    const [items, total, unreadCount] = await Promise.all([
      this.prisma.notification.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.notification.count({ where }),
      this.prisma.notification.count({
        where: { userId, read: false },
      }),
    ]);

    return {
      items: items.map(formatNotification),
      total,
      page,
      pageSize,
      unreadCount,
    };
  }

  /** 未读数量（轻量接口，用于 Navbar 红点轮询） */
  async unreadCount(userId: string) {
    const count = await this.prisma.notification.count({
      where: { userId, read: false },
    });
    return { count };
  }

  /** 标记单条已读 */
  async markRead(userId: string, id: string) {
    const notif = await this.prisma.notification.findUnique({ where: { id } });
    if (!notif) return { id, read: false };
    if (notif.userId !== userId) return { id, read: notif.read };
    if (notif.read) return { id, read: true };
    await this.prisma.notification.update({
      where: { id },
      data: { read: true },
    });
    return { id, read: true };
  }

  /** 全部标记已读 */
  async markAllRead(userId: string) {
    const result = await this.prisma.notification.updateMany({
      where: { userId, read: false },
      data: { read: true },
    });
    return { updated: result.count };
  }

  // ============================================================
  // 内部触发通知的方法（供其他 service 调用）
  // 这些方法不抛错（失败只记日志），保证主业务事务不被影响
  // ============================================================

  /**
   * 创建一条通知（内部用）
   * 失败时不抛错，避免影响主流程
   */
  async send(params: {
    userId: string;
    type: NotificationType;
    title: string;
    content: string;
    link?: string | null;
  }): Promise<void> {
    try {
      await this.prisma.notification.create({
        data: {
          userId: params.userId,
          type: params.type,
          title: params.title,
          content: params.content,
          link: params.link ?? null,
        },
      });
    } catch {
      // 通知失败不影响主流程
    }
  }

  /** 接单被接受 */
  notifyApplicationAccepted(params: {
    helperId: string;
    demandTitle: string;
    demandId: string;
  }) {
    return this.send({
      userId: params.helperId,
      type: "APPLICATION_ACCEPTED",
      title: "接单申请已通过",
      content: `你的申请已被接受：「${params.demandTitle}」`,
      link: `/demands/${params.demandId}`,
    });
  }

  /** 接单被拒绝 */
  notifyApplicationRejected(params: {
    helperId: string;
    demandTitle: string;
    demandId: string;
  }) {
    return this.send({
      userId: params.helperId,
      type: "APPLICATION_REJECTED",
      title: "接单申请未通过",
      content: `你的申请未被接受：「${params.demandTitle}」`,
      link: `/demands/${params.demandId}`,
    });
  }

  /** 需求已完成（给帮手） */
  notifyDemandCompleted(params: {
    helperId: string;
    demandTitle: string;
    demandId: string;
    reward: number;
  }) {
    return this.send({
      userId: params.helperId,
      type: "DEMAND_COMPLETED",
      title: "需求已完成",
      content: `「${params.demandTitle}」已被标记完成，获得 ${params.reward} 拾光币`,
      link: `/demands/${params.demandId}`,
    });
  }

  /** 新评论（给需求发布者） */
  notifyCommentPosted(params: {
    publisherId: string;
    authorName: string;
    demandTitle: string;
    demandId: string;
  }) {
    if (!params.publisherId) return Promise.resolve();
    return this.send({
      userId: params.publisherId,
      type: "COMMENT_POSTED",
      title: "收到新评论",
      content: `${params.authorName} 评论了你的需求：「${params.demandTitle}」`,
      link: `/demands/${params.demandId}`,
    });
  }

  /** 系统通知 */
  notifySystem(params: {
    userId: string;
    title: string;
    content: string;
    link?: string | null;
  }) {
    return this.send({
      userId: params.userId,
      type: "SYSTEM",
      title: params.title,
      content: params.content,
      link: params.link ?? null,
    });
  }

  /** 举报处理结果通知（给举报人） */
  notifyReportResolved(params: {
    reporterId: string;
    title: string;
    content: string;
  }) {
    return this.send({
      userId: params.reporterId,
      type: "REPORT_RESOLVED",
      title: params.title,
      content: params.content,
      link: null,
    });
  }

  /** 拾光币变动通知 */
  notifyCoinAdjusted(params: {
    userId: string;
    title: string;
    content: string;
  }) {
    return this.send({
      userId: params.userId,
      type: "COIN_ADJUSTED",
      title: params.title,
      content: params.content,
      link: "/profile",
    });
  }
}
