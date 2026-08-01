import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  adminApi,
  type AdminAuditLogListParams,
  type AdminCommentListParams,
  type AdminDemandListParams,
  type AdminReportListParams,
  type AdminUserListParams,
  type AdjustCoinsPayload,
  type AdjustCreditPayload,
  type BanUserPayload,
  type ResolveReportPayload,
  type TakeDownDemandPayload,
} from "@/api/admin";

const KEY = "admin";

// ============================================================
// 数据看板
// ============================================================

export function useAdminStatsQuery() {
  return useQuery({
    queryKey: [KEY, "stats"],
    queryFn: () => adminApi.getStats(),
    refetchInterval: 60_000, // 每分钟刷新
  });
}

// ============================================================
// 用户管理
// ============================================================

export function useAdminUsersQuery(params: AdminUserListParams) {
  return useQuery({
    queryKey: [KEY, "users", params],
    queryFn: () => adminApi.listUsers(params),
  });
}

export function useBanUserMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: BanUserPayload }) =>
      adminApi.banUser(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [KEY, "users"] });
      qc.invalidateQueries({ queryKey: [KEY, "stats"] });
    },
  });
}

export function useUnbanUserMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminApi.unbanUser(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [KEY, "users"] });
      qc.invalidateQueries({ queryKey: [KEY, "stats"] });
    },
  });
}

export function useAdjustCoinsMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: AdjustCoinsPayload;
    }) => adminApi.adjustCoins(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [KEY, "users"] });
      qc.invalidateQueries({ queryKey: [KEY, "stats"] });
    },
  });
}

export function useAdjustCreditMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: AdjustCreditPayload;
    }) => adminApi.adjustCredit(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [KEY, "users"] });
      qc.invalidateQueries({ queryKey: [KEY, "stats"] });
    },
  });
}

// ============================================================
// 需求管理
// ============================================================

export function useAdminDemandsQuery(params: AdminDemandListParams) {
  return useQuery({
    queryKey: [KEY, "demands", params],
    queryFn: () => adminApi.listDemands(params),
  });
}

export function useTakeDownDemandMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: TakeDownDemandPayload;
    }) => adminApi.takeDownDemand(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [KEY, "demands"] });
      qc.invalidateQueries({ queryKey: [KEY, "stats"] });
    },
  });
}

export function useRestoreDemandMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminApi.restoreDemand(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [KEY, "demands"] });
      qc.invalidateQueries({ queryKey: [KEY, "stats"] });
    },
  });
}

// ============================================================
// 评论管理
// ============================================================

export function useAdminCommentsQuery(params: AdminCommentListParams) {
  return useQuery({
    queryKey: [KEY, "comments", params],
    queryFn: () => adminApi.listComments(params),
  });
}

export function useDeleteCommentMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminApi.deleteComment(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [KEY, "comments"] });
      qc.invalidateQueries({ queryKey: [KEY, "stats"] });
    },
  });
}

// ============================================================
// 举报管理
// ============================================================

export function useAdminReportsQuery(params: AdminReportListParams) {
  return useQuery({
    queryKey: [KEY, "reports", params],
    queryFn: () => adminApi.listReports(params),
  });
}

export function useResolveReportMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload = {},
    }: {
      id: string;
      payload?: ResolveReportPayload;
    }) => adminApi.resolveReport(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [KEY, "reports"] });
      qc.invalidateQueries({ queryKey: [KEY, "stats"] });
    },
  });
}

export function useDismissReportMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload = {},
    }: {
      id: string;
      payload?: ResolveReportPayload;
    }) => adminApi.dismissReport(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [KEY, "reports"] });
      qc.invalidateQueries({ queryKey: [KEY, "stats"] });
    },
  });
}

// ============================================================
// 审计日志
// ============================================================

export function useAdminAuditLogsQuery(params: AdminAuditLogListParams) {
  return useQuery({
    queryKey: [KEY, "audit-logs", params],
    queryFn: () => adminApi.listAuditLogs(params),
  });
}
