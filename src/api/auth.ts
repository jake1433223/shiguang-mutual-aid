import client from "./client";
import type {
  AuthResult,
  ForgotPasswordPayload,
  LoginPayload,
  MessageResult,
  RegisterPayload,
  ResendVerificationPayload,
  ResetPasswordPayload,
  User,
  VerifyEmailPayload,
} from "@/types/api";

export const authApi = {
  /** 登录 */
  login(payload: LoginPayload): Promise<AuthResult> {
    return client.post("/auth/login", payload);
  },
  /** 注册 */
  register(payload: RegisterPayload): Promise<AuthResult> {
    return client.post("/auth/register", payload);
  },
  /** 当前用户信息 */
  me(): Promise<User> {
    return client.get("/auth/me");
  },
  /** 邮箱验证（点击邮件链接后调用） */
  verifyEmail(payload: VerifyEmailPayload): Promise<MessageResult> {
    return client.post("/auth/verify-email", payload);
  },
  /** 重新发送验证邮件 */
  resendVerification(
    payload: ResendVerificationPayload,
  ): Promise<MessageResult> {
    return client.post("/auth/resend-verification", payload);
  },
  /** 发起找回密码（发送重置邮件） */
  forgotPassword(payload: ForgotPasswordPayload): Promise<MessageResult> {
    return client.post("/auth/forgot-password", payload);
  },
  /** 重置密码（提交新密码 + token） */
  resetPassword(payload: ResetPasswordPayload): Promise<MessageResult> {
    return client.post("/auth/reset-password", payload);
  },
};
