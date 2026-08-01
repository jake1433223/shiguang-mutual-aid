import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from "@nestjs/common";
import { Request, Response } from "express";

/**
 * 全局异常过滤器
 * 把所有异常统一成 { code: number, message: string, data: null }
 */
@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = "服务器内部错误";
    let code = -1;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res = exception.getResponse();
      if (typeof res === "string") {
        message = res;
      } else if (typeof res === "object" && res !== null) {
        const r = res as Record<string, unknown>;
        // class-validator 抛出的错误是 { message: string[] }
        if (Array.isArray(r.message)) {
          message = (r.message as string[]).join("; ");
        } else if (typeof r.message === "string") {
          message = r.message;
        }
        if (typeof r.code === "number") code = r.code;
      }
      // 429 限流：返回友好中文提示
      if (status === HttpStatus.TOO_MANY_REQUESTS) {
        message = "请求过于频繁，请稍后再试";
      }
    } else if (exception instanceof Error) {
      message = exception.message;
      this.logger.error(`未处理异常: ${exception.message}`, exception.stack);
    }

    // 业务错误码：HTTP 状态码 * 10 + 偏移（简化方案）
    if (code === -1) code = status;

    response.status(status).json({
      code,
      message,
      data: null,
      path: request.url,
      timestamp: new Date().toISOString(),
    });
  }
}
