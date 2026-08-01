import { IsEnum, IsOptional, IsString, MaxLength } from "class-validator";

export enum ReportReasonEnum {
  SPAM = "SPAM",
  ABUSE = "ABUSE",
  PORNOGRAPHY = "PORNOGRAPHY",
  FRAUD = "FRAUD",
  OTHER = "OTHER",
}

export enum ReportTargetTypeEnum {
  DEMAND = "DEMAND",
  COMMENT = "COMMENT",
  USER = "USER",
}

export class CreateReportDto {
  @IsEnum(ReportReasonEnum)
  reason!: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @IsEnum(ReportTargetTypeEnum)
  targetType!: string;

  @IsString()
  targetId!: string;
}
