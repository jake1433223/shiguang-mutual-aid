import client from "./client";
import type { RechargePackage, RechargeResult } from "@/types/api";

export const rechargeApi = {
  packages(): Promise<RechargePackage[]> {
    return client.get("/recharge/packages");
  },
  create(packageId: string, method: "MOCK" | "ALIPAY" | "WECHAT" = "MOCK"): Promise<RechargeResult> {
    return client.post("/recharge", { packageId, method });
  },
};
