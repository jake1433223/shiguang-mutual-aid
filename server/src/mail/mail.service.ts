import { Injectable, OnModuleInit, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import * as nodemailer from "nodemailer";
import type { Transporter } from "nodemailer";

/**
 * 邮件服务
 *
 * 工作模式：
 * - 真实 SMTP：配置 SMTP_HOST/PORT/USER/PASS 后发送真实邮件
 * - 测试模式：未配置时自动用 Ethereal 假邮箱，邮件预览链接打印到控制台
 *
 * 提供方法：
 * - sendVerificationEmail  注册邮箱验证
 * - sendPasswordResetEmail 找回密码
 * - sendMail               通用发送
 */
@Injectable()
export class MailService implements OnModuleInit {
  private readonly logger = new Logger(MailService.name);
  private transporter: Transporter | null = null;
  private isTestMode = false;

  constructor(private config: ConfigService) {}

  async onModuleInit() {
    const host = this.config.get<string>("SMTP_HOST");
    const port = this.config.get<string>("SMTP_PORT");
    const user = this.config.get<string>("SMTP_USER");
    const pass = this.config.get<string>("SMTP_PASS");

    if (host && port && user && pass) {
      // 真实 SMTP
      this.transporter = nodemailer.createTransport({
        host,
        port: Number(port),
        secure: Number(port) === 465,
        auth: { user, pass },
      });
      this.isTestMode = false;
      this.logger.log(`✅ 邮件服务已连接 SMTP: ${host}:${port}`);
    } else {
      // Ethereal 测试模式：邮件不会真正发送，预览链接打印到控制台
      try {
        const testAccount = await nodemailer.createTestAccount();
        this.transporter = nodemailer.createTransport({
          host: "smtp.ethereal.email",
          port: 587,
          secure: false,
          auth: { user: testAccount.user, pass: testAccount.pass },
        });
        this.isTestMode = true;
        this.logger.warn(`⚠️  邮件服务运行在测试模式（Ethereal），邮件不会真正发送`);
        this.logger.log(`测试账号: ${testAccount.user}`);
      } catch (e) {
        this.logger.error(`❌ 创建测试邮件账号失败：${(e as Error).message}`);
      }
    }
  }

  private getFrom(): string {
    return (
      this.config.get<string>("SMTP_FROM") ||
      "拾光互助 <no-reply@shiguang.dev>"
    );
  }

  /** 发送注册验证邮件 */
  async sendVerificationEmail(
    to: string,
    token: string,
    name: string,
  ): Promise<void> {
    const appUrl = this.config.get<string>("APP_URL") || "http://localhost:5173";
    const link = `${appUrl}/verify-email?token=${token}`;
    const subject = "【拾光互助】验证你的邮箱";
    const html = this.renderTemplate({
      title: `你好，${name} 👋`,
      body: `感谢注册拾光互助！请点击下方按钮验证你的邮箱：`,
      ctaText: "验证邮箱",
      ctaLink: link,
      footer: `此链接 30 分钟内有效。如果你没有注册过拾光互助，请忽略此邮件。`,
    });
    await this.sendMail(to, subject, html);
  }

  /** 发送找回密码邮件 */
  async sendPasswordResetEmail(
    to: string,
    token: string,
    name: string,
  ): Promise<void> {
    const appUrl = this.config.get<string>("APP_URL") || "http://localhost:5173";
    const link = `${appUrl}/reset-password?token=${token}`;
    const subject = "【拾光互助】重置你的密码";
    const html = this.renderTemplate({
      title: `你好，${name}`,
      body: `我们收到了你重置密码的请求。请点击下方按钮设置新密码：`,
      ctaText: "重置密码",
      ctaLink: link,
      footer: `此链接 30 分钟内有效。如果不是你本人操作，请忽略此邮件，你的密码不会变。`,
    });
    await this.sendMail(to, subject, html);
  }

  /** 通用邮件发送 */
  async sendMail(to: string, subject: string, html: string): Promise<void> {
    if (!this.transporter) {
      throw new Error("邮件服务未初始化");
    }
    const info = await this.transporter.sendMail({
      from: this.getFrom(),
      to,
      subject,
      html,
    });
    if (this.isTestMode) {
      const previewUrl = nodemailer.getTestMessageUrl(info);
      this.logger.log(
        `📧 [测试] 邮件已发送到 ${to}，预览链接：${previewUrl}`,
      );
    } else {
      this.logger.log(`📧 邮件已发送到 ${to}，主题：${subject}`);
    }
  }

  /** 渲染统一邮件模板 */
  private renderTemplate(opts: {
    title: string;
    body: string;
    ctaText: string;
    ctaLink: string;
    footer: string;
  }): string {
    return `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 560px; margin: 0 auto; padding: 32px; background: #ffffff;">
        <div style="text-align: center; margin-bottom: 24px;">
          <span style="display: inline-block; width: 48px; height: 48px; line-height: 48px; border-radius: 12px; background: #dcfce7; color: #16a34a; font-size: 24px;">✦</span>
          <span style="margin-left: 8px; font-size: 18px; font-weight: 700; color: #0a0a0a;">拾光互助</span>
        </div>
        <h2 style="color: #0a0a0a; margin: 0 0 16px;">${opts.title}</h2>
        <p style="color: #404040; font-size: 15px; line-height: 1.6;">${opts.body}</p>
        <p style="text-align: center; margin: 32px 0;">
          <a href="${opts.ctaLink}" style="display: inline-block; background: #16a34a; color: #ffffff; padding: 12px 32px; border-radius: 9999px; text-decoration: none; font-weight: 600; font-size: 15px;">${opts.ctaText}</a>
        </p>
        <p style="color: #737373; font-size: 13px; line-height: 1.6;">或复制此链接到浏览器：<br><span style="color: #16a34a; word-break: break-all;">${opts.ctaLink}</span></p>
        <p style="color: #737373; font-size: 13px; line-height: 1.6;">${opts.footer}</p>
        <hr style="border: none; border-top: 1px solid #e5e5e5; margin: 32px 0;">
        <p style="color: #a3a3a3; font-size: 12px; text-align: center;">拾光互助团队 · 此邮件由系统自动发送，请勿回复</p>
      </div>
    `;
  }
}
