import client from "./client";
import type {
  Application,
  ApplicationStatus,
  CreateApplicationPayload,
  UpdateApplicationPayload,
} from "@/types/api";

export const applicationsApi = {
  /** 我的接单 */
  myList(status?: ApplicationStatus): Promise<{ items: Application[] }> {
    return client.get("/applications/my", { params: status ? { status } : {} });
  },
  /** 接单 */
  create(demandId: string, payload: CreateApplicationPayload = {}): Promise<Application> {
    return client.post(`/applications/${demandId}`, payload);
  },
  /** 某需求下的所有申请（仅发布者） */
  listByDemand(demandId: string): Promise<{ items: Application[] }> {
    return client.get(`/applications/demand/${demandId}`);
  },
  /** 接受 / 拒绝 / 完成 */
  update(id: string, payload: UpdateApplicationPayload): Promise<Application> {
    return client.patch(`/applications/${id}`, payload);
  },
  /** 取消申请（帮手本人） */
  cancel(id: string): Promise<Application> {
    return client.post(`/applications/${id}/cancel`);
  },
};
