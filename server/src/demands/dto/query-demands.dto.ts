import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from "class-validator";
import { Type } from "class-transformer";
import { DemandCategoryEnum } from "./create-demand.dto";

export enum DemandStatusEnum {
  OPEN = "OPEN",
  IN_PROGRESS = "IN_PROGRESS",
  DONE = "DONE",
  CANCELLED = "CANCELLED",
}

export enum SortEnum {
  LATEST = "latest",
  REWARD_DESC = "reward-desc",
  APPLICANTS_DESC = "applicants-desc",
}

export class QueryDemandsDto {
  @IsOptional()
  @IsEnum(DemandCategoryEnum)
  category?: DemandCategoryEnum;

  @IsOptional()
  @IsEnum(DemandStatusEnum)
  status?: DemandStatusEnum;

  @IsOptional()
  @IsEnum(SortEnum)
  sort?: SortEnum = SortEnum.LATEST;

  @IsOptional()
  @IsString()
  keyword?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  pageSize?: number = 12;
}
