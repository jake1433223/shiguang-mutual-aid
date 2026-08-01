import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class StatsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * 公开站点概览统计（首页 Hero 数字）
   * - helpers: 累计帮手数（有过 COMPLETED 接单的不同用户数）
   * - demands: 累计需求总数（含已完成的）
   * - completed: 累计完成互助次数（COMPLETED 接单数）
   * - avgResponseMinutes: 平均响应时间（首条接单申请距发布时间的分钟数中位数）
   */
  async overview() {
    const [helpers, demands, completed, firstApps] = await Promise.all([
      this.prisma.application.findMany({
        where: { status: "COMPLETED" },
        select: { helperId: true },
        distinct: ["helperId"],
      }),
      this.prisma.demand.count(),
      this.prisma.application.count({ where: { status: "COMPLETED" } }),
      // 取最近 200 条最早接单申请，估算平均响应
      this.prisma.application.findMany({
        where: { status: { in: ["ACCEPTED", "COMPLETED"] } },
        orderBy: { createdAt: "asc" },
        take: 200,
        select: {
          createdAt: true,
          demand: { select: { publishedAt: true } },
        },
      }),
    ]);

    // 计算平均响应分钟数
    let avgResponseMinutes = 0;
    if (firstApps.length > 0) {
      const diffs = firstApps
        .filter((a) => a.demand?.publishedAt)
        .map((a) =>
          Math.max(
            0,
            (a.createdAt.getTime() - a.demand!.publishedAt.getTime()) / 60_000,
          ),
        );
      if (diffs.length > 0) {
        avgResponseMinutes = Math.round(
          diffs.reduce((s, n) => s + n, 0) / diffs.length,
        );
      }
    }

    return {
      helpers: helpers.length,
      demands,
      completed,
      avgResponseMinutes,
    };
  }

  /**
   * 分类排行榜（首页 Leaderboards 区块）
   * 按 COMPLETED 接单数排序，取前 N 名帮手
   */
  async leaderboard(category: string, limit = 10) {
    // 聚合：每个 helper 在该分类下的完成数 + 收入总额
    const rows = await this.prisma.application.findMany({
      where: {
        status: "COMPLETED",
        demand: { category },
      },
      select: {
        helperId: true,
        helper: {
          select: {
            id: true,
            name: true,
            avatar: true,
            bio: true,
            tier: true,
            creditScore: true,
          },
        },
      },
    });

    // 应用层聚合
    const map = new Map<
      string,
      {
        helperId: string;
        name: string;
        avatar: string;
        bio: string;
        tier: number;
        creditScore: number;
        answers: number;
      }
    >();
    for (const r of rows) {
      const cur = map.get(r.helperId);
      if (cur) {
        cur.answers += 1;
      } else {
        map.set(r.helperId, {
          helperId: r.helperId,
          name: r.helper.name,
          avatar: r.helper.avatar,
          bio: r.helper.bio,
          tier: r.helper.tier,
          creditScore: r.helper.creditScore,
          answers: 1,
        });
      }
    }

    // 该分类下的提问数（每用户作为 publisher 的需求数）
    const questionRows = await this.prisma.demand.findMany({
      where: { category },
      select: { publisherId: true },
    });
    const questionMap = new Map<string, number>();
    for (const r of questionRows) {
      questionMap.set(r.publisherId, (questionMap.get(r.publisherId) ?? 0) + 1);
    }

    // 计算积分：answers * 20 + questions * 5 + creditScore * 1
    const ranked = Array.from(map.values())
      .map((r) => ({
        id: r.helperId,
        name: r.name,
        avatar: r.avatar,
        bio: r.bio,
        tier: r.tier,
        creditScore: r.creditScore,
        answers: r.answers,
        questions: questionMap.get(r.helperId) ?? 0,
        points: r.answers * 20 + (questionMap.get(r.helperId) ?? 0) * 5 + r.creditScore,
      }))
      .sort((a, b) => b.points - a.points || b.answers - a.answers)
      .slice(0, limit)
      .map((r, i) => ({ rank: i + 1, ...r }));

    return { items: ranked };
  }
}
