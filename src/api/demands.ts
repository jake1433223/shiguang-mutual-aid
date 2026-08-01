import client from "./client";
import type {
  CreateDemandPayload,
  Demand,
  Paginated,
  QueryDemandsParams,
} from "@/types/api";

export const demandsApi = {
  /** 列表 + 筛选 + 分页 */
  list(params: QueryDemandsParams = {}): Promise<Paginated<Demand>> {
    return client.get("/demands", { params });
  },
  /** 详情 */
  detail(id: string): Promise<Demand> {
    return client.get(`/demands/${id}`);
  },
  /** 创建需求 */
  create(payload: CreateDemandPayload): Promise<Demand> {
    return client.post("/demands", payload);
  },
  /** 删除需求 */
  remove(id: string): Promise<{ id: string }> {
    return client.delete(`/demands/${id}`);
  },
};
