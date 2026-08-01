import client from "./client";
import type { Category } from "@/types/api";

export const categoriesApi = {
  /** 分类列表 + 每分类 OPEN 需求数 + 帮手数 */
  list(): Promise<{ items: Category[] }> {
    return client.get("/categories");
  },
};
