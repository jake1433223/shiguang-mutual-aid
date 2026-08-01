import { IsEnum, IsOptional, IsString, MaxLength } from "class-validator";

export enum ApplicationStatusEnum {
  ACCEPTED = "ACCEPTED",
  REJECTED = "REJECTED",
  COMPLETED = "COMPLETED",
}

export class UpdateApplicationDto {
  @IsEnum(ApplicationStatusEnum)
  status!: ApplicationStatusEnum;
}

export class CreateApplicationDto {
  @IsOptional()
  @IsString()
  @MaxLength(500)
  message?: string;
}
