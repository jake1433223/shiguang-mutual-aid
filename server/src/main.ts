import { NestFactory } from "@nestjs/core";
import { ValidationPipe, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import helmet from "helmet";
import { AppModule } from "./app.module";
import { HttpExceptionFilter } from "./common/filters/http-exception.filter";
import { TransformInterceptor } from "./common/interceptors/transform.interceptor";

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ["log", "error", "warn", "debug"],
  });

  const configService = app.get(ConfigService);
  const port = configService.get<number>("PORT", 3000);
  const corsOrigin = configService.get<string>("CORS_ORIGIN", "http://localhost:5173");
  const nodeEnv = process.env.NODE_ENV || "development";

  // 生产环境安全校验：禁止使用默认 JWT 密钥，防止 token 被伪造
  const jwtSecret = configService.get<string>("JWT_SECRET", "");
  if (nodeEnv === "production") {
    const DEFAULT_SECRET = "shiguang-dev-secret-change-in-production-2026";
    if (!jwtSecret || jwtSecret === DEFAULT_SECRET || jwtSecret.length < 32) {
      Logger.error(
        "❌ 生产环境必须配置强 JWT_SECRET（长度 ≥ 32）！请参考 server/.env.example",
        "Bootstrap",
      );
      process.exit(1);
    }
  }

  // 安全 HTTP 头：防 clickjacking、MIME sniffing、XSS 等
  app.use(
    helmet({
      contentSecurityPolicy: false, // 前端开发期 Vite 需要 inline script，由前端自己的 CSP 处理
      crossOriginResourcePolicy: { policy: "cross-origin" },
    }),
  );

  // CORS：允许前端跨域（支持逗号分隔的多个来源）
  const allowedOrigins = corsOrigin
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  const corsOptions = allowedOrigins.includes("*")
    ? { origin: "*", credentials: false }
    : {
        origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
          if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
          } else {
            callback(new Error("CORS: 来源不允许"), false);
          }
        },
        credentials: true,
      };

  app.enableCors({
    ...corsOptions,
    methods: ["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
  });

  // 全局前缀
  app.setGlobalPrefix("api");

  // 全局 ValidationPipe：自动校验 DTO + 白名单过滤
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    })
  );

  // 全局异常过滤器：统一错误响应格式
  app.useGlobalFilters(new HttpExceptionFilter());

  // 全局响应拦截器：统一 { code, data, message } 包
  app.useGlobalInterceptors(new TransformInterceptor());

  await app.listen(port);
  Logger.log(`🚀 后端服务已启动：http://localhost:${port}`, "Bootstrap");
  Logger.log(`🛡️  CORS 允许来源：${corsOrigin}`, "Bootstrap");
  Logger.log(`📡 API 前缀：/api`, "Bootstrap");
}
bootstrap();
