import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { ThrottlerModule, ThrottlerGuard } from "@nestjs/throttler";
import { APP_GUARD } from "@nestjs/core";
import { PrismaModule } from "./prisma/prisma.module";
import { AuthModule } from "./auth/auth.module";
import { UsersModule } from "./users/users.module";
import { DemandsModule } from "./demands/demands.module";
import { ApplicationsModule } from "./applications/applications.module";
import { CommentsModule } from "./comments/comments.module";
import { TestimonialsModule } from "./testimonials/testimonials.module";
import { CategoriesModule } from "./categories/categories.module";
import { NotificationsModule } from "./notifications/notifications.module";
import { ReportsModule } from "./reports/reports.module";
import { AdminModule } from "./admin/admin.module";
import { StatsModule } from "./stats/stats.module";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    // 全局限流：默认每分钟 60 次请求
    ThrottlerModule.forRoot([
      {
        name: "default",
        ttl: 60_000,
        limit: 60,
      },
      {
        name: "auth",
        ttl: 60_000,
        limit: 10,
      },
      {
        name: "report",
        ttl: 60_000,
        limit: 5,
      },
    ]),
    PrismaModule,
    AuthModule,
    UsersModule,
    DemandsModule,
    ApplicationsModule,
    CommentsModule,
    TestimonialsModule,
    CategoriesModule,
    NotificationsModule,
    ReportsModule,
    AdminModule,
    StatsModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
