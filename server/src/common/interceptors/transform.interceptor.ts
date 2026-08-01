import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from "@nestjs/common";
import { Observable, map } from "rxjs";

/**
 * 统一响应格式拦截器
 * 把 controller 返回的原始数据包成 { code: 0, data: T, message: "ok" }
 */
@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, { code: number; data: T; message: string }> {
  intercept(
    _context: ExecutionContext,
    next: CallHandler<T>
  ): Observable<{ code: number; data: T; message: string }> {
    return next.handle().pipe(
      map((data) => ({
        code: 0,
        data,
        message: "ok",
      }))
    );
  }
}
