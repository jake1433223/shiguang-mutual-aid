import client from "./client";
import type {
  CreateReportPayload,
  Report,
} from "@/types/api";

export const reportsApi = {
  /** 创建举报 */
  create(payload: CreateReportPayload): Promise<Report> {
    return client.post("/reports", payload);
  },
  /** 我发起的举报列表 */
  myReports(): Promise<{ items: Report[] }> {
    return client.get("/reports/mine");
  },
};
