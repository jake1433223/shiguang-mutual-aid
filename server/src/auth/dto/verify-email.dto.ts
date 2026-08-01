import { IsString, IsNotEmpty, IsEmail } from "class-validator";

/** 验证邮箱：前端从邮件链接里拿到 token 后调此接口 */
export class VerifyEmailDto {
  @IsString()
  @IsNotEmpty({ message: "token 不能为空" })
  token!: string;
}

/** 重新发送验证邮件 */
export class ResendVerificationDto {
  @IsEmail({}, { message: "邮箱格式不正确" })
  email!: string;
}
