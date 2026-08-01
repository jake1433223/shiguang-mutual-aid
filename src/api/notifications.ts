import client from "./client";
import type {
  Notification,
  QueryNotificationsParams,
  NotificationsResult,
} from "@/types/api";

export const notificationsApi = {
  /** 通知列表 */
  list(
    params?: QueryNotificationsParams,
  ): Promise<NotificationsResult> {
    return client.get("/notifications", { params });
  },
  /** 未读数（红点轮询） */
  unreadCount(): Promise<{ count: number }> {
    return client.get("/notifications/unread-count");
  },
  /** 标记单条已读 */
  markRead(id: string): Promise<{ id: string; read: boolean }> {
    return client.post(`/notifications/${id}/read`);
  },
  /** 全部标记已读 */
  markAllRead(): Promise<{ updated: number }> {
    return client.post("/notifications/read-all");
  },
};

export type { Notification };
