import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { reportsApi } from "@/api/reports";
import type { CreateReportPayload } from "@/types/api";

const REPORTS_KEY = ["reports"] as const;

/** 创建举报 */
export function useCreateReportMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateReportPayload) => reportsApi.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: REPORTS_KEY });
    },
  });
}

/** 我发起的举报 */
export function useMyReportsQuery() {
  return useQuery({
    queryKey: [...REPORTS_KEY, "mine"],
    queryFn: () => reportsApi.myReports(),
    staleTime: 30_000,
  });
}
