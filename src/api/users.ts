import client from "./client";
import type {
  Application,
  Demand,
  Paginated,
  Transaction,
  TransactionType,
  UpdateUserPayload,
  User,
} from "@/types/api";

export interface QueryTransactionsParams {
  type?: TransactionType;
  page?: number;
  pageSize?: number;
}

export const usersApi = {
  /** 个人资料 */
  getMe(): Promise<User> {
    return client.get("/users/me");
  },
  /** 更新个人资料 */
  updateMe(payload: UpdateUserPayload): Promise<User> {
    return client.patch("/users/me", payload);
  },
  /** 我发布的需求 */
  myDemands(): Promise<{ items: Demand[] }> {
    return client.get("/users/me/demands");
  },
  /** 我的接单 */
  myApplications(): Promise<{ items: Application[] }> {
    return client.get("/users/me/applications");
  },
  /** 我的拾光币流水 */
  myTransactions(
    params: QueryTransactionsParams = {},
  ): Promise<Paginated<Transaction>> {
    return client.get("/users/me/transactions", { params });
  },
};
