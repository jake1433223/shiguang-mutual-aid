import client from "./client";
import type { Comment, CreateCommentPayload, Paginated } from "@/types/api";

export const commentsApi = {
  /** 列表 */
  list(
    demandId: string,
    params: { page?: number; pageSize?: number } = {},
  ): Promise<Paginated<Comment>> {
    return client.get(`/comments/demand/${demandId}`, { params });
  },
  /** 创建评论 */
  create(demandId: string, payload: CreateCommentPayload): Promise<Comment> {
    return client.post(`/comments/demand/${demandId}`, payload);
  },
  /** 删除评论（作者本人） */
  remove(id: string): Promise<{ id: string }> {
    return client.delete(`/comments/${id}`);
  },
};
