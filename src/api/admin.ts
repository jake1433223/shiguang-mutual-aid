import client from "./client";
import type {
  Comment,
  Demand,
  Paginated,
  Report,
  Transaction,
  User,
} from "@/types/api";

// ============================================================
// 管理员 API 类型
// ============================================================

export interface AdminStats {
  users: number;
  demands: number;
  openDemands: number;
  applications: number;
  comments: number;
  pendingReports: number;
  transactions: number;
  coinsInCirculation: number;
  recent7dUsers: number;
  recent7dDemands: number;
}

export interface AdminUser extends User {
  _count: { demands: number; applications: number; comments: number };
}

export interface AdminDemand {
  id: string;
  title: string;
  desc: string;
  category: Demand["category"];
  reward: number;
  status: Demand["status"];
  tags: string[];
  location: string | null;
  deadline: string;
  publishedAt: string;
  views: number;
  publisherId: string;
  takenDownAt: string | null;
  takeDownReason: string | null;
  publisher: { id: string; name: string; avatar: string; email: string };
  _count: { applications: number; comments: number };
}

export interface AdminComment {
  id: string;
  content: string;
  rating: number | null;
  createdAt: string;
  demandId: string;
  authorId: string;
  author: { id: string; name: string; avatar: string; email: string } | null;
  demand: { id: string; title: string } | null;
}

export interface AdminReport extends Report {
  reporter: { id: string; name: string; email: string } | null;
}

export interface AdminAuditLog {
  id: string;
  action: string;
  targetType: string | null;
  targetId: string | null;
  detail: string | null;
  ip: string | null;
  createdAt: string;
  adminId: string;
  admin: { id: string; name: string; email: string } | null;
}

// ============================================================
// 查询参数
// ============================================================

export interface AdminUserListParams {
  page?: number;
  pageSize?: number;
  keyword?: string;
  role?: string;
  banned?: "true" | "false";
}

export interface AdminDemandListParams {
  page?: number;
  pageSize?: number;
  keyword?: string;
  status?: string;
  category?: string;
  takenDown?: "true" | "false";
}

export interface AdminCommentListParams {
  page?: number;
  pageSize?: number;
  keyword?: string;
}

export interface AdminReportListParams {
  page?: number;
  pageSize?: number;
  keyword?: string;
  status?: string;
  targetType?: string;
}

export interface AdminAuditLogListParams {
  page?: number;
  pageSize?: number;
  keyword?: string;
  action?: string;
}

// ============================================================
// 写操作 Payload
// ============================================================

export interface BanUserPayload {
  reason: string;
}

export interface AdjustCoinsPayload {
  amount: number;
  remark?: string;
}

export interface AdjustCreditPayload {
  delta: number;
  remark?: string;
}

export interface TakeDownDemandPayload {
  reason: string;
}

export interface ResolveReportPayload {
  resolution?: string;
}

// ============================================================
// Admin API
// ============================================================

export const adminApi = {
  // 数据看板
  getStats(): Promise<AdminStats> {
    return client.get("/admin/stats");
  },

  // 用户管理
  listUsers(params: AdminUserListParams = {}): Promise<Paginated<AdminUser>> {
    return client.get("/admin/users", { params });
  },
  banUser(id: string, payload: BanUserPayload): Promise<Partial<User>> {
    return client.post(`/admin/users/${id}/ban`, payload);
  },
  unbanUser(id: string): Promise<Partial<User>> {
    return client.post(`/admin/users/${id}/unban`);
  },
  adjustCoins(
    id: string,
    payload: AdjustCoinsPayload,
  ): Promise<{ id: string; coins: number }> {
    return client.post(`/admin/users/${id}/coins`, payload);
  },
  adjustCredit(
    id: string,
    payload: AdjustCreditPayload,
  ): Promise<{ id: string; creditScore: number }> {
    return client.post(`/admin/users/${id}/credit`, payload);
  },

  // 需求管理
  listDemands(
    params: AdminDemandListParams = {},
  ): Promise<Paginated<AdminDemand>> {
    return client.get("/admin/demands", { params });
  },
  takeDownDemand(
    id: string,
    payload: TakeDownDemandPayload,
  ): Promise<{ id: string; takenDownAt: string; takeDownReason: string }> {
    return client.post(`/admin/demands/${id}/take-down`, payload);
  },
  restoreDemand(id: string): Promise<{ id: string; takenDownAt: null }> {
    return client.post(`/admin/demands/${id}/restore`);
  },

  // 评论管理
  listComments(
    params: AdminCommentListParams = {},
  ): Promise<Paginated<AdminComment>> {
    return client.get("/admin/comments", { params });
  },
  deleteComment(id: string): Promise<{ id: string }> {
    return client.delete(`/admin/comments/${id}`);
  },

  // 举报管理
  listReports(
    params: AdminReportListParams = {},
  ): Promise<Paginated<AdminReport>> {
    return client.get("/admin/reports", { params });
  },
  resolveReport(
    id: string,
    payload: ResolveReportPayload = {},
  ): Promise<AdminReport> {
    return client.post(`/admin/reports/${id}/resolve`, payload);
  },
  dismissReport(
    id: string,
    payload: ResolveReportPayload = {},
  ): Promise<AdminReport> {
    return client.post(`/admin/reports/${id}/dismiss`, payload);
  },

  // 审计日志
  listAuditLogs(
    params: AdminAuditLogListParams = {},
  ): Promise<Paginated<AdminAuditLog>> {
    return client.get("/admin/audit-logs", { params });
  },
};

// 兼容类型导出（避免其他地方引用 Comment/Transaction 报错）
export type { Comment, Transaction };
