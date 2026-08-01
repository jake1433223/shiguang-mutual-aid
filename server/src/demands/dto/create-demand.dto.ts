import { IsArray, IsDateString, IsEnum, IsInt, IsOptional, IsString, Max, MaxLength, Min, MinLength } from "class-validator";

export enum DemandCategoryEnum {
  TECH = "TECH",
  DESIGN = "DESIGN",
  TRANSLATE = "TRANSLATE",
  STUDY = "STUDY",
  ERRAND = "ERRAND",
  OTHER = "OTHER",
}

export class CreateDemandDto {
  @IsString()
  @MinLength(4, { message: "标题至少 4 个字" })
  @MaxLength(60, { message: "标题最多 60 个字" })
  title!: string;

  @IsString()
  @MinLength(10, { message: "描述至少 10 个字" })
  @MaxLength(2000, { message: "描述最多 2000 个字" })
  desc!: string;

  @IsEnum(DemandCategoryEnum, { message: "分类不合法" })
  category!: DemandCategoryEnum;

  @IsInt()
  @Min(1, { message: "奖励至少 1 拾光币" })
  @Max(10000, { message: "奖励最多 10000 拾光币" })
  reward!: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @MaxLength(10, { each: true, message: "每个标签最多 10 个字" })
  tags?: string[];

  @IsOptional()
  @IsString()
  @MaxLength(100)
  location?: string;

  @IsDateString({}, { message: "截止日期格式不正确" })
  deadline!: string;
}
