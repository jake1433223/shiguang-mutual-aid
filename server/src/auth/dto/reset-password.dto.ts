import { IsString, IsNotEmpty, IsEmail, MinLength, MaxLength } from "class-validator";

/** 找回密码：提交邮箱，后端发重置链接 */
export class ForgotPasswordDto {
  @IsEmail({}, { message: "邮箱格式不正确" })
  email!: string;
}

/** 重置密码：从邮件链接拿到 token，连同新密码提交 */
export class ResetPasswordDto {
  @IsString()
  @IsNotEmpty({ message: "token 不能为空" })
  token!: string;

  @IsString()
  @MinLength(6, { message: "密码至少 6 位" })
  @MaxLength(64, { message: "密码最多 64 位" })
  newPassword!: string;
}
