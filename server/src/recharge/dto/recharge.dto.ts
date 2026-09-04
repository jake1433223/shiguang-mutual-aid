import { IsIn, IsOptional, IsString } from "class-validator";

export const RECHARGE_PACKAGE_IDS = ["tiny", "basic", "pro", "max"] as const;
export type RechargePackageId = (typeof RECHARGE_PACKAGE_IDS)[number];

export class CreateRechargeDto {
  @IsString()
  @IsIn(RECHARGE_PACKAGE_IDS)
  packageId!: RechargePackageId;

  @IsOptional()
  @IsIn(["MOCK", "ALIPAY", "WECHAT"])
  method?: "MOCK" | "ALIPAY" | "WECHAT";
}
