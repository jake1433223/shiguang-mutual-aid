import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { notificationsApi } from "@/api/notifications";
import type { QueryNotificationsParams } from "@/types/api";

const NOTIFICATIONS_KEY = ["notifications"] as const;

/** 通知列表 */
export function useNotificationsQuery(params?: QueryNotificationsParams) {
  return useQuery({
    queryKey: [...NOTIFICATIONS_KEY, "list", params ?? null],
    queryFn: () => notificationsApi.list(params),
    staleTime: 30_000,
  });
}

/** 未读数（Navbar 红点轮询） */
export function useUnreadCountQuery(enabled: boolean) {
  return useQuery({
    queryKey: [...NOTIFICATIONS_KEY, "unread-count"],
    queryFn: () => notificationsApi.unreadCount(),
    enabled,
    // 每 30s 刷新一次
    refetchInterval: 30_000,
    // 进入窗口时刷新
    refetchOnWindowFocus: true,
    staleTime: 20_000,
  });
}

/** 标记单条已读 */
export function useMarkReadMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => notificationsApi.markRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_KEY });
    },
  });
}

/** 全部标记已读 */
export function useMarkAllReadMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => notificationsApi.markAllRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_KEY });
    },
  });
}
