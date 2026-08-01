import { IsEmail, IsString, MinLength, MaxLength } from "class-validator";

export class RegisterDto {
  @IsEmail({}, { message: "邮箱格式不正确" })
  email!: string;

  @IsString()
  @MinLength(6, { message: "密码至少 6 位" })
  @MaxLength(64, { message: "密码最多 64 位" })
  password!: string;

  @IsString()
  @MinLength(1, { message: "昵称不能为空" })
  @MaxLength(20, { message: "昵称最多 20 个字" })
  name!: string;
}
