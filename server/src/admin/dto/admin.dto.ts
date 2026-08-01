import { Type } from "class-transformer";
import {
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from "class-validator";

// ============================================================
// 用户管理
// ============================================================

export class BanUserDto {
  @IsString()
  @MaxLength(200)
  reason!: string;
}

export class AdjustCoinsDto {
  @Type(() => Number)
  @IsInt()
  // 允许负数（扣减）
  amount!: number;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  remark?: string;
}

export class AdjustCreditDto {
  @Type(() => Number)
  @IsInt()
  // 允许负数
  delta!: number;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  remark?: string;
}

// ============================================================
// 需求管理
// ============================================================

export class TakeDownDemandDto {
  @IsString()
  @MaxLength(200)
  reason!: string;
}

// ============================================================
// 举报管理
// ============================================================

export class ResolveReportDto {
  @IsOptional()
  @IsString()
  @MaxLength(500)
  resolution?: string;
}

// ============================================================
// 通用查询
// ============================================================

export class AdminPaginationDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  pageSize?: number;

  @IsOptional()
  @IsString()
  keyword?: string;
}

export class AdminUserListDto extends AdminPaginationDto {
  @IsOptional()
  @IsString()
  role?: string; // USER | ADMIN

  @IsOptional()
  @IsString()
  banned?: string; // "true" | "false"
}

export class AdminDemandListDto extends AdminPaginationDto {
  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsString()
  takenDown?: string; // "true" | "false"
}

export class AdminReportListDto extends AdminPaginationDto {
  @IsOptional()
  @IsString()
  status?: string; // PENDING | RESOLVED | DISMISSED

  @IsOptional()
  @IsString()
  targetType?: string;
}

export class AdminCommentListDto extends AdminPaginationDto {
  // keyword 已在 AdminPaginationDto 中
}

export class AdminAuditLogListDto extends AdminPaginationDto {
  @IsOptional()
  @IsString()
  action?: string;
}
