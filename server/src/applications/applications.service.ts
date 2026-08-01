import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { NotificationsService } from "../notifications/notifications.service";
import { CreateApplicationDto, UpdateApplicationDto, ApplicationStatusEnum } from "./dto/update-application.dto";

function formatApplication(a: any) {
  return {
    id: a.id,
    status: a.status,
    message: a.message,
    createdAt: a.createdAt.toISOString(),
    updatedAt: a.updatedAt.toISOString(),
    demandId: a.demandId,
    helperId: a.helperId,
    demand: a.demand
      ? {
          id: a.demand.id,
          title: a.demand.title,
          category: a.demand.category,
          reward: a.demand.reward,
          status: a.demand.status,
          deadline: a.demand.deadline.toISOString(),
          publisherId: a.demand.publisherId,
          publisher: a.demand.publisher
            ? {
                id: a.demand.publisher.id,
                name: a.demand.publisher.name,
                avatar: a.demand.publisher.avatar,
              }
            : null,
        }
      : null,
    helper: a.helper
      ? {
          id: a.helper.id,
          name: a.helper.name,
          avatar: a.helper.avatar,
          bio: a.helper.bio,
          tier: a.helper.tier,
          creditScore: a.helper.creditScore,
        }
      : null,
  };
}

@Injectable()
export class ApplicationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationsService: NotificationsService,
  ) {}

  /** 接单 */
  async create(helperId: string, demandId: string, dto: CreateApplicationDto) {
    const demand = await this.prisma.demand.findUnique({
      where: { id: demandId },
      include: { applications: true },
    });
    if (!demand) throw new NotFoundException("需求不存在");
    if (demand.publisherId === helperId) {
      throw new ForbiddenException("不能接自己发布的需求");
    }
    if (demand.status !== "OPEN") {
      throw new BadRequestException("该需求已不在招募中");
    }

    const exists = demand.applications.find((a) => a.helperId === helperId);
    if (exists) throw new ConflictException("已申请过该需求");

    const application = await this.prisma.application.create({
      data: {
        demandId,
        helperId,
        message: dto.message ?? null,
        status: "PENDING",
      },
      include: {
        demand: { include: { publisher: { select: { id: true, name: true, avatar: true } } } },
        helper: { select: { id: true, name: true, avatar: true, bio: true, tier: true, creditScore: true } },
      },
    });

    return formatApplication(application);
  }

  /** 我的接单列表 */
  async myList(helperId: string, status?: string) {
    const where: any = { helperId };
    if (status) where.status = status;
    const items = await this.prisma.application.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        demand: {
          include: {
            publisher: { select: { id: true, name: true, avatar: true } },
          },
        },
      },
    });
    return { items: items.map(formatApplication) };
  }

  /** 需求下的所有申请（仅发布者可见） */
  async listByDemand(userId: string, demandId: string) {
    const demand = await this.prisma.demand.findUnique({ where: { id: demandId } });
    if (!demand) throw new NotFoundException("需求不存在");
    if (demand.publisherId !== userId) {
      throw new ForbiddenException("仅需求发布者可查看申请列表");
    }
    const items = await this.prisma.application.findMany({
      where: { demandId },
      orderBy: { createdAt: "asc" },
      include: {
        helper: { select: { id: true, name: true, avatar: true, bio: true, tier: true, creditScore: true } },
      },
    });
    return { items: items.map(formatApplication) };
  }

  /** 接受/拒绝/完成申请 */
  async update(userId: string, applicationId: string, dto: UpdateApplicationDto) {
    const application = await this.prisma.application.findUnique({
      where: { id: applicationId },
      include: { demand: true },
    });
    if (!application) throw new NotFoundException("申请不存在");

    const demand = application.demand;
    const isPublisher = demand.publisherId === userId;

    if (dto.status === ApplicationStatusEnum.ACCEPTED) {
      if (!isPublisher) throw new ForbiddenException("仅发布者可接受申请");
      if (demand.status !== "OPEN") {
        throw new BadRequestException("该需求已不在招募中");
      }
      if (application.status !== "PENDING") {
        throw new BadRequestException("仅待处理申请可被接受");
      }

      // 事务：接受当前申请 + 拒绝其他 PENDING + 需求转 IN_PROGRESS
      const updated = await this.prisma.$transaction(async (tx) => {
        const app = await tx.application.update({
          where: { id: applicationId },
          data: { status: "ACCEPTED" },
          include: {
            demand: { include: { publisher: { select: { id: true, name: true, avatar: true } } } },
            helper: { select: { id: true, name: true, avatar: true, bio: true, tier: true, creditScore: true } },
          },
        });
        // 其他 PENDING 申请标记为 REJECTED（拿一份 helperId 列表以便发通知）
        const rejected = await tx.application.findMany({
          where: { demandId: demand.id, status: "PENDING", id: { not: applicationId } },
          select: { helperId: true },
        });
        if (rejected.length > 0) {
          await tx.application.updateMany({
            where: { demandId: demand.id, status: "PENDING", id: { not: applicationId } },
            data: { status: "REJECTED" },
          });
        }
        // 需求转为进行中
        await tx.demand.update({ where: { id: demand.id }, data: { status: "IN_PROGRESS" } });
        return { app, rejectedHelperIds: rejected.map((r) => r.helperId) };
      });

      // 事务外发通知（不阻塞主流程）
      this.notificationsService.notifyApplicationAccepted({
        helperId: application.helperId,
        demandTitle: demand.title,
        demandId: demand.id,
      });
      for (const helperId of updated.rejectedHelperIds) {
        this.notificationsService.notifyApplicationRejected({
          helperId,
          demandTitle: demand.title,
          demandId: demand.id,
        });
      }

      return formatApplication(updated.app);
    }

    if (dto.status === ApplicationStatusEnum.REJECTED) {
      if (!isPublisher) throw new ForbiddenException("仅发布者可拒绝申请");
      if (application.status !== "PENDING") {
        throw new BadRequestException("仅待处理申请可被拒绝");
      }
      const updated = await this.prisma.application.update({
        where: { id: applicationId },
        data: { status: "REJECTED" },
        include: {
          demand: { include: { publisher: { select: { id: true, name: true, avatar: true } } } },
          helper: { select: { id: true, name: true, avatar: true, bio: true, tier: true, creditScore: true } },
        },
      });
      this.notificationsService.notifyApplicationRejected({
        helperId: application.helperId,
        demandTitle: demand.title,
        demandId: demand.id,
      });
      return formatApplication(updated);
    }

    if (dto.status === ApplicationStatusEnum.COMPLETED) {
      // 完成订单：发布者或帮手均可触发；此处限定为发布者
      if (!isPublisher) throw new ForbiddenException("仅发布者可标记完成");
      if (application.status !== "ACCEPTED") {
        throw new BadRequestException("仅已接受申请可标记完成");
      }
      if (demand.status !== "IN_PROGRESS") {
        throw new BadRequestException("需求未在进行中，无法完成");
      }

      const updated = await this.prisma.$transaction(async (tx) => {
        const app = await tx.application.update({
          where: { id: applicationId },
          data: { status: "COMPLETED" },
          include: {
            demand: { include: { publisher: { select: { id: true, name: true, avatar: true } } } },
            helper: { select: { id: true, name: true, avatar: true, bio: true, tier: true, creditScore: true } },
          },
        });
        // 需求转为 DONE
        await tx.demand.update({ where: { id: demand.id }, data: { status: "DONE" } });
        // 给帮手发放奖励
        const helperUpdated = await tx.user.update({
          where: { id: application.helperId },
          data: {
            coins: { increment: demand.reward },
            creditScore: { increment: 1 },
          },
          select: { coins: true },
        });
        // 写拾光币流水：DEMAND_REWARD（帮手收入）
        await tx.transaction.create({
          data: {
            userId: application.helperId,
            amount: demand.reward,
            balance: helperUpdated.coins,
            type: "DEMAND_REWARD",
            refType: "APPLICATION",
            refId: applicationId,
            remark: `完成需求「${demand.title}」获得奖励`,
          },
        });
        // 发布者信用 +1
        await tx.user.update({
          where: { id: demand.publisherId },
          data: { creditScore: { increment: 1 } },
        });
        return app;
      });
      // 通知帮手：需求已完成
      this.notificationsService.notifyDemandCompleted({
        helperId: application.helperId,
        demandTitle: demand.title,
        demandId: demand.id,
        reward: demand.reward,
      });
      return formatApplication(updated);
    }

    throw new BadRequestException("不支持的 status 值");
  }

  /** 取消申请（帮手本人，仅 PENDING 可取消） */
  async cancel(userId: string, applicationId: string) {
    const application = await this.prisma.application.findUnique({ where: { id: applicationId } });
    if (!application) throw new NotFoundException("申请不存在");
    if (application.helperId !== userId) throw new ForbiddenException("无权操作他人申请");
    if (application.status !== "PENDING") {
      throw new BadRequestException("仅待处理申请可被取消");
    }
    const updated = await this.prisma.application.update({
      where: { id: applicationId },
      data: { status: "CANCELLED" },
      include: {
        demand: { include: { publisher: { select: { id: true, name: true, avatar: true } } } },
        helper: { select: { id: true, name: true, avatar: true, bio: true, tier: true, creditScore: true } },
      },
    });
    return formatApplication(updated);
  }
}
