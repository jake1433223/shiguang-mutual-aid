import { useQuery } from "@tanstack/react-query";
import { statsApi } from "@/api/stats";
import type { DemandCategory } from "@/types/api";

const KEY = "stats";

/** 首页 Hero 概览数字 */
export function useSiteOverviewQuery() {
  return useQuery({
    queryKey: [KEY, "overview"],
    queryFn: () => statsApi.overview(),
    staleTime: 60_000,
  });
}

/** 分类排行榜 */
export function useLeaderboardQuery(category: DemandCategory) {
  return useQuery({
    queryKey: [KEY, "leaderboard", category],
    queryFn: () => statsApi.leaderboard(category),
    staleTime: 60_000,
  });
}
