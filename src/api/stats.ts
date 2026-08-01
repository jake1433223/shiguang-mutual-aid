import client from "./client";
import type { LeaderboardRow, SiteOverview, DemandCategory } from "@/types/api";

export const statsApi = {
  /** 公开站点概览（首页 Hero 数字） */
  overview(): Promise<SiteOverview> {
    return client.get("/stats/overview");
  },
  /** 分类排行榜 */
  leaderboard(category: DemandCategory): Promise<{ items: LeaderboardRow[] }> {
    return client.get("/stats/leaderboard", { params: { category } });
  },
};
