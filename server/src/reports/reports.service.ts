import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateReportDto } from "./dto/create-report.dto";

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
  };
}

@Injectable()
export class ReportsService {
  constructor(private readonly prisma: PrismaService) {}

  /** 校验目标存在 */
  private async assertTargetExists(targetType: string, targetId: string) {
    if (targetType === "DEMAND") {
      const d = await this.prisma.demand.findUnique({
        where: { id: targetId },
        select: { id: true },
      });
      if (!d) throw new NotFoundException("被举报的需求不存在");
    } else if (targetType === "COMMENT") {
      const c = await this.prisma.comment.findUnique({
        where: { id: targetId },
        select: { id: true },
      });
      if (!c) throw new NotFoundException("被举报的评论不存在");
    } else if (targetType === "USER") {
      const u = await this.prisma.user.findUnique({
        where: { id: targetId },
        select: { id: true },
      });
      if (!u) throw new NotFoundException("被举报的用户不存在");
    } else {
      throw new BadRequestException("无效的举报目标类型");
    }
  }

  /** 创建举报 */
  async create(reporterId: string, dto: CreateReportDto) {
    await this.assertTargetExists(dto.targetType, dto.targetId);

    // 防重复举报同一目标（同一用户对同一目标只允许一条 PENDING）
    if (dto.targetType === "DEMAND" || dto.targetType === "COMMENT" || dto.targetType === "USER") {
      const dup = await this.prisma.report.findFirst({
        where: {
          reporterId,
          targetType: dto.targetType,
          targetId: dto.targetId,
          status: "PENDING",
        },
        select: { id: true },
      });
      if (dup) {
        throw new ForbiddenException("你已举报过该对象，请等待管理员处理");
      }
    }

    const report = await this.prisma.report.create({
      data: {
        reporterId,
        reason: dto.reason,
        description: dto.description ?? null,
        targetType: dto.targetType,
        targetId: dto.targetId,
        status: "PENDING",
      },
    });
    return formatReport(report);
  }

  /** 我发起的举报列表 */
  async myReports(reporterId: string) {
    const items = await this.prisma.report.findMany({
      where: { reporterId },
      orderBy: { createdAt: "desc" },
    });
    return { items: items.map(formatReport) };
  }
}
